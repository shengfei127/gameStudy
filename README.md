# 自律伙伴 uni-app Android Starter

这是一个用宠物养成督促学生主动学习的 uni-app 安卓应用 MVP。当前版本已经实现核心闭环：开局选择宠物蛋、上传学习打卡照片、学习打卡获得积分、用积分喂养宠物、成长值达到阈值后进化，并支持本地缓存或 uniCloud 云端保存进度。

## 已实现功能

- 宠物蛋选择：十二生肖蛋、原创神话灵感蛋和经典学习伙伴蛋。
- 成年形态预览：选择前可以直接看到宠物成年后的样子。
- 写实素材优先：如果 `src/static/pets/<角色id>-adult.webp` 或 `<角色id>-egg.webp` 存在，界面会优先显示图片资产。
- 学习打卡：选择科目、时长、专注程度、上传学习照片和填写备注。
- 积分规则：学习分钟数按 `分钟 x 2` 计分，专注程度会给额外奖励。
- 防重复打卡：同一天同一科目只能打卡一次。
- 喂养规则：消耗积分购买食物，食物转化为宠物成长值。
- 进化规则：蛋眠期、幼生期、陪读期、进阶期、守护期。
- 成长档案：展示积分、成长值、连续天数、累计学习小时、进化路线和学习历史。
- 进度保存：默认使用 `uni.setStorageSync`，也可切换到 uniCloud 云函数和云数据库。

## 目录结构

```text
src/
  components/       通用组件，例如 PetAvatar
  config/           应用配置
  domain/           宠物成长和学习积分规则
  pages/            伙伴、打卡、档案三页
  services/         API 请求封装
  stores/           Pinia 状态管理
  types/            TypeScript 类型
  utils/            通用工具
  App.vue           应用生命周期和全局样式
  manifest.json     App-Plus 和 Android 发布配置
  pages.json        页面、导航栏、tabBar 配置
uniCloud-alipay/
  cloudfunctions/   uniCloud 云函数
  database/         云数据库 schema
```

## 常用命令

```bash
npm install
npm run dev:h5
npm test
npm run type-check
npm run build:h5
npm run build:app-plus
```

## 云端存储

默认使用本地缓存，适合直接运行和演示：

```env
VITE_PROGRESS_STORAGE=local
```

如需使用 uniCloud，请把环境变量改为：

```env
VITE_PROGRESS_STORAGE=cloud
```

然后在 HBuilderX 中关联支付宝云 uniCloud 服务空间，上传 `uniCloud-alipay/cloudfunctions/study-pet` 云函数，并初始化 `uniCloud-alipay/database/study_pet_progress.schema.json`。MVP 阶段使用匿名客户端 ID 关联档案，后续接入账号体系时可把 `clientId` 替换为真实用户 ID。

外部浏览器调试时可以走本地代理，避免 H5 直接请求云函数时遇到跨域或运行环境差异：

```env
VITE_PROGRESS_STORAGE=proxy
VITE_STUDY_PET_PROXY_URL=/api/study-pet
```

本地代理由 Vite 开发服务器提供，接口路径为 `POST /api/study-pet`，会复用 `uniCloud-alipay/cloudfunctions/study-pet` 的业务逻辑，并把调试数据保存到 `.local-data/study-pet-progress.json`。这个模式只适合外部浏览器调试，真机或正式云端同步请切回 `cloud`。

`npm run build:app-plus` 会在 `dist/build/app` 生成 App-Plus 打包资源。真机运行、云打包 APK、证书、DCloud AppID、Android 包名等配置，建议用 HBuilderX 打开本项目或导入 `dist/build/app` 后继续完善。

## 后续开发建议

1. 增加计时器模式，让学习过程有进行中的成长反馈。
2. 增加任务模板，例如背单词、错题整理、阅读、作业复盘。
3. 增加宠物装扮和房间装饰，把积分消费从喂养扩展到收集。
4. 增加家长/老师端或云同步前，先把 `src/domain/pet.ts` 的规则保持为独立纯函数，方便迁移到后端。
