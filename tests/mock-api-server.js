const http = require('http')

const ok = (data) =>
  JSON.stringify({ code: 20000, type: 'success', message: '', data })
const page = (key, rows) => ({
  [key]: rows,
  pageNum: 1,
  pageSize: 20,
  total: rows.length
})

const account = {
  id: 2,
  username: 'glassdemo',
  email: 'demo@example.com',
  roleId: 3,
  roles: ['user'],
  deleted: 0,
  quota: 107374182400,
  download: 12884901888,
  upload: 4294967296,
  expireTime: Date.now() + 30 * 86400000,
  createTime: '2026-08-01T12:00:00+08:00'
}

const accounts = Array.from({ length: 36 }, (_, index) => ({
  ...account,
  id: index + 2,
  username: index === 0 ? account.username : `glassuser${index + 1}`,
  email: index === 0 ? account.email : `user${index + 1}@example.com`,
  download: account.download + index * 268435456,
  upload: account.upload + index * 67108864
}))

const captchaSvg =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="236" height="84" viewBox="0 0 236 84"><path d="M4 62C42 7 76 79 118 28s74 39 114-6" fill="none" stroke="#0a7cff" stroke-opacity=".28" stroke-width="3"/><path d="M8 24l218 42M18 72L216 14" stroke="#8d56d9" stroke-opacity=".2" stroke-width="2"/><text x="118" y="57" text-anchor="middle" font-family="ui-monospace,monospace" font-size="39" font-weight="700" font-style="italic" letter-spacing="10" fill="#1767ba">K7M4</text></svg>'
  )

