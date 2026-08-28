const { spawn } = require('child_process')
const { writeFileSync } = require('fs')
const http = require('http')

const webUrl = process.env.LIVE_WEB_URL || 'http://127.0.0.1:18888'
const driverUrl = 'http://127.0.0.1:9518/wd/hub'
const screenshotPath =
  process.env.LIVE_SCREENSHOT || '/tmp/tp-composable-ui-live.png'

function request(url, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : ''
    const req = http.request(
      new URL(url),
      {
        method,
        headers: payload
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          : {}
      },
      (response) => {
        let text = ''
        response.on('data', (chunk) => {
          text += chunk
        })
        response.on('end', () =>
          response.statusCode >= 400
            ? reject(new Error(`${response.statusCode} ${text}`))
            : resolve(text ? JSON.parse(text) : null)
        )
      }
    )
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

async function waitFor(check, label, timeout = 30000) {
  const deadline = Date.now() + timeout
  let lastError
  while (Date.now() < deadline) {
    try {
      const result = await check()
      if (result) return result
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  throw new Error(`Timed out waiting for ${label}: ${lastError?.message || ''}`)
}

async function main() {
  const driver = spawn(
    'chromedriver',
    ['--port=9518', '--url-base=/wd/hub', '--log-level=WARNING'],
    { stdio: 'ignore' }
  )
  try {
    await waitFor(() => request(`${driverUrl}/status`), 'ChromeDriver')
    const session = (
      await request(`${driverUrl}/session`, 'POST', {
        capabilities: {
          alwaysMatch: {
            browserName: 'chrome',
            'goog:chromeOptions': {
              binary: '/usr/bin/chromium',
              args: [
                '--headless=new',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1440,1000'
              ]
            }
          }
        }
      })
    ).value
    const base = `${driverUrl}/session/${session.sessionId}`
    const command = async (path, method = 'GET', body) =>
      (await request(`${base}${path}`, method, body))?.value
    const execute = (script) =>
      command('/execute/sync', 'POST', { script, args: [] })
    const find = (selector) =>
      command('/element', 'POST', { using: 'css selector', value: selector })
    const elementId = (element) =>
      element['element-6066-11e4-a52e-4f735466cecf']
    try {
      await command('/url', 'POST', { url: webUrl })
      const username = await waitFor(
        () => find('input[autocomplete="username"]'),
        'login form'
      )
      const password = await find('input[autocomplete="current-password"]')
      const loginButtonCoverage = await execute(
        "const items=[...document.querySelectorAll('button,[role=button]')]; return {total:items.length,covered:items.filter((item)=>item.dataset.uiInteraction==='nav-lift').length,motion:document.documentElement.dataset.uiMotion,transition:getComputedStyle(document.querySelector('.auth-submit.primary')).transitionProperty}"
      )
      if (
        !loginButtonCoverage.total ||
        loginButtonCoverage.covered !== loginButtonCoverage.total ||
        !loginButtonCoverage.transition.includes('transform') ||
        !['full', 'reduced'].includes(loginButtonCoverage.motion)
      ) {
        throw new Error(
          `Login button interaction coverage failed: ${JSON.stringify(
            loginButtonCoverage
          )}`
        )
      }
      await command(`/element/${elementId(username)}/value`, 'POST', {
        text: 'sysadmin'
      })
      await command(`/element/${elementId(password)}/value`, 'POST', {
        text: '123456'
      })
      const submit = await find('.auth-submit.primary')
      await command(`/element/${elementId(submit)}/click`, 'POST', {})
      await waitFor(
        () =>
          execute(
            "return location.hash.includes('/dashboard/index') && document.body.innerText.includes('仪表板')"
          ),
        'authenticated dashboard'
      )
      if (
        await execute(
          "return Boolean(document.querySelector('.liquid-message.is-error'))"
        )
      )
        throw new Error('UI displayed an error message')
      const dashboardButtonCoverage = await execute(
        "const items=[...document.querySelectorAll('button,[role=button]')]; return {total:items.length,covered:items.filter((item)=>item.dataset.uiInteraction==='nav-lift').length}"
      )
      if (
        !dashboardButtonCoverage.total ||
        dashboardButtonCoverage.covered !== dashboardButtonCoverage.total
      ) {
        throw new Error(
          `Dashboard button interaction coverage failed: ${JSON.stringify(
            dashboardButtonCoverage
          )}`
        )
      }
      await command('/window/rect', 'POST', { width: 390, height: 844 })
      await waitFor(
        () =>
          execute(
            "const nav=document.querySelector('.prototype-mobile-nav'); return nav && getComputedStyle(nav).display !== 'none'"
          ),
        'mobile navigation'
      )
      const screenshot = await command('/screenshot')
      writeFileSync(screenshotPath, Buffer.from(screenshot, 'base64'))
      process.stdout.write(
        `PASS live stack login, dashboard, ${dashboardButtonCoverage.covered} interactive buttons, responsive navigation; screenshot ${screenshotPath}\n`
      )
    } finally {
      await request(base, 'DELETE').catch(() => {})
    }
  } finally {
    driver.kill('SIGTERM')
  }
}

main().catch((error) => {
  process.stderr.write(`FAIL ${error.stack || error.message}\n`)
  process.exitCode = 1
})
