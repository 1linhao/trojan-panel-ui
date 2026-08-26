const ADMIN_GROUPS = [
  { key: 'overview', label: '概览', items: [{ key: '/dashboard/index', label: '仪表板', mobileLabel: '首页', icon: 'data' }] },
  { key: 'management', label: '管理', items: [
    { key: '/account-manage/account-list', label: '账号管理', mobileLabel: '账号', icon: 'profile', roles: ['sysadmin', 'admin'] },
    { key: '/node-manage/node-list', label: '节点管理', mobileLabel: '节点', icon: 'control' },
    { key: '/server-manage/server-list', label: '服务器', mobileLabel: '服务器', icon: 'surface', roles: ['sysadmin', 'admin'] },
    { key: '/server-manage/kernel-upgrade', label: '内核升级', mobileLabel: '内核', icon: 'info', roles: ['sysadmin'] }
  ] },
  { key: 'operations', label: '运维', items: [
    { key: '/taskManage/task-list', label: '文件任务', mobileLabel: '任务', icon: 'menu', roles: ['sysadmin'] },
    { key: '/emailManage/email-record', label: '邮件记录', mobileLabel: '邮件', icon: 'info', roles: ['sysadmin', 'admin'] },
    { key: '/system/black-list', label: '黑名单', mobileLabel: '黑名单', icon: 'close', roles: ['sysadmin'] }
  ] },
  { key: 'system', label: '系统', items: [
    { key: '/system/base-config', label: '系统配置', mobileLabel: '设置', icon: 'control', roles: ['sysadmin'] },
    { key: '/modify/index', label: '个人资料', mobileLabel: '我的', icon: 'profile' }
  ] }
]
const USER_GROUPS = [{ key: 'mine', label: '我的', items: [
  { key: '/dashboard/index', label: '我的首页', mobileLabel: '首页', icon: 'home' },
  { key: '/node-manage/node-list', label: '我的节点', mobileLabel: '节点', icon: 'control' },
  { key: '/modify/index', label: '个人资料', mobileLabel: '我的', icon: 'profile' }
] }]
const TITLES = { '/dashboard/index': '仪表板', '/account-manage/account-list': '账号管理', '/node-manage/node-list': '节点管理', '/server-manage/server-list': '服务器管理', '/server-manage/server-detail': '服务器详情', '/server-manage/kernel-upgrade': '内核升级', '/taskManage/task-list': '文件任务', '/emailManage/email-record': '邮件记录', '/system/black-list': '黑名单', '/system/base-config': '系统配置', '/modify/index': '个人资料' }

export function createTrojanPanelShellModel({ roles = [], username = '', activePath = '', fallbackTitle = '' } = {}) {
  const isAdmin = roles.some((role) => role === 'sysadmin' || role === 'admin')
  const source = isAdmin ? ADMIN_GROUPS : USER_GROUPS
  const navGroups = source.map((group) => ({
    key: group.key,
    label: group.label,
    items: group.items
      .filter((item) => !item.roles || item.roles.some((role) => roles.includes(role)))
      .map((item) => ({ key: item.key, label: item.label, mobileLabel: item.mobileLabel, icon: item.icon }))
  })).filter((group) => group.items.length)
  const mobileKeys = navGroups.flatMap((group) => group.items.map((item) => item.key))
  const title = !isAdmin && activePath === '/dashboard/index' ? '我的首页' : !isAdmin && activePath === '/node-manage/node-list' ? '我的节点' : TITLES[activePath] || fallbackTitle
  return { brand: { name: 'Trojan Panel', mark: 'T', subtitle: 'LIQUID GLASS' }, title, activeKey: activePath, navGroups, mobileKeys, user: { name: username || 'Trojan Panel', initials: (username || 'TP').slice(0, 2).toUpperCase() } }
}
