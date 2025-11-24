# AI Notes App

一个基于 Electron + React + TypeScript 的智能笔记应用程序。

## 🚀 功能特性

- 📝 **智能笔记编辑** - 支持 Markdown 和富文本编辑
- 🤖 **AI 助手** - 智能内容建议和摘要生成
- 🔍 **全文搜索** - 快速查找笔记内容
- 📁 **文件夹管理** - 灵活的笔记组织系统
- 🏷️ **标签系统** - 多维度笔记分类
- 🎨 **现代界面** - 基于 Tailwind CSS 的美观界面

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + Vite
- **桌面**: Electron
- **数据库**: SQLite
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **图标**: Heroicons

## 📦 安装和运行

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 构建主进程
npm run build:electron

# 构建预加载脚本
npm run build:preload

# 构建 React 应用
npm run build:vite

# 启动开发服务器
node server.js
```

### 访问应用
- 测试页面: http://localhost:12000/test.html
- React 应用: http://localhost:12000/app
- 简单测试: http://localhost:12000/simple-test.html

## 🏗️ 项目结构

```
ai-notes-app/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── main.ts
│   │   ├── DatabaseManager.ts
│   │   └── AppManager.ts
│   ├── preload/        # 预加载脚本
│   │   └── preload.ts
│   ├── renderer/       # React 渲染进程
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.tsx
│   ├── types/          # TypeScript 类型定义
│   │   └── index.ts
│   └── stores/         # Zustand 状态存储
│       ├── ui.ts
│       ├── settings.ts
│       ├── notes.ts
│       ├── folders.ts
│       └── tags.ts
├── dist/               # 构建输出
├── public/             # 静态资源
└── tests/              # 测试文件
```

## 🧪 测试

### 自动化测试
```bash
# 运行完整测试套件
npm test

# 运行 Puppeteer 测试
node full-test.js
```

### 手动测试
1. 访问 http://localhost:12000/test.html
2. 点击"打开React应用"按钮
3. 验证应用功能

## 📋 开发状态

### ✅ 已完成
- [x] 项目架构搭建
- [x] TypeScript 配置
- [x] Electron 主进程
- [x] React 应用框架
- [x] 数据库系统
- [x] 状态管理
- [x] 基础 UI 组件
- [x] 构建系统
- [x] 测试框架

### 🚧 开发中
- [ ] 笔记编辑器 (Monaco Editor)
- [ ] AI 服务集成
- [ ] 搜索功能实现
- [ ] 设置界面完善
- [ ] 文件夹管理
- [ ] 标签系统

### 📅 计划中
- [ ] 导入/导出功能
- [ ] 插件系统
- [ ] 主题定制
- [ ] 云同步
- [ ] 协作功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系

如有问题，请提交 Issue 或联系开发团队。

---

**最后更新**: 2025-08-19  
**版本**: v0.1.0-alpha  
**状态**: 开发中 🚧