import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'reactor-visitor-session'
const BASE_MIN = 12
const BASE_MAX = 20
const HEARTBEAT_MS = 25_000
const POLL_MS = 12_000
const BASE_DRIFT_MS = 4_500

function randomBase(): number {
  return BASE_MIN + Math.random() * (BASE_MAX - BASE_MIN)
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

async function ping(sessionId: string, method: 'POST' | 'DELETE' = 'POST'): Promise<number | null> {
  try {
    const res = await fetch('/api/visitors', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
      keepalive: method === 'DELETE',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { real?: number }
    return typeof data.real === 'number' ? data.real : null
  } catch {
    return null
  }
}

async function fetchReal(): Promise<number | null> {
  try {
    const res = await fetch('/api/visitors', { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { real?: number }
    return typeof data.real === 'number' ? data.real : null
  } catch {
    return null
  }
}

export function useVisitorCount() {
  const [displayCount, setDisplayCount] = useState(() => Math.round(randomBase()))
  const baseRef = useRef(randomBase())
  const realRef = useRef(0)
  const sessionRef = useRef<string | null>(null)

  useEffect(() => {
    sessionRef.current = getSessionId()

    const updateDisplay = () => {
      const others = Math.max(0, realRef.current - 1)
      setDisplayCount(Math.round(baseRef.current) + others)
    }

    const driftBase = () => {
      const delta = (Math.random() - 0.48) * 1.4
      baseRef.current = Math.max(BASE_MIN, Math.min(BASE_MAX, baseRef.current + delta))
      updateDisplay()
    }

    driftBase()
    const driftId = window.setInterval(driftBase, BASE_DRIFT_MS)

    const syncReal = async () => {
      const count = await fetchReal()
      if (count !== null) {
        realRef.current = count
        updateDisplay()
      }
    }

    const heartbeat = async () => {
      const id = sessionRef.current
      if (!id) return
      const count = await ping(id, 'POST')
      if (count !== null) {
        realRef.current = count
        updateDisplay()
      }
    }

    void heartbeat()
    const heartbeatId = window.setInterval(heartbeat, HEARTBEAT_MS)
    const pollId = window.setInterval(() => void syncReal(), POLL_MS)

    const onLeave = () => {
      const id = sessionRef.current
      if (!id) return
      void fetch('/api/visitors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
        keepalive: true,
      })
    }

    window.addEventListener('beforeunload', onLeave)
    window.addEventListener('pagehide', onLeave)

    return () => {
      window.clearInterval(driftId)
      window.clearInterval(heartbeatId)
      window.clearInterval(pollId)
      window.removeEventListener('beforeunload', onLeave)
      window.removeEventListener('pagehide', onLeave)
      onLeave()
    }
  }, [])

  return displayCount
}
