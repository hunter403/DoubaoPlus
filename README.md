# Doubao Plus - 豆包增强插件

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-GPL--3.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-19.0-blue)

**豆包 AI 助手增强插件 - 集成文件夹管理、提示词库等功能，帮助用户更好地组织和管理 AI 对话**

[English](#english) | [简体中文](#简体中文)

</div>

## 简体中文

### 📖 简介

Doubao Plus 是一个为豆包 AI 助手打造的全功能增强插件,提供文件夹管理、提示词库、时间轴导航等功能,帮助用户更好地组织和管理 AI 对话。

### ✨ 核心功能

#### 📂 文件夹管理
- 多级文件夹层次结构（支持无限嵌套）
- 自定义文件夹颜色（8种颜色可选）
- 对话移动到文件夹
- 子文件夹创建和管理
- 文件夹展开/收起功能

#### 💡 提示词库
- 保存和复用提示词
- 提示词分类管理
- 快速插入提示词到输入框
- 数据导入/导出功能（JSON格式）

#### 📋 对话管理
- 保存对话到扩展
- 对话列表展示
- 对话星标功能
- 对话删除功能
- 对话跳转功能

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
- **存储方案**: IndexedDB

### 📁 项目结构
```
doubao-plus/
├── public/              # 静态资源
├── src/
│   ├── pages/          # 页面组件（popup, options）
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数（storage等）
│   ├── content.ts       # 内容脚本
│   ├── background.ts    # 后台脚本
│   ├── popup.tsx       # 弹出页面
│   ├── options.tsx      # 选项页面
│   └── index.css        # 全局样式
├── build/              # 构建输出目录
│   ├── chrome/         # Chrome 扩展构建
│   └── firefox/        # Firefox 扩展构建
└── scripts/           # 构建和打包脚本
```

### 🤝 贡献

欢迎贡献!请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 📝 许可证

[GPL-3.0](LICENSE)

---

## English

### 📖 Introduction

Doubao Plus is an enhancement suite for Doubao AI Assistant, providing folder management, prompt library, and more to help users better organize and manage AI conversations.

### ✨ Features

#### 📂 Folder Management
- Multi-level folder hierarchy (unlimited nesting)
- Custom folder colors (8 colors available)
- Move conversations to folders
- Create and manage subfolders
- Folder expand/collapse functionality

#### 💡 Prompt Vault
- Save and reuse prompts
- Prompt categorization
- Quick prompt insertion to input box
- Data import/export (JSON format)

#### 📋 Conversation Management
- Save conversations to extension
- Display conversation list
- Star conversations
- Delete conversations
- Navigate to conversations

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
- **Storage**: IndexedDB

### 📁 Project Structure
```
doubao-plus/
├── public/              # Static assets
├── src/
│   ├── pages/          # Page components (popup, options)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions (storage, etc.)
│   ├── content.ts       # Content script
│   ├── background.ts    # Background script
│   ├── popup.tsx       # Popup page
│   ├── options.tsx      # Options page
│   └── index.css        # Global styles
├── build/              # Build output directory
│   ├── chrome/         # Chrome extension build
│   └── firefox/        # Firefox extension build
└── scripts/           # Build and packaging scripts
```

### 🤝 Contributing

Contributions are welcome! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### 📝 License

[GPL-3.0](LICENSE)

---

<div align="center">

Made with ❤️ by Doubao Plus Team

</div>
