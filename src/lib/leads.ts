/** Server-only lead storage helpers. Never import into a client component. */
export type LeadRecord = {
  created_at: string;
  full_name: string;
  phone_e164: string;
  university: string;
  department: string;
  profession: string;
  source: string;
  consented_at: string;
};

export const leadSources = ['nav', 'feature', 'finale', 'book-back-cover', 'direct'] as const;
export type LeadSource = (typeof leadSources)[number];

export function parseLeadSource(input: unknown): LeadSource {
  return typeof input === 'string' && leadSources.includes(input as LeadSource)
    ? (input as LeadSource)
    : 'direct';
}

export function asciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, char => String('০১২৩৪৫৬৭৮৯'.indexOf(char)));
}

/** Accept a Bangladeshi mobile in local or international notation; store E.164 consistently. */
export function normalizeBdMobile(raw: string): string | null {
  const digits = asciiDigits(raw).replace(/[\s()+-]/g, '');
  let national = digits;
  if (/^8801[3-9]\d{8}$/.test(digits)) national = `0${digits.slice(3)}`;
  if (!/^01[3-9]\d{8}$/.test(national)) return null;
  return `+88${national}`;
}

export function cleanText(input: unknown, maxLength: number): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 2 || cleaned.length > maxLength) return null;
  if (/[\u0000-\u001f\u007f]/.test(cleaned)) return null;
  return cleaned;
}

function getConfig() {
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !/^https:\/\/[^/]+$/.test(base) || !secret) {
    throw new Error('Supabase lead-storage environment is not configured');
  }
  return { base, secret };
}

function headers(secret: string, extras: Record<string, string> = {}) {
  return {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    ...extras,
  };
}

export async function insertLead(row: Omit<LeadRecord, 'created_at' | 'consented_at'>): Promise<'created' | 'duplicate' | 'error'> {
  const { base, secret } = getConfig();
  const response = await fetch(`${base}/rest/v1/book_leads`, {
    method: 'POST',
    headers: headers(secret, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ ...row, consented_at: new Date().toISOString() }),
    cache: 'no-store',
  });
  if (response.ok) return 'created';
  const error = await response.json().catch(() => ({})) as { code?: string };
  if (response.status === 409 && error.code === '23505') return 'duplicate';
  console.error('Lead insert failed', response.status, error.code ?? 'unknown');
  return 'error';
}

/** Daily retention cleanup; no user-supplied filter enters this query. */
export async function pruneOldLeads(days = 365): Promise<void> {
  const { base, secret } = getConfig();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const response = await fetch(`${base}/rest/v1/book_leads?created_at=lt.${encodeURIComponent(cutoff)}`, {
    method: 'DELETE',
    headers: headers(secret, { Prefer: 'return=minimal' }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Lead retention cleanup failed: ${response.status}`);
}

/** Restricted to server-side daily-report route. */
export async function fetchAllLeads(): Promise<LeadRecord[]> {
  const { base, secret } = getConfig();
  const collected: LeadRecord[] = [];
  const pageSize = 1000;
  for (let page = 0; page < 20; page++) {
    const url = `${base}/rest/v1/book_leads?select=created_at,full_name,phone_e164,university,department,profession,source,consented_at&order=created_at.desc&limit=${pageSize}&offset=${page * pageSize}`;
    const response = await fetch(url, { headers: headers(secret), cache: 'no-store' });
    if (!response.ok) throw new Error(`Lead export fetch failed: ${response.status}`);
    const rows = (await response.json()) as LeadRecord[];
    collected.push(...rows);
    if (rows.length < pageSize) return collected;
  }
  // Never email a silently truncated workbook.
  throw new Error('Lead report exceeds 20,000 rows; increase pagination strategy');
}
