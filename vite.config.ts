import type { Connect } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  getActiveCount,
  heartbeat,
  leave,
} from './api/lib/visitorStore.js'

function visitorApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (!req.url?.startsWith('/api/visitors')) return next()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'application/json')

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    const readBody = (): Promise<{ sessionId?: string }> =>
      new Promise((resolve) => {
        if (req.method === 'GET') {
          resolve({})
          return
        }
        let raw = ''
        req.on('data', (chunk) => {
          raw += chunk
        })
        req.on('end', () => {
          try {
            resolve(raw ? JSON.parse(raw) : {})
          } catch {
            resolve({})
          }
        })
      })

    void readBody().then(({ sessionId }) => {
      try {
        if (req.method === 'GET') {
          res.end(JSON.stringify({ real: getActiveCount() }))
          return
        }
        if (req.method === 'POST') {
          if (!sessionId) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'sessionId required' }))
            return
          }
          res.end(JSON.stringify({ real: heartbeat(sessionId) }))
          return
        }
        if (req.method === 'DELETE') {
          if (!sessionId) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'sessionId required' }))
            return
          }
          res.end(JSON.stringify({ real: leave(sessionId) }))
          return
        }
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      } catch {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Visitor count unavailable' }))
      }
    })
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'visitor-api-dev',
      configureServer(server) {
        server.middlewares.use(visitorApiMiddleware())
      },
    },
  ],
})
