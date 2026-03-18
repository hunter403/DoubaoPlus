import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        const manifestPath = resolve(__dirname, 'manifest.json')
        const targetPath = resolve(__dirname, 'build/chrome/manifest.json')
        if (existsSync(manifestPath)) {
          copyFileSync(manifestPath, targetPath)
        }
      }
    },
  ],
  publicDir: 'public',
  build: {
    outDir: 'build/chrome',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.tsx'),
        options: resolve(__dirname, 'src/options.tsx'),
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId?.includes('background')) return 'background.js'
          if (facadeModuleId?.includes('content')) return 'content.js'
          return 'chunks/[name]-[hash].js'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
