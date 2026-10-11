import { customFetch } from 'src/lib/fetch.utils';

export interface BackupRunSummary {
  name: string;
  startTime: string | null;
  startedAt: string | null;
  trigger: string | null;
  state: 'good' | 'incomplete' | 'failed';
  size: number | null;
  dropboxPath: string;
  path: string;
  collections: Record<string, Record<string, number>>;
  databases: Record<string, { ok?: boolean; reason?: string; collections?: Record<string, number> }>;
}

export interface BackupOperation {
  name: string;
  type: string;
  status: 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  finishedAt: string | null;
  progress: string;
  result?: unknown;
  error?: string;
}

export interface RestoredCollection {
  collection: string;
  restored: number;
  manifest: number | null;
}

export interface MissingIndex {
  collection: string;
  index: string;
}

export interface IndexFailure {
  collection: string;
  message: string;
}

export interface RestoreResult {
  collections: RestoredCollection[];
  missingIndexes: MissingIndex[];
  indexFailures: IndexFailure[];
}

export interface CopiedCollection {
  collection: string;
  copied: number;
  manifest: number | null;
  addressesReplaced: number;
}

export interface ReadBackResult {
  status: 'none' | 'found' | 'failed';
  remaining: number | null;
  message: string;
}

export interface CopyResult {
  collections: CopiedCollection[];
  missingIndexes: MissingIndex[];
  indexFailures: IndexFailure[];
  readBack: ReadBackResult;
  clean: boolean;
}

export interface StartOperationResponse {
  name: string;
  message: string;
}

export interface StartBackupResponse {
  name: string;
  message: string;
}

export const TOP_ADMIN_ROLE = 'Developer';

export function getAllowedAdminRoles(): string[] {
  return [TOP_ADMIN_ROLE];
}

const baseUrl = `${process.env.BackendUrl || ''}/admin/backup`;

export async function listRuns(token: string): Promise<BackupRunSummary[]> {
  const res = await customFetch(`${baseUrl}/runs`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as BackupRunSummary[];
}

export async function startBackup(token: string): Promise<StartBackupResponse> {
  const res = await customFetch(`${baseUrl}/runs`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as StartBackupResponse;
}

async function extractErrorMessage(res: Response): Promise<string> {
  let msg = `${res.status} ${res.statusText}`;
  try {
    if (typeof res.json === 'function') {
      const data = await res.json() as { message?: string };
      if (data?.message) msg = data.message;
    }
  } catch {
    // ignore
  }
  return msg;
}

export async function startRestore(token: string, runName: string, date: string): Promise<StartOperationResponse> {
  const res = await customFetch(`${baseUrl}/runs/${encodeURIComponent(runName)}/restore`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ date }),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  return await res.json() as StartOperationResponse;
}

export async function startCopyToDev(token: string, runName: string): Promise<StartOperationResponse> {
  const res = await customFetch(`${baseUrl}/runs/${encodeURIComponent(runName)}/copy-to-dev`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res));
  return await res.json() as StartOperationResponse;
}

export function getRunDate(run: BackupRunSummary | null | undefined): string {
  if (!run) return '';
  const dateStr = run.startTime || run.startedAt || run.name;
  return dateStr.slice(0, 10);
}

export async function getOperation(token: string, name: string): Promise<BackupOperation> {
  const res = await customFetch(`${baseUrl}/operations/${encodeURIComponent(name)}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as BackupOperation;
}

export async function getDatabaseDiagram(token: string): Promise<string> {
  const res = await customFetch(`${baseUrl}/diagram/database`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.text();
}

export async function getSystemDiagram(token: string): Promise<string> {
  const res = await customFetch(`${baseUrl}/diagram/system`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.text();
}

export function formatAge(ms: number): string {
  if (ms < 0) return 'just now';
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (totalHours === 0 && minutes === 0) return 'just now';
  if (totalHours === 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (totalHours < 24) return `${totalHours} hour${totalHours === 1 ? '' : 's'} ago`;
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  if (remainingHours === 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'}, ${remainingHours} hour${remainingHours === 1 ? '' : 's'} ago`;
}

export interface NewestGoodRunInfo {
  newestGoodRun: BackupRunSummary | null;
  ageMs: number | null;
  ageText: string;
  isRed: boolean;
}

export function computeNewestGoodRun(runs: BackupRunSummary[], now: Date = new Date()): NewestGoodRunInfo {
  const goodRun = runs.find((r) => r.state === 'good') || null;
  if (!goodRun) {
    return {
      newestGoodRun: null,
      ageMs: null,
      ageText: 'none',
      isRed: true,
    };
  }
  const dateStr = goodRun.startTime || goodRun.startedAt || goodRun.name;
  const runDate = new Date(dateStr);
  if (Number.isNaN(runDate.getTime())) {
    return {
      newestGoodRun: goodRun,
      ageMs: null,
      ageText: 'invalid date',
      isRed: true,
    };
  }
  const diffMs = now.getTime() - runDate.getTime();
  const isOver24Hours = diffMs > 24 * 60 * 60 * 1000;
  return {
    newestGoodRun: goodRun,
    ageMs: diffMs,
    ageText: formatAge(diffMs),
    isRed: isOver24Hours,
  };
}

export function getMostRecentRunResult(runs: BackupRunSummary[]): string {
  if (runs.length === 0) return 'none';
  return runs[0].state || 'unknown';
}

export function computeTotalCounts(run: BackupRunSummary): { totalRecords: number; totalCollections: number } {
  let totalRecords = 0;
  let totalCollections = 0;
  if (run.collections) {
    for (const collMap of Object.values(run.collections)) {
      if (!collMap || typeof collMap !== 'object') continue;
      const counts = Object.values(collMap);
      totalCollections += counts.length;
      for (const count of counts) {
        totalRecords += (typeof count === 'number' ? count : 0);
      }
    }
  }
  return { totalRecords, totalCollections };
}

export function formatRunTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export function formatRunSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let val = bytes / 1024;
  let unitIndex = 0;
  while (val >= 1024 && unitIndex < units.length - 1) {
    val /= 1024;
    unitIndex++;
  }
  const formatted = val >= 10 ? Math.round(val) : Number(val.toFixed(1));
  return `${formatted} ${units[unitIndex]}`;
}

export function isValidCopyResult(res: unknown): res is CopyResult {
  if (!res || typeof res !== 'object') return false;
  const c = res as Partial<CopyResult>;
  if (!Array.isArray(c.collections)) return false;
  if (typeof c.clean !== 'boolean') return false;
  if (!c.readBack || typeof c.readBack !== 'object') return false;
  const rb = c.readBack as Partial<ReadBackResult>;
  if (typeof rb.message !== 'string') return false;
  return rb.status === 'none' || rb.status === 'found' || rb.status === 'failed';
}

export function isValidRestoreResult(res: unknown): res is RestoreResult {
  if (!res || typeof res !== 'object') return false;
  const r = res as Partial<RestoreResult>;
  return Array.isArray(r.collections);
}

export default {
  TOP_ADMIN_ROLE,
  getAllowedAdminRoles,
  listRuns,
  startBackup,
  startRestore,
  startCopyToDev,
  getOperation,
  getRunDate,
  getDatabaseDiagram,
  getSystemDiagram,
  computeNewestGoodRun,
  getMostRecentRunResult,
  computeTotalCounts,
  formatAge,
  formatRunTime,
  formatRunSize,
  isValidCopyResult,
  isValidRestoreResult,
};
