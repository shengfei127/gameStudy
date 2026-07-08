# 应用内更新源

这个目录用于发布 App 内“检查更新”读取的版本清单和安装包。

## 当前配置

- 生产构建读取 `.env.production`。
- 当前清单地址是 `https://study-pet-updates.pages.dev/version.json`。
- `version.json` 现在保持为当前版本 `0.1.0` / `10`，不会触发已安装 App 更新。

## 发布新版本

1. 提高 `src/manifest.json` 的 `versionName` 和 `versionCode`。
2. 重新打包 APK。
3. 把 APK 上传到可直接下载的 HTTPS 地址。
4. 修改 `updates/version.json`：提高 `versionName` / `versionCode`，并把 `downloadUrl` 改成 APK 直链。
5. 把本目录推送到远程仓库，或者运行 `npm.cmd run deploy:updates` 部署到 Cloudflare Pages。

`downloadUrl` 必须是直接文件链接，不要使用需要打开网页、输入提取码或二次跳转的网盘分享页。
