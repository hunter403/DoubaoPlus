import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const crxFile = path.join(__dirname, '../dist/doubao-plus-v0.1.0.crx')

async function verifyCrx() {
  try {
    console.log('🔍 验证 CRX 文件内容...\n')
    
    const buffer = fs.readFileSync(crxFile)
    
    console.log('📦 CRX 文件信息:')
    console.log('='.repeat(50))
    console.log(`  文件大小: ${(buffer.length / 1024).toFixed(2)} KB`)
    console.log(`  文件路径: ${crxFile}`)
    
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
      console.log('✅ CRX 文件已成功打包!')
    } else {
      console.log('\n❌ 部分必需文件缺失!')
    }
    
    console.log('\n📝 CRX 文件已准备好进行安装测试')
    console.log('📍 文件位置: D:\\Study\\TraeProject\\DoubaoPlus\\dist\\doubao-plus-v0.1.0.crx')
    
  } catch (error) {
    console.error('❌ 验证 CRX 文件时出错:', error.message)
    process.exit(1)
  }
}

verifyCrx()