import React from 'react'

function App() {
  return (
    <div className="min-w-[400px] min-h-[500px] bg-gray-50 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🚀 Doubao Plus</h1>
        <p className="text-gray-600 mb-6">
          Doubao Plus 已成功安装！
        </p>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-2">使用说明</h2>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li>• 访问豆包网站 (doubao.com)</li>
            <li>• 操作区域会自动显示在对话列表上方</li>
            <li>• 支持对话管理、文件夹组织和提示词库</li>
            <li>• 所有数据保存在本地浏览器中</li>
          </ul>
        </div>
        <div className="mt-6">
          <a 
            href="https://www.doubao.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            前往豆包
          </a>
        </div>
      </div>
    </div>
  )
}

export default App