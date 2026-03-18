import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { fileURLToPath } from 'url'
import { copyFileSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
)
const version = packageJson.version

const outputDir = path.join(__dirname, '../dist')
const buildDir = path.join(__dirname, '../build/chrome')
const zipFile = path.join(outputDir, `doubao-plus-v${version}.zip`)
const manifestSource = path.join(__dirname, '../manifest.json')
const manifestTarget = path.join(buildDir, 'manifest.json')

const publicIconsDir = path.join(__dirname, '../public/icons')
const buildIconsDir = path.join(buildDir, 'icons')

function prepareBuild() {
  console.log('📝 准备构建文件...')
  
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true })
  }
  
  if (!fs.existsSync(buildIconsDir)) {
    fs.mkdirSync(buildIconsDir, { recursive: true })
  }
  
  let cssFileName = null
  
  const assetsDir = path.join(buildDir, 'assets')
  if (fs.existsSync(assetsDir)) {
    const cssFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.css'))
    if (cssFiles.length > 0) {
      cssFileName = `assets/${cssFiles[0]}`
      console.log(`✅ 找到CSS文件: ${cssFileName}`)
    }
  }
  
  if (fs.existsSync(manifestSource)) {
    const manifest = JSON.parse(readFileSync(manifestSource, 'utf-8'))
    
    manifest.background = {
      service_worker: 'background.js'
    }
    
    const contentScriptConfig = {
      matches: manifest.content_scripts[0].matches,
      js: ['content.js'],
      run_at: 'document_end'
    }
    
    if (cssFileName) {
      contentScriptConfig.css = [cssFileName]
    }
    
    manifest.content_scripts = [contentScriptConfig]
    
    writeFileSync(manifestTarget, JSON.stringify(manifest, null, 2))
    console.log('✅ manifest.json 已修正并复制到构建目录')
  }
  
  const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png']
  for (const iconFile of iconFiles) {
    const sourcePath = path.join(publicIconsDir, iconFile)
    const targetPath = path.join(buildIconsDir, iconFile)
    
    if (fs.existsSync(sourcePath)) {
      copyFileSync(sourcePath, targetPath)
      console.log(`✅ ${iconFile} 已复制到构建目录`)
    } else {
      console.log(`⚠️ ${iconFile} 不存在于源目录`)
    }
  }
  
  return cssFileName
}

function verifyBuildFiles(cssFileName) {
  console.log('\n🔍 验证构建文件...')
  
  const requiredFiles = [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'options.html',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png'
  ]
  
  if (cssFileName) {
    requiredFiles.push(cssFileName)
  }
  
  const missingFiles = []
  const existingFiles = []
  
  for (const file of requiredFiles) {
    const filePath = path.join(buildDir, file)
    if (existsSync(filePath)) {
      existingFiles.push(file)
      console.log(`  ✅ ${file}`)
    } else {
      missingFiles.push(file)
      console.log(`  ❌ ${file} (缺失)`)
    }
  }
  
  console.log(`\n📊 验证结果: ${existingFiles.length}/${requiredFiles.length} 文件存在`)
  
  if (missingFiles.length > 0) {
    console.log(`\n⚠️  缺失文件: ${missingFiles.join(', ')}`)
    return false
  }
  
  return true
}

function createZip() {
  console.log('\n📦 开始打包 ZIP 文件...')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const output = fs.createWriteStream(zipFile)
  const archive = archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(`\n✅ ZIP 文件已创建: ${zipFile}`)
    console.log(`📊 文件大小: ${(archive.pointer() / 1024).toFixed(2)} KB`)
  })

  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(output)

  if (fs.existsSync(buildDir)) {
    archive.directory(buildDir, false)
  }

  archive.finalize()
}

console.log(`🚀 Doubao Plus v${version}`)
console.log('='.repeat(50))

try {
  const cssFileName = prepareBuild()
  
  if (!verifyBuildFiles(cssFileName)) {
    console.log('\n❌ 构建验证失败，请检查缺失文件')
    process.exit(1)
  }
  
  createZip()
  
  console.log('\n' + '='.repeat(50))
  console.log('✨ 打包完成!')
  console.log(`\n📍 ZIP 文件位置: ${zipFile}`)
  console.log(`\n📝 提示: 可以直接将 ZIP 文件拖拽到 Chrome 扩展管理页面安装`)
  console.log(`\n📝 提示: 或者解压 ZIP 文件，使用 build/chrome 文件夹加载未打包的扩展`)
} catch (error) {
  console.error('\n❌ 打包失败:', error.message)
  process.exit(1)
}
