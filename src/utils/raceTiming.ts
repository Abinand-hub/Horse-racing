/**
 * Utility functions for race scheduling, Indian turf club post-time parsing,
 * and 1-minute-prior auto-closing of race betting markets.
 */

export interface RaceCloseStatus {
  isClosed: boolean;
  isUpcoming: boolean;
  isLive: boolean;
  raceTime: string;
  closeTimeStr: string;
  secondsToClose: number;
  countdownText: string;
  badgeColor: 'emerald' | 'amber' | 'rose' | 'slate';
}

/**
 * Parses Indian race time strings (e.g., "1:00 PM", "1:15 PM", "1:45 PM", "13:30", "1:15")
 * into a Date object on the given day (defaults to today).
 */
export function parseRaceTime(timeStr: string, baseDate: Date = new Date()): Date | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const d = new Date(baseDate);
  let hours = 0;
  let minutes = 0;

  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const raw = clean.replace(/[AP]M/, '').trim();
  const parts = raw.split(':').map((s) => parseInt(s.trim(), 10));

  if (isNaN(parts[0])) return null;
  hours = parts[0];
  minutes = isNaN(parts[1]) ? 0 : parts[1];

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  // If no AM/PM specified and hours are between 1 and 7, default to PM (afternoon racing)
  if (!isPM && !isAM && hours >= 1 && hours <= 7) hours += 12;

  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Calculates the exact betting cutoff time (1 minute prior to race post time).
 * e.g., 1:00 PM -> 12:59 PM, 1:15 PM -> 1:14 PM, 1:45 PM -> 1:44 PM.
 */
export function getBettingCloseTime(raceTimeStr: string, baseDate: Date = new Date()): Date | null {
  const raceDate = parseRaceTime(raceTimeStr, baseDate);
  if (!raceDate) return null;
  return new Date(raceDate.getTime() - 60000); // 1 minute prior
}

/**
 * Formats the 1-minute prior close time into a friendly display string (e.g. "12:59 PM", "1:14 PM").
 */
export function formatAutoCloseTime(raceTimeStr: string, baseDate: Date = new Date()): string {
  const closeDate = getBettingCloseTime(raceTimeStr, baseDate);
  if (!closeDate) return raceTimeStr;

  const hours24 = closeDate.getHours();
  const minutes = closeDate.getMinutes();
  const modifier = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${modifier}`;
}

/**
 * Determines whether betting is closed for a given race, taking into account
 * explicit status (CLOSED, RESULTED) and the 1-minute-prior auto-close rule.
 */
export function getRaceBettingCloseStatus(
  race: { race_time?: string; status?: string; is_suspended?: boolean },
  now: Date = new Date()
): RaceCloseStatus {
  const raceTime = race?.race_time || '1:00 PM';
  const status = race?.status || 'UPCOMING';
  const closeTimeStr = formatAutoCloseTime(raceTime, now);
  const closeDate = getBettingCloseTime(raceTime, now);

  if (status === 'RESULTED') {
    return {
      isClosed: true,
      isUpcoming: false,
      isLive: false,
      raceTime,
      closeTimeStr,
      secondsToClose: 0,
      countdownText: 'Resulted & Settled',
      badgeColor: 'slate',
    };
  }

  if (status === 'CLOSED') {
    return {
      isClosed: true,
      isUpcoming: false,
      isLive: false,
      raceTime,
      closeTimeStr,
      secondsToClose: 0,
      countdownText: 'Betting Closed (Off to Post)',
      badgeColor: 'rose',
    };
  }

  if (!closeDate) {
    return {
      isClosed: false,
      isUpcoming: status === 'UPCOMING',
      isLive: status === 'LIVE' || status === 'OPEN_FOR_BETTING',
      raceTime,
      closeTimeStr,
      secondsToClose: 999999,
      countdownText: `Post Time: ${raceTime}`,
      badgeColor: 'emerald',
    };
  }

  const diffMs = closeDate.getTime() - now.getTime();
  const secondsToClose = Math.round(diffMs / 1000);

  if (secondsToClose <= 0) {
    // 1-minute prior cutoff reached!
    return {
      isClosed: true,
      isUpcoming: false,
      isLive: false,
      raceTime,
      closeTimeStr,
      secondsToClose: 0,
      countdownText: `🔒 Closed at ${closeTimeStr} (1 min prior to post)`,
      badgeColor: 'rose',
    };
  }

  const mins = Math.floor(secondsToClose / 60);
  const secs = secondsToClose % 60;
  const formattedCountdown = `${mins}m ${String(secs).padStart(2, '0')}s`;

  if (mins < 2) {
    return {
      isClosed: false,
      isUpcoming: status === 'UPCOMING',
      isLive: status === 'LIVE' || status === 'OPEN_FOR_BETTING',
      raceTime,
      closeTimeStr,
      secondsToClose,
      countdownText: `⚠️ Closes in ${formattedCountdown} (at ${closeTimeStr})`,
      badgeColor: 'amber',
    };
  }

  return {
    isClosed: false,
    isUpcoming: status === 'UPCOMING',
    isLive: status === 'LIVE' || status === 'OPEN_FOR_BETTING',
    raceTime,
    closeTimeStr,
    secondsToClose,
    countdownText: `⏱️ Closes at ${closeTimeStr} (${formattedCountdown})`,
    badgeColor: 'emerald',
  };
}
