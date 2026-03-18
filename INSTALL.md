# Doubao Plus CRX 文件安装说明

## 📦 CRX 文件信息

- **文件名**: `doubao-plus-v0.1.0.crx`
- **版本**: 0.1.0
- **大小**: 约 0.05 MB
- **位置**: `dist/doubao-plus-v0.1.0.crx`

## 🚀 安装方法

### 方法一: 拖拽安装（推荐）

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 将 `doubao-plus-v0.1.0.crx` 文件拖拽到扩展程序页面
4. 在弹出的对话框中点击"添加扩展程序"
5. 安装完成！

### 方法二: 开发者模式安装

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"
5. 选择 `build/chrome` 文件夹（不是 CRX 文件）
6. 安装完成！

## 📝 重新打包

如果需要重新打包 CRX 文件：

```bash
# 1. 构建项目
npm run build:chrome

# 2. 打包成 CRX
npm run package
```

打包后的文件位于 `dist/` 目录。

## 🔍 验证安装

安装成功后：

1. 在浏览器工具栏找到 Doubao Plus 图标
2. 点击图标打开弹出窗口
3. 访问豆包网站（https://www.doubao.com/ 或 https://doubao.com/）
4. 插件会自动注入功能

## ⚠️ 注意事项

1. **首次安装**: 首次安装后，可能需要刷新豆包页面才能看到效果
2. **权限说明**: 插件需要以下权限：
   - `storage`: 用于保存用户设置和数据
   - `tabs`: 用于访问标签页信息
   - `activeTab`: 用于获取当前活动标签页
3. **更新**: 当有新版本时，需要手动重新安装 CRX 文件

## 🐛 故障排除

### 问题: 无法安装 CRX 文件

**解决方案**:
- 确保使用的是 Chrome 或 Chromium 浏览器
- 检查 CRX 文件是否完整下载
- 尝试使用"开发者模式"安装 `build/chrome` 文件夹

### 问题: 安装后无效果

**解决方案**:
- 刷新豆包页面
- 检查浏览器控制台是否有错误
- 确认插件已启用（在扩展程序页面查看）
- 清除浏览器缓存后重试

## 📚 更多信息

- 项目地址: https://github.com/your-username/doubao-plus
- 问题反馈: GitHub Issues
- 使用文档: 查看 README.md

---

**祝您使用愉快！** 🎉
