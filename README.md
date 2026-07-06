# 自律伙伴 uni-app Android Starter

这是一个用宠物养成督促学生主动学习的 uni-app 安卓应用 MVP。当前版本已经实现核心闭环：开局选择宠物蛋、学习打卡获得积分、用积分喂养宠物、成长值达到阈值后进化，并把进度保存在本地缓存中。

## 已实现功能

- 宠物蛋选择：晨光蛋、绿芽蛋、潮汐蛋。
- 学习打卡：选择科目、时长、专注程度和备注。
- 积分规则：学习分钟数按 `分钟 x 2` 计分，专注程度会给额外奖励。
- 喂养规则：消耗积分购买食物，食物转化为宠物成长值。
- 进化规则：蛋眠期、幼生期、陪读期、进阶期、守护期。
- 成长档案：展示积分、成长值、连续天数、累计学习小时、进化路线和学习历史。
- 本地持久化：使用 `uni.setStorageSync` 保存当前宠物和学习记录。

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

`npm run build:app-plus` 会在 `dist/build/app` 生成 App-Plus 打包资源。真机运行、云打包 APK、证书、DCloud AppID、Android 包名等配置，建议用 HBuilderX 打开本项目或导入 `dist/build/app` 后继续完善。

## 后续开发建议

1. 增加计时器模式，让学习过程像 Forest 一样有进行中的成长反馈。
2. 增加任务模板，例如背单词、错题整理、阅读、作业复盘。
3. 增加宠物装扮和房间装饰，把积分消费从喂养扩展到收藏。
4. 增加家长/老师端或云同步前，先把 `src/domain/pet.ts` 的规则保持为独立纯函数，方便迁移到后端。
