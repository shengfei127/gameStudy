# GameStudy uni-app Android Starter

这是一个基于 uni-app、Vue 3、Vite、TypeScript 的安卓应用起始框架。项目已经接入 Pinia、基础请求封装、App-Plus/Android manifest 配置和三页 tab 示例，后续可以直接在此基础上开发业务页面。

## 目录结构

```text
src/
  components/       通用组件
  config/           应用配置和环境变量读取
  pages/            uni-app 页面
  services/         API 请求封装
  stores/           Pinia 状态管理
  types/            TypeScript 类型
  utils/            通用工具
  App.vue           应用生命周期和全局样式
  main.ts           Vue/Pinia 入口
  manifest.json     App-Plus 和 Android 发布配置
  pages.json        页面、导航栏、tabBar 配置
```

## 常用命令

```bash
npm install
npm run dev:h5
npm run type-check
npm run build:h5
npm run build:app-plus
```

`npm run build:app-plus` 会在 `dist/build/app` 生成 App-Plus 打包资源。真机运行、云打包 APK、证书、DCloud AppID、Android 包名等配置，建议用 HBuilderX 打开本项目或导入 `dist/build/app` 后继续完善。

## 环境变量

复制 `.env.example` 为 `.env.local`，然后按需填写后端地址：

```bash
VITE_API_BASE_URL=https://api.example.com
```

安卓真机访问本机后端时，不要使用 `127.0.0.1`，需要换成电脑在局域网中的 IP。

## 下一步开发

1. 在 `src/pages` 下新增页面，并同步注册到 `src/pages.json`。
2. 在 `src/services/http.ts` 基础上扩展业务 API 模块。
3. 在 `src/stores` 里按业务域拆分 Pinia store。
4. 打包安卓前，把 `src/manifest.json` 里的 `appid` 和 `packagename` 换成正式值。
