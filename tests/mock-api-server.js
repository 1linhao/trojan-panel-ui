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
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  const responses = {
    '/auth/setting': {
      registerEnable: 1,
      registerQuota: 10240,
      registerExpireDays: 30,
      trafficRankEnable: 1,
      captchaEnable: 0,
      emailEnable: 0,
      systemName: 'Trojan Panel'
    },
    '/auth/generateCaptcha/': { captchaId: 'mock', captchaImg: '' },
    '/auth/generateCaptcha': { captchaId: 'mock', captchaImg: '' },
    '/auth/login': { token: 'mock-token' },
    '/auth/register': null,
    '/account/getAccountInfo': {
      id: 1,
      username: 'sysadmin',
      roles: ['sysadmin', 'admin', 'user']
    },
    '/account/logout': null,
    '/account/selectAccountPage': page('accounts', [account]),
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
      accountCount: 2,
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
    '/node/selectNodePage': page('nodes', [node]),
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
      captchaEnable: 0,
      expireWarnEnable: 0,
      expireWarnDay: 0,
      emailEnable: 0,
      emailHost: '',
      emailPort: 25,
      emailUsername: '',
      emailPassword: '',
      systemName: 'Trojan Panel',
      clashRule: '',
      singBoxTun: '',
      singBoxOutbound: '',
      xrayTemplate: '',
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
