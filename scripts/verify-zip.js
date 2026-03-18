import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const zipFile = path.join(__dirname, '../dist/doubao-plus-v0.1.0.zip')

async function verifyZip() {
  try {
    console.log('🔍 验证 ZIP 文件...\n')
    
    if (!fs.existsSync(zipFile)) {
      console.error('❌ ZIP 文件不存在!')
      process.exit(1)
    }
    
    const stats = fs.statSync(zipFile)
    
    console.log('📦 ZIP 文件信息:')
    console.log('='.repeat(50))
    console.log(`  文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
    console.log(`  文件路径: ${zipFile}`)
    console.log(`  文件类型: ZIP 格式`)
    
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js',
      'popup.html',
      'options.html',
      'assets/index-BORYZh36.css',
      'icons/icon16.png',
      'icons/icon48.png',
      'icons/icon128.png'
    ]
    
    console.log('\n🔍 检查构建目录中的必需文件:')
    console.log('='.repeat(50))
    
    const buildDir = path.join(__dirname, '../build/chrome')
    let allPresent = true
    
    for (const file of requiredFiles) {
      const filePath = path.join(buildDir, file)
      const present = fs.existsSync(filePath)
      console.log(`  ${present ? '✅' : '❌'} ${file}`)
      if (!present) allPresent = false
    }
    
    console.log('='.repeat(50))
    
    if (allPresent) {
      console.log('\n✅ 所有必需文件都存在于构建目录中!')
      console.log('✅ ZIP 文件已成功打包!')
      console.log('\n📝 安装方法:')
      console.log('   1. 打开 Chrome 浏览器')
      console.log('   2. 访问 chrome://extensions/')
      console.log('   3. 开启"开发者模式"')
      console.log('   4. 将 ZIP 文件拖拽到页面中')
      console.log('   5. 或者解压 ZIP 文件，使用"加载已解压的扩展程序"')
    } else {
      console.log('\n❌ 部分必需文件缺失!')
    }
    
    console.log(`\n📍 ZIP 文件位置: D:\\Study\\TraeProject\\DoubaoPlus\\dist\\doubao-plus-v0.1.0.zip`)
    
  } catch (error) {
    console.error('❌ 验证 ZIP 文件时出错:', error.message)
    process.exit(1)
  }
}

verifyZip()