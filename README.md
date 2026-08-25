# Trojan Panel UI · Frosted Glass

Trojan Panel 的响应式 Web 管理界面。本分支采用统一的磨砂玻璃（Frosted Glass）设计语言，覆盖管理员与普通用户页面，并适配桌面和手机浏览器。

## 主要特性

- 亮色、暗色主题首次载入时跟随浏览器，并在浏览器主题变化时实时同步
- 海蓝、紫罗兰、翡翠、琥珀四套颜色主题；颜色选择保存在当前浏览器中
- 向支持 `theme-color` 的手机浏览器同步页面主题色
- 桌面侧栏与手机横向滑动导航使用一致的图标和状态样式
- 表格、表单、日期选择器、下拉层、弹窗和加载状态使用统一控件
- 响应式管理页面以及管理员、普通用户两种界面权限

> 浏览器顶栏和底栏是否采用网页主题色由浏览器及系统版本决定。Via、Chrome 等浏览器需开启“跟随网页颜色”或同类选项。

## 本地开发

要求 Node.js、npm。项目基于 Vue 2 与 Vue CLI 4。

```bash
npm install
npm run serve
```

默认开发地址为 `http://127.0.0.1:8888/`，接口由开发服务器代理至 `http://127.0.0.1:8081/`。仓库提供本地界面测试用的模拟接口：

```bash
node tests/mock-api-server.js
```

## 构建

```bash
npm run build
```

如果较新的 Node.js 因 OpenSSL 兼容性导致旧版 webpack 无法构建，可使用：

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

构建产物位于 `dist/`，可通过 Nginx 或项目 Docker 镜像部署。

## 相关项目

- [Trojan Panel](https://github.com/trojanpanel/trojan-panel)
- [Trojan Panel UI 上游项目](https://github.com/trojanpanel/trojan-panel-ui)
- [trojan](https://github.com/trojan-gfw/trojan)
- [trojan-go](https://github.com/p4gefau1t/trojan-go)
- [Xray-core](https://github.com/XTLS/Xray-core)
- [hysteria](https://github.com/HyNetwork/hysteria)
- [naiveproxy](https://github.com/klzgrad/naiveproxy)
