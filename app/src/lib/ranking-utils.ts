/**
 * ranking-utils.ts
 * 
 * Pure business-logic module for computing player badges, streaks,
 * and position deltas for the PokerDash ranking system.
 */

export interface SessionWithResults {
  id: string
  closedAt: Date | null
  cashOuts: Array<{
    playerId: string
    netResult: number
  }>
  buyIns: Array<{
    playerId: string
  }>
}

export interface BadgeData {
  /** "inactive" = 🥶, "streak" = 🔥, null = no badge */
  badge: "inactive" | "streak" | null
  /** Number of consecutive wins (only relevant when badge === "streak") */
  streakCount: number
  /** Position delta: negative = moved up (improved), positive = moved down, 0 = same, null = new player */
  positionDelta: number | null
}

/**
 * Determine if a player is inactive.
 * A player is inactive if they did NOT participate (have a buyIn) 
 * in any of the last `threshold` closed sessions.
 */
function isPlayerInactive(
  playerId: string,
  recentSessions: SessionWithResults[],
  threshold: number = 4
): boolean {
  const lastN = recentSessions.slice(0, threshold)
  return !lastN.some(session =>
    session.buyIns.some(b => b.playerId === playerId)
  )
}

/**
 * Calculate win streak for a player.
 * Counts consecutive sessions with netResult > 0, starting from the most recent.
 * Only counts sessions where the player actually participated (has a cashOut).
 */
function getWinStreak(
  playerId: string,
  sessions: SessionWithResults[]
): number {
  let streak = 0

  for (const session of sessions) {
    const cashOut = session.cashOuts.find(c => c.playerId === playerId)
    if (!cashOut) continue // Player didn't play this session, skip
    
    if (cashOut.netResult > 0) {
      streak++
    } else {
      break // Streak broken
    }
  }

  return streak
}

/**
 * Compute a ranking based on win rate for a set of sessions.
 * Returns an array of player IDs sorted by win rate desc, then profit desc.
 * This is used to compare current vs previous rankings.
 */
function computeWinRateRanking(
  sessions: SessionWithResults[],
  playerIds: string[],
  halfSessions: number
): string[] {
  const playerStats = playerIds.map(playerId => {
    const sessionsPlayed = new Set<string>()
    let wins = 0
    let totalProfit = 0

    for (const session of sessions) {
      const hasBuyIn = session.buyIns.some(b => b.playerId === playerId)
      if (hasBuyIn) {
        sessionsPlayed.add(session.id)
      }
      
      const cashOut = session.cashOuts.find(c => c.playerId === playerId)
      if (cashOut) {
        if (cashOut.netResult > 0) wins++
        totalProfit += cashOut.netResult
      }
    }

    const totalSessions = sessionsPlayed.size
    const winRate = totalSessions > 0 ? (wins / totalSessions) * 100 : 0
    const isTourist = totalSessions < halfSessions

    return { playerId, winRate, totalProfit, totalSessions, isTourist }
  }).filter(p => p.totalSessions > 0)

  // Sort: Regulars first, then by winRate desc, then profit desc
  playerStats.sort((a, b) => {
    if (a.isTourist !== b.isTourist) return a.isTourist ? 1 : -1
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    return b.totalProfit - a.totalProfit
  })

  return playerStats.map(p => p.playerId)
}

/**
 * Main function: compute badge data for all players.
 * 
 * @param closedSessions - All closed sessions, sorted by closedAt DESC (most recent first)
 * @param playerIds - Array of all player IDs that have at least 1 session
 * @returns Map of playerId -> BadgeData
 */
export function computePlayerBadges(
  closedSessions: SessionWithResults[],
  playerIds: string[]
): Map<string, BadgeData> {
  const result = new Map<string, BadgeData>()
  const totalSessionsCount = closedSessions.length
  const halfSessions = totalSessionsCount / 2

  // Compute current ranking (all sessions)
  const currentRanking = computeWinRateRanking(closedSessions, playerIds, halfSessions)

  // Compute previous ranking (excluding the most recent session)
  const sessionsWithoutLast = closedSessions.slice(1)
  const previousHalf = sessionsWithoutLast.length / 2
  const previousRanking = sessionsWithoutLast.length > 0
    ? computeWinRateRanking(sessionsWithoutLast, playerIds, previousHalf)
    : []

  for (const playerId of playerIds) {
    // Level 1: Inactivity check
    if (isPlayerInactive(playerId, closedSessions, 4)) {
      const currentPos = currentRanking.indexOf(playerId)
      const previousPos = previousRanking.indexOf(playerId)

      result.set(playerId, {
        badge: "inactive",
        streakCount: 0,
        positionDelta: previousPos === -1 ? null :
          currentPos === -1 ? null :
          currentPos - previousPos,
      })
      continue
    }

    // Level 2: Win streak check
    const streak = getWinStreak(playerId, closedSessions)

    // Position delta
    const currentPos = currentRanking.indexOf(playerId)
    const previousPos = previousRanking.indexOf(playerId)
    const positionDelta = previousPos === -1 ? null :
      currentPos === -1 ? null :
      currentPos - previousPos

    result.set(playerId, {
      badge: streak >= 2 ? "streak" : null,
      streakCount: streak,
      positionDelta,
    })
  }

  return result
}
