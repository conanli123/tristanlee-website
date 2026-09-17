import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifySingle } from './verify-single.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const outDir = join(root, 'single-file')

// Run the same compiler and bundler as the normal production build.
execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-b'], { cwd: root, stdio: 'inherit' })
execFileSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: root, stdio: 'inherit' })

const types = {
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.ico': 'image/x-icon',
}

function collectMedia(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const rel = prefix + entry.name
    if (entry.isDirectory()) return collectMedia(join(dir, entry.name), rel + '/')
    return types[extname(entry.name).toLowerCase()] ? [rel] : []
  })
}

// Discover new public media automatically; do not rewrite minified JS literals.
const embedded = Object.fromEntries(collectMedia(join(root, 'public')).map(rel => [rel,
  `data:${types[extname(rel).toLowerCase()]};base64,${readFileSync(join(dist, rel)).toString('base64')}`,
]))
// 入口为 dev.html（仓库根 index.html 是已构建的生产单文件页）。
let html = readFileSync(join(dist, 'dev.html'), 'utf8')
html = html.replace(/<link\b(?=[^>]*rel="icon")(?=[^>]*href="\.\/([^"]+)")[^>]*>/g,
  (_, rel) => `<link rel="icon" href="${embedded[rel]}" />`)
html = html.replace(/<link\b(?=[^>]*rel="stylesheet")(?=[^>]*href="\.\/([^"]+)")[^>]*>/g,
  (_, rel) => `<style>${readFileSync(join(dist, rel), 'utf8').replace(/<\/style/gi, '<\\/style')}</style>`)
const scripts = [...html.matchAll(/<script\b(?=[^>]*type="module")(?=[^>]*src="\.\/([^"]+)")[^>]*><\/script>/g)]
if (scripts.length !== 1) throw new Error('Expected one bundled module entry')
const script = readFileSync(join(dist, scripts[0][1]), 'utf8').replace(/<\/script/gi, '<\\/script')
// A callback preserves literal $& sequences in compiled JavaScript.
html = html.replace(scripts[0][0], () => `<script id="site-assets">window.__SITE_ASSETS__=${JSON.stringify(embedded).replace(/</g, '\\u003c')}</script><script type="module">${script}</script>`)

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'index.html'), html)
verifySingle(root)
console.log(`Built single-file/index.html: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`)
