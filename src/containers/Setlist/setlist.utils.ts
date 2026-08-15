import type { Iauth } from 'src/providers/Auth.provider';
import type { Isong } from 'src/providers/Data.provider';
import { customFetch } from 'src/lib/fetch.utils';
import commonUtils from 'src/lib/utils';

export interface ISetlistItem {
  _id?: string;
  order: number;
  songId?: string | {
    _id?: string;
    title?: string;
    artist?: string;
    url?: string;
    category?: string;
    [key: string]: unknown;
  } | null;
  title?: string;
  artist?: string;
  key?: string;
  capo?: string | number;
  tempo?: string | number;
  notes?: string;
  leadSheetUrl?: string;
  durationSeconds?: number;
  playLink?: string;
  [key: string]: unknown;
}

export interface ISetlist {
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  gigDate?: string;
  items: ISetlistItem[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export const setlistUrl = `${process.env.BackendUrl}/setlist`;

export function getAllowedAdminRoles(): string[] {
  return ['JaM-admin', 'Developer', 'clc-admin', 'tim-admin', 'web-jam-llm'];
}

export function isUserAdmin(auth?: Iauth | null): boolean {
  if (!auth || !auth.isAuthenticated || !auth.user || !auth.user.userType) {
    return false;
  }
  return getAllowedAdminRoles().includes(auth.user.userType);
}

/**
 * Parses duration from various formats (seconds number, "mm:ss", "hh:mm:ss", "3m 45s", "45s")
 * into total seconds.
 */
export function parseDuration(duration: string | number | undefined | null): number {
  if (duration === undefined || duration === null || duration === '') return 0;
  if (typeof duration === 'number') {
    return Number.isFinite(duration) ? Math.max(0, Math.floor(duration)) : 0;
  }

  const str = String(duration).trim();
  if (!str) return 0;

  // Pure digits: "185" -> 185
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Time format: "hh:mm:ss" or "mm:ss" or "m:ss"
  if (/^\d+:\d+(:\d+)?$/.test(str)) {
    const parts = str.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }

  // Text format: e.g. "1h 20m 30s", "3m 45s", "4m", "30s"
  let total = 0;
  let matched = false;
  const hoursMatch = str.match(/(\d+)\s*h/i);
  if (hoursMatch) {
    total += parseInt(hoursMatch[1], 10) * 3600;
    matched = true;
  }
  const minsMatch = str.match(/(\d+)\s*m/i);
  if (minsMatch) {
    total += parseInt(minsMatch[1], 10) * 60;
    matched = true;
  }
  const secsMatch = str.match(/(\d+)\s*s/i);
  if (secsMatch) {
    total += parseInt(secsMatch[1], 10);
    matched = true;
  }

  if (matched) return total;

  const parsedFloat = parseFloat(str);
  return Number.isFinite(parsedFloat) ? Math.max(0, Math.floor(parsedFloat)) : 0;
}

/**
 * Formats total seconds into a descriptive text string:
 * e.g. "1h 45m 30s", "1h 45m", "3m 45s", "45s", "0s".
 */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  if (seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSecs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSecs > 0 || parts.length === 0) parts.push(`${remainingSecs}s`);

  return parts.join(' ');
}

/**
 * Formats song duration into clock format: "mm:ss" or "h:mm:ss".
 * e.g. 225 -> "3:45", 3665 -> "1:01:05".
 */
export function formatSongDuration(duration?: number | string | null): string {
  const seconds = parseDuration(duration);
  if (seconds <= 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSecs = seconds % 60;

  const paddedSecs = remainingSecs < 10 ? `0${remainingSecs}` : `${remainingSecs}`;

  if (hours > 0) {
    const paddedMins = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }

  return `${minutes}:${paddedSecs}`;
}

/**
 * Sums up total duration in seconds across all setlist items.
 */
export function calculateTotalDuration(items?: ISetlistItem[] | null): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((acc, item) => acc + parseDuration(item.durationSeconds), 0);
}

/**
 * Reorders setlist items immutably and renormalizes `order` to 1..N.
 */
export function reorderItems(
  items: ISetlistItem[],
  fromIndex: number,
  toIndex: number,
): ISetlistItem[] {
  if (
    fromIndex < 0
    || fromIndex >= items.length
    || toIndex < 0
    || toIndex >= items.length
    || fromIndex === toIndex
  ) {
    return items.slice();
  }

  const result = [...items];
  const [movedItem] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, movedItem);

  return result.map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
}

/**
 * Normalizes an array of items ensuring 1-based sequential order.
 */
export function normalizeItemOrders(items: ISetlistItem[]): ISetlistItem[] {
  return items.map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
}

// API methods
export async function getSetlists(sortOption?: string): Promise<ISetlist[]> {
  const qs = sortOption ? `?sort=${encodeURIComponent(sortOption)}` : '';
  const res = await customFetch(`${setlistUrl}${qs}`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ISetlist[];
}

export async function getSetlist(id: string, sortOption?: string): Promise<ISetlist> {
  const qs = sortOption ? `?sort=${encodeURIComponent(sortOption)}` : '';
  const res = await customFetch(`${setlistUrl}/${id}${qs}`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ISetlist;
}

export async function createSetlist(
  token: string,
  payload: Partial<ISetlist>,
): Promise<ISetlist> {
  const res = await customFetch(setlistUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ISetlist;
}

export async function updateSetlist(
  token: string,
  id: string,
  payload: Partial<ISetlist>,
): Promise<ISetlist> {
  const res = await customFetch(`${setlistUrl}/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ISetlist;
}

export async function deleteSetlist(token: string, id: string): Promise<void> {
  const res = await customFetch(`${setlistUrl}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
}

export async function getSongCatalog(): Promise<Isong[]> {
  const res = await customFetch(`${process.env.BackendUrl}/song`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as Isong[];
}

export default {
  getAllowedAdminRoles,
  isUserAdmin,
  parseDuration,
  formatDuration,
  formatSongDuration,
  calculateTotalDuration,
  reorderItems,
  normalizeItemOrders,
  getSetlists,
  getSetlist,
  createSetlist,
  updateSetlist,
  deleteSetlist,
  getSongCatalog,
  notify: commonUtils.notify,
};
