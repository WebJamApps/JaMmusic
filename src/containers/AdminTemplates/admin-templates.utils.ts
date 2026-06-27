import { getAllowedAdminRoles } from '../AdminUsers/admin-users.utils';

export interface Itemplate {
  _id?: string;
  type: 'Originals' | 'PubFestivalBrewery' | 'MidRangeCafeBar' | 'OnlineForm';
  stage: 'cold' | 'returning';
  subject?: string;
  bodyHtml?: string;
  footerPhotoRef?: string;
  active?: boolean;
  lastModifiedBy?: string;
  created_at?: string;
  updated_at?: string;
}

const templateBaseUrl = `${process.env.BackendUrl}/template`;

function headers(token: string, json = false): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function listTemplates(token: string, filters?: { type?: string; stage?: string; active?: boolean }): Promise<Itemplate[]> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.type) params.set('type', filters.type);
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.active !== undefined) params.set('active', String(filters.active));
  }
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${templateBaseUrl}${qs}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Itemplate[];
}

async function getTemplate(token: string, id: string): Promise<Itemplate> {
  const res = await fetch(`${templateBaseUrl}/${id}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Itemplate;
}

async function createTemplate(token: string, payload: Partial<Itemplate> & { photoData?: string }): Promise<Itemplate> {
  const res = await fetch(templateBaseUrl, {
    method: 'POST',
    headers: headers(token, true),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Itemplate;
}

async function updateTemplate(token: string, id: string, payload: Partial<Itemplate> & { photoData?: string }): Promise<Itemplate> {
  const res = await fetch(`${templateBaseUrl}/${id}`, {
    method: 'PUT',
    headers: headers(token, true),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as Itemplate;
}

async function deleteTemplate(token: string, id: string): Promise<void> {
  const res = await fetch(`${templateBaseUrl}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

async function getTemplateAssetUrl(token: string, ref: string): Promise<string> {
  const res = await fetch(`${templateBaseUrl}/assets/${ref}`, {
    headers: headers(token),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// Escapes values for CSV format
function escapeCSV(val: unknown): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generates a CSV string from an array of templates
export function exportToCSV(templates: Itemplate[]): string {
  const headersList = ['type', 'stage', 'subject', 'bodyHtml', 'footerPhotoRef', 'active'];
  const csvRows = [headersList.join(',')];
  
  for (const t of templates) {
    const row = [
      escapeCSV(t.type),
      escapeCSV(t.stage),
      escapeCSV(t.subject),
      escapeCSV(t.bodyHtml),
      escapeCSV(t.footerPhotoRef),
      escapeCSV(t.active !== false),
    ];
    csvRows.push(row.join(','));
  }
  return csvRows.join('\r\n');
}

// Parses standard CSV with support for quoted strings containing newlines and commas
export function parseCSV(text: string): Record<string, string>[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip LF after CR
      }
      row.push(currentVal);
      lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (row.length > 0 || currentVal !== '') {
    row.push(currentVal);
    lines.push(row);
  }
  
  if (lines.length < 2) return [];
  const headersRow = lines[0].map(h => h.trim());
  const results: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = lines[r];
    if (cells.length === 1 && cells[0] === '') continue; // Skip empty rows
    const obj: Record<string, string> = {};
    headersRow.forEach((header, index) => {
      obj[header] = cells[index] || '';
    });
    results.push(obj);
  }
  return results;
}

export default {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateAssetUrl,
  getAllowedAdminRoles,
  exportToCSV,
  parseCSV,
};
