# LiquidAppShell

LiquidAppShell 是可跨 Vue 2 网页项目复用的响应式应用框架：桌面端提供侧边导航和顶部栏，移动端切换为分段式底部导航。它只消费一个纯数据模型并发出用户意图，不读取 Router、Vuex、权限、Cookie、Token 或业务接口。

Shell 与控件材质相互独立：本仓库只负责应用骨架、导航和响应式布局；按钮、表单、表格、浮层及材质运行时由 [LiquidUI](https://github.com/1linhao/liquid-ui) 提供。项目可以只使用 LiquidUI，也可以组合两者。

## 安装

```sh
pnpm add @liqui/liquid-ui @liqui/liquid-app-shell vue@2
```

在 npm 包正式发布前，也可以从 GitHub 安装两个仓库。

```sh
pnpm add github:1linhao/liquid-ui github:1linhao/liquid-app-shell
```

```js
import Vue from 'vue'
import { createLiquidUI } from '@liqui/liquid-ui/vue2'
import { createLiquidAppShell } from '@liqui/liquid-app-shell'
import '@liqui/liquid-ui/styles.css'
import '@liqui/liquid-app-shell/styles.css'

Vue.use(createLiquidUI())
Vue.use(createLiquidAppShell())
```

## 快速开始

```vue
<liquid-app-shell
  :model="shellModel"
  @navigate="handleNavigate"
  @logout="handleLogout"
>
  <template #header-actions>
    <liquid-button size="small">刷新</liquid-button>
  </template>

  <router-view />
</liquid-app-shell>
```

```js
export default {
  computed: {
    shellModel() {
      // 权限过滤发生在宿主 Adapter 中，不传给 Shell。
      const allowedItems = this.routes
        .filter((route) => this.canAccess(route))
        .map((route) => ({
          key: route.name,
          label: route.meta.title,
          mobileLabel: route.meta.mobileTitle,
          icon: route.meta.icon
        }))

      return {
        brand: { name: 'Acme', mark: 'A', subtitle: 'CONTROL CENTER' },
        title: this.$route.meta.title,
        activeKey: this.$route.name,
        navGroups: [{ key: 'main', label: '工作台', items: allowedItems }],
        mobileKeys: ['home', 'nodes', 'profile'],
        user: { name: this.currentUser.name, initials: 'OP' },
        busy: this.pageLoading
      }
    }
  },
  methods: {
    handleNavigate(key) {
      if (key !== this.$route.name) this.$router.push({ name: key })
    },
    async handleLogout() {
      await this.authService.logout()
      this.$router.replace({ name: 'login' })
    }
  }
}
```

## 模型契约

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `brand` | `{ name, mark?, subtitle? }` | 品牌名称、缩写与副标题 |
| `title` | `string` | 当前页面标题 |
| `activeKey` | `string?` | 当前导航项；无效值会回退到首项 |
| `navGroups` | `NavGroup[]` | 已由宿主过滤权限的导航组 |
| `mobileKeys` | `string[]?` | 移动端展示的导航项 key；默认使用全部项目 |
| `user` | `{ name, initials? }?` | 可选用户摘要，不包含凭据 |
| `busy` | `boolean?` | 页面忙碌状态 |

导航组 key 和导航项 key 必须唯一；无 label 的项目会在开发阶段直接报错。`normalizeShellModel()` 会产生只读标准模型，`flattenNavigation()` 可供宿主 Adapter 复用。

## 事件与插槽

- `navigate(key)`：用户点击桌面或移动导航；Shell 不执行路由跳转。
- `logout`：用户点击退出；Shell 不调用注销接口。
- `header-start`、`header-actions`：顶部栏左、右扩展区。
- `user-summary`：自定义用户摘要，作用域参数为 `{ user }`。
- `brand`：自定义品牌区域。
- `navigation-item`：自定义导航项，保留 Shell 的激活和禁用行为。
- `overlay-root`：为应用级浮层保留的稳定挂载位置。

## 宿主样式隔离

Shell 的桌面侧栏、顶部栏和移动导航使用独立类名与语义 `navigation` 材质。关键容器会重置通用标签样式，避免旧项目中的 `aside { ... }` 等规则破坏布局；宿主仍应避免无命名空间的全局规则。

默认断点会在窄屏隐藏侧栏并启用底部导航，内容区域自动为安全区和底栏预留空间。导航结构在桌面与移动端共享同一个模型，不需要维护两套路由配置。

## 开发与发布验收

```sh
pnpm install
pnpm check
npm pack --dry-run
```

契约测试会阻止 Shell 导入路由、状态仓库、授权模块、API 或 Cookie。完整组合、三类视口和键盘交互由 [liquid-integration-lab](https://github.com/1linhao/liquid-integration-lab) 验收，并已在 Trojan Panel 真实项目中完成管理员与普通用户角色验证。

版本变化见 [CHANGELOG.md](CHANGELOG.md)，参与开发见 [CONTRIBUTING.md](CONTRIBUTING.md)，安全问题见 [SECURITY.md](SECURITY.md)。项目采用 MIT 许可证。
