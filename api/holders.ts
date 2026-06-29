import { createServerPublicClient } from './lib/rpc.js'
import { scanHoldersPage } from './lib/holdersScan.js'

type Req = {
  method?: string
  query?: Record<string, string | string[] | undefined>
}

type Res = {
  setHeader(name: string, value: string): void
  status(code: number): Res
  json(data: unknown): void
  end(): void
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const pageRaw = req.query?.page
  const page = typeof pageRaw === 'string' ? Number.parseInt(pageRaw, 10) : 0
  if (!Number.isFinite(page) || page < 0) {
    res.status(400).json({ error: 'Invalid page' })
    return
  }

  try {
    const client = createServerPublicClient()
    const data = await scanHoldersPage(client, page)
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Holder scan failed'
    res.status(500).json({ error: message })
  }
}
