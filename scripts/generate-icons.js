import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const iconsDir = path.join(__dirname, '../public/icons')
const svgFile = path.join(iconsDir, 'icon.svg')

const sizes = [16, 48, 128]

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(svgFile)
    
    for (const size of sizes) {
      const outputFile = path.join(iconsDir, `icon${size}.png`)
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputFile)
      
      console.log(`Generated ${outputFile}`)
    }
    
    console.log('All icons generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

generateIcons()