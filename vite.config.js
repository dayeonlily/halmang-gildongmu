import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

// 개발 중 `npm run dev` 만으로도 /api/*.js 서버 함수를 그대로 실행해 주는 플러그인.
// (배포는 Vercel 이 같은 파일을 서버 함수로 실행하므로 코드 수정 없이 동일하게 동작)
function localApi(env) {
  Object.assign(process.env, env)
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const file = path.resolve('api', url.pathname.replace(/^\//, '') + '.js')
        if (!existsSync(file)) return next()
        let body
        if (req.method === 'POST') {
          const chunks = []
          for await (const c of req) chunks.push(c)
          try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { body = {} }
        }
        const vres = Object.assign(res, {
          status(code) { res.statusCode = code; return vres },
          json(data) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) },
        })
        try {
          const mod = await server.ssrLoadModule(`/api/${path.basename(file)}`)
          await mod.default(Object.assign(req, { query: Object.fromEntries(url.searchParams), body }), vres)
        } catch (e) {
          vres.status(500).json({ error: e.message })
        }
      })
    },
  }
}

// 화면에 보여 줄 버전: Vercel 에서는 배포한 커밋, 내 컴퓨터에서는 git 의 현재 커밋 (어떤 버전을 보고 있는지 바로 알 수 있게)
const gitShort = () => { try { return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return 'dev' } }
const APP_VERSION = (process.env.VERCEL_GIT_COMMIT_SHA || gitShort()).slice(0, 7)

export default defineConfig(({ mode }) => ({
  define: { __APP_VERSION__: JSON.stringify(APP_VERSION), __BUILD_TIME__: JSON.stringify(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ')) },
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), ''))],
  build: { chunkSizeWarningLimit: 1500 },
}))
