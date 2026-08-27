const { spawn } = require('child_process')
const http = require('http')

const ROOT = process.cwd()
const WEB_URL = 'http://127.0.0.1:8890'
const DRIVER_URL = 'http://127.0.0.1:9516/wd/hub'
const children = []

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  })
  child.output = ''
  child.stdout.on('data', (chunk) => {
    child.output += chunk
    process.stdout.write(chunk)
  })
  child.stderr.on('data', (chunk) => {
    child.output += chunk
    process.stderr.write(chunk)
  })
  children.push(child)
  return child
}

function step(message) {
  process.stdout.write(`[traffic-date-e2e] ${message}\n`)
}

function request(url, options = {}, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const payload = body ? JSON.stringify(body) : ''
    const req = http.request(
      parsed,
      {
        method: options.method || 'GET',
        headers: payload
          ? {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': Buffer.byteLength(payload)
            }
          : undefined
      },
      (res) => {
        let text = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => { text += chunk })
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode} ${text}`))
            return
          }
          const contentType = res.headers['content-type'] || ''
          resolve(text && contentType.includes('application/json') ? JSON.parse(text) : text)
        })
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
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`等待 ${label} 超时${lastError ? `：${lastError.message}` : ''}`)
}

async function webdriver(path, method = 'GET', body) {
  let response
  try {
    response = await request(`${DRIVER_URL}${path}`, { method }, body)
  } catch (error) {
    throw new Error(`${method} ${path}：${error.message}`)
  }
  return response && Object.prototype.hasOwnProperty.call(response, 'value')
    ? response.value
    : response
}

async function main() {
  start(process.execPath, ['tests/mock-api-server.js'], {
    env: { ...process.env, MOCK_API_PORT: '18081' }
  })
  const web = start('npm', ['run', 'serve', '--', '--port', '8890', '--no-progress'], {
    env: {
      ...process.env,
      NODE_OPTIONS: '--openssl-legacy-provider',
      MOCK_API_TARGET: 'http://127.0.0.1:18081'
    }
  })
  start('chromedriver', ['--port=9516', '--url-base=/wd/hub', '--log-level=WARNING'])

  step('等待隔离服务')
  await waitFor(() => request('http://127.0.0.1:18081/auth/setting'), 'mock API')
  await waitFor(
    () => web.output.includes('Compiled successfully') || web.output.includes('Compiled with'),
    'Vue 编译',
    60000
  )
  await waitFor(() => request(WEB_URL), '开发服务器', 60000)
  await waitFor(() => request(`${DRIVER_URL}/status`), 'ChromeDriver')

  step('创建无头浏览器会话')
  const session = await webdriver('/session', 'POST', {
    capabilities: {
      alwaysMatch: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          binary: '/usr/bin/chromium',
          args: [
            '--headless=new',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1440,1200'
          ]
        }
      }
    }
  })
  const sessionId = session.sessionId
  const sessionPath = `/session/${sessionId}`
  const execute = (script, args = []) =>
    webdriver(`${sessionPath}/execute/sync`, 'POST', { script, args })
  const navigate = (url) =>
    webdriver(`${sessionPath}/url`, 'POST', { url })
  const find = (using, value) =>
    webdriver(`${sessionPath}/element`, 'POST', { using, value })
  const click = (element) =>
    webdriver(`${sessionPath}/element/${element['element-6066-11e4-a52e-4f735466cecf']}/click`, 'POST', {})

  try {
    step('注入管理员预览令牌并打开首页')
    await navigate(WEB_URL)
    await execute("document.cookie='Authorization=Bearer mock-token; path=/'")
    await navigate(`${WEB_URL}/#/dashboard/index`)
    step('等待全部排行数据')
    await waitFor(
      async () => (await execute("return document.body.innerText.includes('rank-total')")),
      '初始排行数据',
      10000
    )

    step('切换按月并选择 2026-07')
    const monthButton = await find(
      'css selector',
      '.dashboard-detail-grid > .glass.card:first-child .dashboard-segment button:nth-child(2)'
    )
    await click(monthButton)
    const monthTrigger = await waitFor(
      () => find('css selector', '.dashboard-detail-grid > .glass.card:first-child .traffic-rank-date .liquid-date-picker__trigger'),
      '月份选择器'
    )
    await click(monthTrigger)
    const selectedMonth = await execute("const input = document.querySelector('.dashboard-detail-grid > .glass.card:first-child .traffic-rank-date .liquid-date-picker__manual input'); input.value = '2026-07'; input.dispatchEvent(new Event('input', { bubbles: true })); return input.value")
    if (selectedMonth !== '2026-07') throw new Error(`月份输入未更新：${selectedMonth}`)
    const monthConfirm = await find(
      'css selector',
      '.dashboard-detail-grid > .glass.card:first-child .traffic-rank-date .liquid-date-picker__popover footer .is-primary'
    )
    await click(monthConfirm)

    step('等待新月份排行数据')
    await waitFor(
      async () => (await execute("return document.body.innerText.includes('rank-2026-07')")),
      '切换月份后的排行数据',
      10000
    )

    step('切换按日并选择 2026-07-15')
    const dayButton = await find(
      'css selector',
      '.dashboard-detail-grid > .glass.card:first-child .dashboard-segment button:nth-child(3)'
    )
    await click(dayButton)
    const dayTrigger = await waitFor(
      () => find('css selector', '.dashboard-detail-grid > .glass.card:first-child .traffic-rank-date .liquid-date-picker__trigger'),
      '日期选择器'
    )
    await click(dayTrigger)
    const selectedDay = await execute("const input = document.querySelector('.liquid-date-picker__manual input'); input.value = '2026-07-15'; input.dispatchEvent(new Event('input', { bubbles: true })); return input.value")
    if (selectedDay !== '2026-07-15') throw new Error(`日期输入未更新：${selectedDay}`)
    const dayConfirm = await find(
      'css selector',
      '.dashboard-detail-grid > .glass.card:first-child .traffic-rank-date .liquid-date-picker__popover footer .is-primary'
    )
    await click(dayConfirm)
    await waitFor(
      async () => (await execute("return document.body.innerText.includes('rank-2026-07-15')")),
      '切换日期后的排行数据',
      10000
    )
    process.stdout.write('PASS dashboard traffic rank updates after month and day changes\n')
  } finally {
    await webdriver(`${sessionPath}`, 'DELETE').catch(() => {})
  }
}

main()
  .catch((error) => {
    process.stderr.write(`FAIL ${error.stack || error.message}\n`)
    process.exitCode = 1
  })
  .finally(() => {
    for (const child of children.reverse()) child.kill('SIGTERM')
  })
