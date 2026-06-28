/** In-memory active session store (per serverless instance). */

const SESSION_TTL_MS = 90_000

const sessions = new Map<string, number>()

function prune(now: number) {
  for (const [id, lastSeen] of sessions) {
    if (now - lastSeen > SESSION_TTL_MS) sessions.delete(id)
  }
}

export function heartbeat(sessionId: string): number {
  const now = Date.now()
  prune(now)
  sessions.set(sessionId, now)
  return sessions.size
}

export function leave(sessionId: string): number {
  sessions.delete(sessionId)
  return getActiveCount()
}

export function getActiveCount(): number {
  const now = Date.now()
  prune(now)
  return sessions.size
}
