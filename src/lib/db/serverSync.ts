import { db } from './schema'

/**
 * Push current IndexedDB state (userProgress + practiceSessions) to the server.
 * Fire-and-forget — never throws.
 */
export async function syncToServer(): Promise<void> {
  try {
    const [progress, sessions] = await Promise.all([
      db.userProgress.get('singleton'),
      db.practiceSessions.toArray(),
    ])
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, sessions }),
    })
  } catch {
    // best-effort, silently ignore
  }
}

/**
 * On app boot: pull saved progress from the server and populate IndexedDB.
 * Server wins if it has more completed lessons or more practice time.
 * Never throws.
 */
export async function restoreFromServer(): Promise<void> {
  try {
    const res = await fetch('/api/sync')
    if (!res.ok) return
    const { progress, sessions } = await res.json()

    if (progress) {
      const local = await db.userProgress.get('singleton')
      const serverLessons = progress.completedLessonIds?.length ?? 0
      const localLessons  = local?.completedLessonIds?.length ?? 0
      const serverMinutes = progress.totalPracticeMinutes ?? 0
      const localMinutes  = local?.totalPracticeMinutes ?? 0

      // Use server data if it's richer, or if there's nothing locally
      if (!local || serverLessons > localLessons || serverMinutes > localMinutes) {
        await db.userProgress.put(progress)
      }
    }

    if (sessions?.length) {
      // Add any sessions from the server that aren't already in IndexedDB
      // bulkPut uses primary key so it won't duplicate existing records
      await db.practiceSessions.bulkPut(sessions)
    }
  } catch {
    // best-effort, silently ignore
  }
}
