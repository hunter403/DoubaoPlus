# Doubao Plus - 豆包增强插件

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-19.0-blue)

**豆包 AI 助手全能增强插件 - 集成文件夹管理、提示词库、时间轴导航等众多功能**

[English](#english) | [简体中文](#简体中文)

</div>

## 简体中文

### 📖 简介

Doubao Plus 是一个为豆包 AI 助手打造的全功能增强插件,提供文件夹管理、提示词库、时间轴导航等功能,帮助用户更好地组织和管理 AI 对话。

### ✨ 核心功能

#### 📂 文件夹管理
- 两级文件夹层次结构
- 拖拽排序支持
- 自定义文件夹颜色
- 对话移动到文件夹

#### 💡 提示词库
- 保存和复用提示词
- 提示词分类管理
- 快速插入提示词
- 导入/导出功能

#### 📍 时间轴导航
- 可视化节点跳转
- 标记关键时刻
- 管理对话分支

#### 💾 聊天导出
- 导出为 JSON
- 导出为 Markdown
- 导出为 PDF
- 包含图片

#### 🛠️ 实用工具
- 批量删除对话
- 引用回复
- 标签页标题同步
- 防止自动滚动
- 输入框折叠

### 🚀 快速开始

#### 环境要求

- Node.js >= 18.0.0
- Bun >= 1.0.0 (推荐) 或 npm

#### 安装依赖

```bash
bun install
```

#### 开发模式

```bash
bun run dev:chrome   # Chrome & Chromium 浏览器
bun run dev:firefox  # Firefox
```

#### 构建生产版本

```bash
bun run build:chrome   # Chrome
bun run build:firefox  # Firefox
bun run build:all      # 所有浏览器
```

### 📦 安装插件

#### Chrome / Edge

1. 运行 `bun run build:chrome`
2. 打开浏览器扩展管理页面
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `build/chrome` 目录

#### Firefox

1. 运行 `bun run build:firefox`
2. 打开 `about:debugging#/runtime/this-firefox`
3. 点击"临时载入附加组件"
4. 选择 `build/firefox` 目录中的 `manifest.json`

### 🛠️ 技术栈

- **编程语言**: TypeScript
- **前端框架**: React 19
- **构建工具**: Vite
- **样式方案**: TailwindCSS
- **包管理器**: Bun
- **状态管理**: React Context + Hooks
- **存储方案**: chrome.storage.local

### 📁 项目结构

```
doubao-plus/
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件
│   ├── contexts/       # React Context
│   ├── core/           # 核心功能模块
│   ├── features/       # 功能模块
│   ├── hooks/          # 自定义 Hooks
│   ├── pages/          # 页面组件
│   └── utils/          # 工具函数
├── docs/               # 文档
└── tests/              # 测试文件
```

### 🤝 贡献

欢迎贡献!请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 📝 许可证

[GPL-3.0](LICENSE)

---

## English

### 📖 Introduction

Doubao Plus is an all-in-one enhancement suite for Doubao AI Assistant, providing folder management, prompt library, timeline navigation, and more to help users better organize and manage AI conversations.

### ✨ Features

#### 📂 Folder Management
- Two-level folder hierarchy
- Drag-and-drop support
- Custom folder colors
- Move conversations to folders

#### 💡 Prompt Vault
- Save and reuse prompts
- Prompt categorization
- Quick prompt insertion
- Import/Export functionality

#### 📍 Timeline Navigation
- Visual node navigation
- Mark key moments
- Manage conversation branches

#### 💾 Chat Export
- Export to JSON
- Export to Markdown
- Export to PDF
- Include images

#### 🛠️ Power Tools
- Batch delete conversations
- Quote reply
- Tab title sync
- Prevent auto scroll
- Input collapse

### 🚀 Quick Start

#### Requirements

- Node.js >= 18.0.0
- Bun >= 1.0.0 (recommended) or npm

#### Install Dependencies

```bash
bun install
```

#### Development Mode

```bash
bun run dev:chrome   # Chrome & Chromium browsers
bun run dev:firefox  # Firefox
```

#### Build for Production

```bash
bun run build:chrome   # Chrome
bun run build:firefox  # Firefox
bun run build:all      # All browsers
```

### 📦 Install Extension

#### Chrome / Edge

1. Run `bun run build:chrome`
2. Open browser extension management page
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `build/chrome` directory

#### Firefox

1. Run `bun run build:firefox`
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `manifest.json` in `build/firefox` directory

### 🛠️ Tech Stack

- **Language**: TypeScript
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Package Manager**: Bun
- **State Management**: React Context + Hooks
- **Storage**: chrome.storage.local

### 📁 Project Structure

```
doubao-plus/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── contexts/       # React Context
│   ├── core/           # Core modules
│   ├── features/       # Feature modules
│   ├── hooks/          # Custom Hooks
│   ├── pages/          # Page components
│   └── utils/          # Utility functions
├── docs/               # Documentation
└── tests/              # Test files
```

### 🤝 Contributing

Contributions are welcome! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### 📝 License

[GPL-3.0](LICENSE)

---

<div align="center">

Made with ❤️ by Doubao Plus Team

</div>
