import React, { useState, useEffect } from 'react'
import { Settings } from '../../types'
import { StorageManager } from '../../utils/storage'

function App() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    autoSave: true,
    showVisualEffects: false,
    effectType: 'none',
    fontSize: 'medium'
  })
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const loadedSettings = await StorageManager.getSettings()
    setSettings(loadedSettings)
  }

  const handleSaveSettings = async () => {
    await StorageManager.saveSettings(settings)
    alert('设置已保存！')
  }

  const handleExportData = async () => {
    const [chats, folders, prompts] = await Promise.all([
      StorageManager.getChats(),
      StorageManager.getFolders(),
      StorageManager.getPrompts()
    ])
    
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      chats,
      folders,
      prompts
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doubao-plus-backup-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('数据已导出！')
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (data.chats) {
          for (const chat of data.chats) {
            await StorageManager.saveChat(chat)
          }
        }
        
        if (data.folders) {
          for (const folder of data.folders) {
            await StorageManager.saveFolder(folder)
          }
        }
        
        if (data.prompts) {
          for (const prompt of data.prompts) {
            await StorageManager.savePrompt(prompt)
          }
        }
        
        alert('数据导入成功！')
        loadSettings()
      } catch (error) {
        alert('导入失败：文件格式不正确')
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      chrome.storage.local.clear()
      alert('数据已清除')
      loadSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Doubao Plus 设置
        </h1>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">界面设置</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-700">主题</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-700">字体大小</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as any })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-700">视觉效果</label>
                <div className="flex items-center gap-2">
                  <select
                    value={settings.effectType}
                    onChange={(e) => setSettings({ ...settings, effectType: e.target.value as any })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">无</option>
                    <option value="snow">雪花</option>
                    <option value="rain">雨滴</option>
                    <option value="sakura">樱花</option>
                  </select>
                  <button
                    onClick={() => setSettings({ ...settings, showVisualEffects: !settings.showVisualEffects })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      settings.showVisualEffects 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {settings.showVisualEffects ? '开启' : '关闭'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-700">自动保存</label>
                <button
                  onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    settings.autoSave 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {settings.autoSave ? '已开启' : '已关闭'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">数据管理</h2>
            
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                📤 导出数据
              </button>
              
              <button
                onClick={handleImportData}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                📥 导入数据
              </button>
              
              <button
                onClick={handleClearData}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                🗑️ 清除所有数据
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">关于</h2>
            
            <div className="space-y-2 text-gray-600">
              <p><strong>版本：</strong>0.1.0</p>
              <p><strong>描述：</strong>豆包AI全能增强插件</p>
              <p><strong>功能：</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>文件夹管理 - 组织您的对话</li>
                <li>提示词库 - 保存和重用提示词</li>
                <li>数据导出 - 备份您的数据</li>
                <li>视觉效果 - 美化您的体验</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSaveSettings}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            保存设置
          </button>
          <button
            onClick={() => window.close()}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default App