/** In-memory — skip replay only after the sequence fully finishes (not at start) */
let docsEntryComplete = false

export function isDocsEntryComplete() {
  return docsEntryComplete
}

export function markDocsEntryComplete() {
  docsEntryComplete = true
}

export function resetDocsEntryFlag() {
  docsEntryComplete = false
}
