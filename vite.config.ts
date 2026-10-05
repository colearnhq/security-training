import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Serves api/game.js from the Vite dev server so live mode works with `npm run dev`
 * (in-memory storage). In production, Vercel runs the same file as a Function.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/game', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/game.js')
          const handler = req.method === 'POST' ? mod.POST : req.method === 'GET' ? mod.GET : null
          if (!handler) {
            res.statusCode = 405
            res.end()
            return
          }
          let body: string | undefined
          if (req.method === 'POST') {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk as Buffer)
            body = Buffer.concat(chunks).toString()
          }
          const response: Response = await handler(
            new Request(`http://localhost${req.originalUrl}`, { method: req.method, body }),
          )
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch (e) {
          server.config.logger.error(String(e))
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Local API crashed, see the terminal.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApi()],
})
