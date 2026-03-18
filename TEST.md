# Doubao Plus 插件测试验证指南

## 🧪 测试前准备

### 1. 安装插件

#### 方法一：开发者模式安装（推荐用于测试）

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"
5. 选择 `build/chrome` 文件夹
6. 安装完成！

### 2. 验证文件结构

确保以下文件存在于 `build/chrome/` 目录：

```
build/chrome/
├── manifest.json          ✅ 扩展清单（必需）
├── background.js          ✅ 后台脚本（必需）
├── content.js             ✅ 内容脚本（必需）
├── popup.html            ✅ 弹出页面（必需）
├── options.html           ✅ 选项页面（必需）
├── assets/
│   └── index-BORYZh36.css  ✅ 样式文件（必需）
└── icons/
    └── icon.svg          ✅ 图标文件（必需）
```

## 🧪 功能测试清单

### 基础功能测试

- [ ] **扩展安装**
  - [ ] 插件成功安装到浏览器
  - [ ] 在扩展管理页面可见
  - [ ] 图标显示正常

- [ ] **弹出页面**
  - [ ] 点击插件图标能打开弹出窗口
  - [ ] 弹出窗口显示正常
  - [ ] 显示"Doubao Plus"标题
  - [ ] 显示描述文字

- [ ] **选项页面**
  - [ ] 右键插件图标能打开选项页面
  - [ ] 选项页面显示正常
  - [ ] 显示"Doubao Plus 设置"标题

- [ ] **后台脚本**
  - [ ] 打开浏览器控制台
  - [ ] 查看是否有"Doubao Plus background script loaded"日志
  - [ ] 查看是否有"Doubao Plus extension installed"日志

- [ ] **内容脚本**
  - [ ] 访问豆包网站
  - [ ] 打开浏览器控制台
  - [ ] 查看是否有"Doubao Plus content script loaded"日志
  - [ ] 样式文件正确注入

### 权限测试

- [ ] **storage 权限**
  - [ ] 能够保存数据到 chrome.storage
  - [ ] 能够从 chrome.storage 读取数据

- [ ] **tabs 权限**
  - [ ] 能够访问标签页信息

- [ ] **activeTab 权限**
  - [ ] 能够获取当前活动标签页

### 文件路径测试

在 `build/chrome/manifest.json` 中验证：

- [ ] `background.service_worker` 指向 `background.js`
- [ ] `content_scripts[0].js` 指向 `content.js`
- [ ] `content_scripts[0].css` 指向 `assets/index-BORYZh36.css`
- [ ] `action.default_popup` 指向 `popup.html`
- [ ] `options_page` 指向 `options.html`
- [ ] `icons` 路径指向正确的图标文件

## 🧪 测试步骤

### 步骤 1：基础安装测试

1. **安装插件**
   ```bash
   npm run build:chrome
   # 然后在浏览器中加载 build/chrome 文件夹
   ```

2. **检查扩展管理页面**
   - 访问 `chrome://extensions/`
   - 确认"Doubao Plus - 豆包增强插件"在列表中
   - 确认图标显示正常

3. **测试弹出页面**
   - 点击插件图标
   - 检查弹出窗口是否正常打开
   - 检查页面内容是否正确显示

4. **检查控制台日志**
   - 按 F12 打开开发者工具
   - 切换到 Console 标签
   - 查找以下日志：
     - "Doubao Plus background script loaded"
     - "Doubao Plus extension installed"

### 步骤 2：内容脚本测试

1. **访问豆包网站**
   - 打开 https://www.doubao.com/ 或 https://doubao.com/

2. **检查内容脚本注入**
   - 打开开发者工具（F12）
   - 在 Console 标签中查找：
     - "Doubao Plus content script loaded"

3. **检查样式注入**
   - 在 Elements 标签中查找注入的样式
   - 确认 `assets/index-BORYZh36.css` 中的样式被应用

### 步骤 3：选项页面测试

1. **打开选项页面**
   - 右键点击插件图标
   - 选择"选项"
   - 检查选项页面是否正常打开

2. **检查页面内容**
   - 确认显示"Doubao Plus 设置"标题
   - 检查页面布局是否正常

## 🧪 常见问题排查

### 问题 1：插件无法加载

**可能原因**：
- manifest.json 格式错误
- 文件路径不正确
- 缺少必需文件

**解决方法**：
1. 检查 `build/chrome/manifest.json` 格式
2. 确认所有必需文件都存在
3. 查看浏览器控制台错误信息

### 问题 2：弹出页面空白

**可能原因**：
- React 渲染错误
- 脚本加载失败
- CSS 样式冲突

**解决方法**：
1. 打开开发者工具查看错误
2. 检查 `popup.tsx` 和 `pages/popup/App.tsx`
3. 检查控制台是否有 React 错误

### 问题 3：内容脚本未注入

**可能原因**：
- content_scripts 匹配规则错误
- 网站不匹配
- 脚本执行错误

**解决方法**：
1. 检查 manifest.json 中的 matches 规则
2. 确认访问的网站 URL 匹配
3. 查看控制台错误信息

## 🧪 测试完成标准

### ✅ 所有测试通过

- [ ] 插件成功安装
- [ ] 弹出页面正常显示
- [ ] 选项页面正常显示
- [ ] 后台脚本正常加载
- [ ] 内容脚本正常注入
- [ ] 所有权限正常工作
- [ ] 控制台无错误信息
- [ ] 文件路径配置正确

### 📝 测试报告

**测试日期**: ___________
**测试人员**: ___________
**Chrome 版本**: ___________
**插件版本**: 0.1.0

**测试结果**:
- 通过项目数: ___ / 8
- 失败项目数: ___
- 通过率: ___%

**备注**:
_________________________________________________________

## 🚀 下一步

测试通过后，可以打包 CRX 文件：

```bash
npm run build:chrome ; npm run package
```

生成的 CRX 文件位于 `dist/doubao-plus-v0.1.0.crx`

---

**重要提示**：
1. 测试时使用 `build/chrome` 文件夹，而不是 CRX 文件
2. CRX 文件用于分发，开发测试时建议使用文件夹
3. 每次修改代码后都要重新测试
4. 确保所有功能都正常工作后再打包
