# 参与开发

```sh
pnpm install
pnpm check
```

Shell 必须保持模型驱动：不得引入 Router、Vuex、权限模块、Cookie、Token 或业务 API。新增模型字段时请同时更新 TypeScript 声明、标准化函数、契约测试和中文 README。视觉变化还应在相邻的 `liquid-integration-lab` 中复验桌面、平板和手机快照。

提交信息建议使用 Conventional Commits。
