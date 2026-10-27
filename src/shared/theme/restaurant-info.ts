import type { LocalizedText } from "@/shared/i18n/localized";

/**
 * Restaurant info shown on the public menu (BRD BR-BR-05/06/07): tagline,
 * address + map link, phone, weekly opening hours, social links.
 *
 * Stored inside the restaurant's theme settings JSON (`info` section) until the
 * backend adds real profile fields (docs/backend-requests.md #8). Pure — no
 * React/fetch — so it's shared by the dashboard form and the guest menu.
 */

/** One weekday's hours. Times are 24h `HH:MM`; `close <= open` means past midnight. */
export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}

export interface RestaurantSocials {
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
}

export interface RestaurantInfo {
  tagline: LocalizedText;
  address: LocalizedText;
  /** Optional maps link (e.g. Google Maps) for directions. */
  mapUrl: string;
  phone: string;
  /** 7 entries indexed like `Date.getDay()` (0 = Sunday), or empty = not set. */
  hours: DayHours[];
  socials: RestaurantSocials;
}

export const DEFAULT_RESTAURANT_INFO: RestaurantInfo = {
  tagline: {},
  address: {},
  mapUrl: "",
  phone: "",
  hours: [],
  socials: { instagram: "", facebook: "", tiktok: "", website: "" },
};

/** A sensible starting week when an owner first turns hours on. */
export const DEFAULT_WEEK: DayHours[] = Array.from({ length: 7 }, () => ({
  closed: false,
  open: "09:00",
  close: "23:00",
}));

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const str = (v: unknown): string => (typeof v === "string" ? v : "");

function localized(v: unknown): LocalizedText {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: LocalizedText = {};
  for (const [k, val] of Object.entries(v)) if (typeof val === "string") out[k] = val;
  return out;
}

function dayHours(v: unknown): DayHours | null {
  if (!v || typeof v !== "object") return null;
  const d = v as Record<string, unknown>;
  const open = str(d.open);
  const close = str(d.close);
  if (!TIME.test(open) || !TIME.test(close)) return null;
  return { closed: d.closed === true, open, close };
}

/** Coerce untrusted stored JSON into a complete {@link RestaurantInfo}. */
export function normalizeRestaurantInfo(raw: unknown): RestaurantInfo {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const hours = Array.isArray(r.hours) ? r.hours.map(dayHours) : [];
  const s = (r.socials && typeof r.socials === "object" ? r.socials : {}) as Record<string, unknown>;
  return {
    tagline: localized(r.tagline),
    address: localized(r.address),
    mapUrl: str(r.mapUrl),
    phone: str(r.phone),
    // All 7 days must be valid, otherwise treat hours as "not set".
    hours: hours.length === 7 && hours.every(Boolean) ? (hours as DayHours[]) : [],
    socials: {
      instagram: str(s.instagram),
      facebook: str(s.facebook),
      tiktok: str(s.tiktok),
      website: str(s.website),
    },
  };
}

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/**
 * Whether the restaurant is open at `at` (the guest's local time), or `null`
 * when hours aren't set. Handles shifts past midnight (e.g. 18:00–02:00): the
 * previous day's late shift counts in the early hours.
 */
export function isOpenAt(hours: DayHours[], at: Date): boolean | null {
  if (hours.length !== 7) return null;
  const now = at.getHours() * 60 + at.getMinutes();
  const today = hours[at.getDay()];
  const yesterday = hours[(at.getDay() + 6) % 7];

  if (!yesterday.closed && minutes(yesterday.close) <= minutes(yesterday.open)) {
    if (now < minutes(yesterday.close)) return true; // still in last night's shift
  }
  if (today.closed) return false;
  const open = minutes(today.open);
  const close = minutes(today.close);
  return close > open ? now >= open && now < close : now >= open; // overnight: open till midnight today
}

/**
 * Normalize a social entry to a full URL: keeps `http(s)://` links, turns
 * `@handle` / bare handles into the network's profile URL.
 */
export function socialUrl(network: keyof RestaurantSocials, value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "");
  switch (network) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    default:
      return `https://${v}`;
  }
}
