/**
 * Free-trial clock (BRD §4, confirmed decisions): 7 days, then a 3-day grace
 * period before the public menu stops. Display-only for now — the backend does
 * not enforce trials yet (see docs/backend-requests.md).
 *
 * The trial starts at sign-up (`createdAt`); email verification doesn't exist yet.
 */
export const TRIAL_DAYS = 7;
export const TRIAL_GRACE_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface TrialInfo {
  endsAt: Date;
  /** Whole days left, rounded up; 0 once ended. */
  daysLeft: number;
  expired: boolean;
}

/** Trial status for a restaurant created at `createdAt` (ISO). Null if unknown. */
export function trialInfo(createdAt: string | undefined, now: Date): TrialInfo | null {
  if (!createdAt) return null;
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return null;
  const endsAt = new Date(start.getTime() + TRIAL_DAYS * DAY_MS);
  const msLeft = endsAt.getTime() - now.getTime();
  return { endsAt, daysLeft: Math.max(0, Math.ceil(msLeft / DAY_MS)), expired: msLeft <= 0 };
}
