import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Alat ekspor lama tetap dipakai di dev server, tetapi tidak perlu ikut ke CDN.
function abaikanEksporLocalStorageSaatBuild() {
  let outDir = ''
  return {
    name: 'abaikan-ekspor-localstorage-saat-build',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      fs.rmSync(path.join(outDir, 'ekspor-localstorage.html'), { force: true })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), abaikanEksporLocalStorageSaatBuild()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Pemisahan vendor mengikuti hasil audit bundle: Recharts ~412 kB,
        // Motion ~138 kB, React ~207 kB. Halaman admin dimuat malas, sehingga
        // chunk grafik hanya diunduh saat Dashboard dibuka.
        codeSplitting: {
          minSize: 20000,
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'vendor-motion', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/ },
            { name: 'vendor-charts', test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|decimal\.js)[\\/]/ },
            { name: 'vendor-icons', test: /node_modules[\\/]lucide-react[\\/]/ },
          ],
        },
      },
    },
  },
})

