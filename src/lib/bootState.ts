/** In-memory only — boot plays on every fresh page load, survives Strict Mode remount after done */
let bootComplete = false

export function isBootComplete() {
  return bootComplete
}

export function markBootComplete() {
  bootComplete = true
}