const node = {
  id: 1,
  nodeServerId: 1,
  nodeSubId: 1,
  nodeTypeId: 1,
  name: 'Tokyo Reality',
  domain: 'jp.example.com',
  port: 443,
  priority: 100,
  clients: ['sing-box', 'clash-meta', 'v2ray', 'shadowrocket'],
  status: 1,
  createTime: '2026-08-01T12:00:00+08:00',
  serverTraffic: {
    period: 'month',
    limitMode: 'combined',
    totalLimit: 1099511627776,
    totalRemaining: 824633720832
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1')
  const path = url.pathname.replace(/^\/api/, '')
  const isUserSession = req.headers.authorization === 'Bearer user-token'
  const isUserLogin = (req.headers.referer || '').startsWith(
    'http://localhost:'
  )
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  const responses = {
    '/auth/setting': {
      registerEnable: 1,
      registerQuota: 10240,
      registerExpireDays: 30,
      trafficRankEnable: 1,
      captchaEnable: 1,
      emailEnable: 0,
      systemName: 'Trojan Panel'
    },
    '/auth/generateCaptcha/': { captchaId: 'mock', captchaImg: captchaSvg },
    '/auth/generateCaptcha': { captchaId: 'mock', captchaImg: captchaSvg },
    '/auth/login': { token: isUserLogin ? 'user-token' : 'mock-token' },
    '/auth/register': null,
    '/account/getAccountInfo': isUserSession
      ? { id: account.id, username: account.username, roles: account.roles }
      : {
          id: 1,
          username: 'sysadmin',
          roles: ['sysadmin', 'admin', 'user']
        },
    '/account/logout': null,
    '/account/selectAccountPage': page('accounts', accounts),
    '/account/selectAccountById': account,
    '/account/exportOptions': [
      {
        id: 'sing-box',
        name: 'sing-box',
        templates: [{ id: 'tun', name: 'TUN' }],
        formats: ['url']
      }
    ],
    '/role/selectRoleList': [
      { id: 1, name: 'sysadmin', desc: 'System Admin' },
      { id: 2, name: 'admin', desc: 'Admin' },
      { id: 3, name: 'user', desc: 'User' }
    ],
    '/dashboard/panelGroup': {
      quota: -1,
      residualFlow: -1,
      nodeCount: 1,
      expireTime: 4078656000000,
      accountCount: accounts.length,
      cpuUsed: 28,
      memUsed: 43,
      diskUsed: 37
    },
    '/dashboard/trafficRank': [
      {
        username: 'glassdemo',
        upload: 4294967296,
        download: 12884901888,
        trafficUsed: 17179869184
      }
    ],
    '/dashboard/serverTrafficUsage': {
      rows: [
        {
          accountId: 2,
          username: 'glassdemo',
          nodeServerId: 1,
          nodeServerName: 'Tokyo',
          upload: 4294967296,
          download: 12884901888,
          total: 17179869184
        }
      ],
      pageNum: 1,
      pageSize: 20,
      total: 1
    },
    '/node/selectNodePage': page('nodes', [
      isUserSession ? { ...node, status: 0 } : node
    ]),
    '/node/selectNodeById': Object.assign({}, node, {
      password: 'demo',
      uuid: '00000000-0000-0000-0000-000000000000',
      alterId: 0,
      xrayProtocol: 'vless',
      xraySettingsEntity: {
        fallbacks: [],
        network: 'tcp',
        accounts: [],
        udp: true
      },
      xrayStreamSettingsEntity: {
        network: 'tcp',
        security: 'reality',
        tlsSettings: {},
        realitySettings: {
          dest: 'www.apple.com:443',
          xver: 0,
          serverNames: ['www.apple.com'],
          fingerprint: 'chrome',
          privateKey: 'mock',
          shortIds: ['abcd'],
          spiderX: '/'
        },
        wsSettings: { path: '/', headers: {} }
      }
    }),
    '/node/selectNodeInfo': Object.assign({}, node, {
      password: 'demo',
      uuid: '00000000-0000-0000-0000-000000000000',
      xrayProtocol: 'vless',
      xraySettingsEntity: { fallbacks: [] },
      xrayStreamSettingsEntity: {
        network: 'tcp',
        security: 'reality',
        tlsSettings: {},
        realitySettings: {},
        wsSettings: {}
      }
    }),
    '/node/nodeDefault': {
      publicKey: 'mock-public',
      privateKey: 'mock-private',
      shortId: 'abcd1234',
      spiderX: '/'
    },
    '/nodeType/selectNodeTypeList': [
      { id: 1, name: 'xray' },
      { id: 2, name: 'trojan-go' },
      { id: 3, name: 'hysteria' },
      { id: 4, name: 'naiveproxy' },
      { id: 5, name: 'hysteria2' }
    ],
    '/nodeServer/selectNodeServerList': [{ id: 1, name: 'Tokyo' }],
    '/nodeServer/selectNodeServerPage': page('nodeServers', [
      {
        id: 1,
        name: 'Tokyo',
        ip: 'jp.example.com',
        grpcPort: 8100,
        grpcTLSMode: 'mtls',
        grpcTLSServerName: 'core.example.com',
        trafficPeriod: 'month',
        trafficLimitMode: 'combined',
        trafficTotalLimit: 1099511627776,
        trafficUploadLimit: 0,
        trafficDownloadLimit: 0,
        status: 1,
        trojanPanelCoreVersion: '2.3.0',
        kernelSummary: 'xray 25.8.3'
      }
    ]),
    '/nodeServer/selectNodeServerById': {
      id: 1,
      name: 'Tokyo',
      ip: 'jp.example.com',
      grpcPort: 8100,
      grpcTLSMode: 'mtls',
      grpcTLSServerName: 'core.example.com',
      trafficPeriod: 'month',
      trafficLimitMode: 'combined',
      trafficTotalLimit: 1099511627776,
      trafficUploadLimit: 0,
      trafficDownloadLimit: 0
    },
    '/nodeServer/nodeServerState': { cpuUsed: 28, memUsed: 43, diskUsed: 37 },
    '/nodeServer/resetNodeServerTraffic': { deletedRows: 24 },
    '/kernel/releases': {
      releases: [
        { version: '25.8.3', channel: 'stable' },
        { version: '25.7.26', channel: 'stable' }
      ]
    },
    '/kernel/inventory': {
      os: 'linux',
      arch: 'amd64',
      kernels: {
        xray: { version: '25.8.3', sha256: 'mock-xray', inUse: true },
        hysteria2: { version: '2.6.3', sha256: 'mock-hysteria2', inUse: false }
      }
    },
    '/kernel/selectTaskPage': page('tasks', []),
    '/emailRecord/selectEmailRecordPage': page('emailRecords', []),
    '/fileTask/selectFileTaskPage': page('fileTasks', []),
    '/blackList/selectBlackListPage': page('blackLists', []),
    '/system/selectSystemByName': {
      id: 1,
      registerEnable: 1,
      registerQuota: 10240,
      registerExpireDays: 30,
      resetDownloadAndUploadMonth: 0,
      trafficRankEnable: 1,
      captchaEnable: 1,
      expireWarnEnable: 0,
      expireWarnDay: 0,
      emailEnable: 0,
      emailHost: '',
      emailPort: 25,
      emailUsername: '',
      emailPassword: '',
      systemName: 'Trojan Panel',
      clashRule: '',
      singBoxTun: '{}',
      singBoxOutbound: '{}',
      xrayTemplate: '{}',
      clashTemplateName: 'Default',
      singBoxTunTemplateName: 'TUN',
      singBoxOutboundTemplateName: 'Outbound',
      xrayTemplateName: 'Default'
    }
  }

  const data = Object.prototype.hasOwnProperty.call(responses, path)
    ? responses[path]
    : null
  res.end(ok(data))
})

server.listen(8081, '127.0.0.1', () => {
  process.stdout.write('Mock API listening on http://127.0.0.1:8081\n')
})
