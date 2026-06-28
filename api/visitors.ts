import { getActiveCount, heartbeat, leave } from './lib/visitorStore.js'

type Req = {
  method?: string
  body?: { sessionId?: string }
  query?: Record<string, string | string[] | undefined>
}

type Res = {
  setHeader(name: string, value: string): void
  status(code: number): Res
  json(data: unknown): void
  end(): void
}

export default function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const sessionId =
    typeof req.body?.sessionId === 'string'
      ? req.body.sessionId
      : typeof req.query?.sessionId === 'string'
        ? req.query.sessionId
        : null

  try {
    if (req.method === 'GET') {
      res.status(200).json({ real: getActiveCount() })
      return
    }

    if (req.method === 'POST') {
      if (!sessionId) {
        res.status(400).json({ error: 'sessionId required' })
        return
      }
      res.status(200).json({ real: heartbeat(sessionId) })
      return
    }

    if (req.method === 'DELETE') {
      if (!sessionId) {
        res.status(400).json({ error: 'sessionId required' })
        return
      }
      res.status(200).json({ real: leave(sessionId) })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch {
    res.status(500).json({ error: 'Visitor count unavailable' })
  }
}
