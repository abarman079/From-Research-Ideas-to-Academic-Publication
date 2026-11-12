import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { fetchAllLeads, pruneOldLeads, type LeadRecord } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function safeExcelText(value: string) {
  // Defense-in-depth against spreadsheet formula injection.
  return /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
}

async function workbookFor(leads: LeadRecord[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'IOJH';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Book registrations', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = [
    { header: 'Submitted at (UTC)', key: 'date', width: 24 },
    { header: 'Full name', key: 'name', width: 28 },
    { header: 'Phone (E.164)', key: 'phone', width: 22 },
    { header: 'University / Institution', key: 'university', width: 38 },
    { header: 'Department', key: 'department', width: 30 },
    { header: 'Profession', key: 'profession', width: 26 },
    { header: 'Registration source', key: 'source', width: 23 },
    { header: 'Consent date (UTC)', key: 'consent', width: 24 },
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF19151C' } };
  sheet.getRow(1).height = 25;
  sheet.getColumn(3).numFmt = '@';
  for (const item of leads) {
    sheet.addRow({
      date: item.created_at,
      name: safeExcelText(item.full_name),
      phone: item.phone_e164,
      university: safeExcelText(item.university),
      department: safeExcelText(item.department),
      profession: safeExcelText(item.profession),
      source: item.source,
      consent: item.consented_at,
    });
  }
  sheet.autoFilter = { from: 'A1', to: `H${Math.max(1, leads.length + 1)}` };
  const bytes = await workbook.xlsx.writeBuffer();
  return Buffer.from(bytes);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!apiKey || !from || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Report service is not configured' }, { status: 503 });
  }
  try {
    await pruneOldLeads();
    const leads = await fetchAllLeads();
    const attachment = await workbookFor(leads);
    const date = new Date().toISOString().slice(0, 10);
    const email = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: ['hr.iojhltd@gmail.com'],
        subject: `IOJH book registrations — ${date} (${leads.length} leads)`,
        text: `Attached is the current IOJH book-interest dataset with ${leads.length} entries. Personal data: store and share only with authorized staff.`,
        attachments: [{ filename: `IOJH_book_registrations_${date}.xlsx`, content: attachment.toString('base64') }],
      }),
      cache: 'no-store',
    });
    if (!email.ok) {
      console.error('Registration report email failed', email.status);
      return NextResponse.json({ error: 'Email delivery rejected' }, { status: 502 });
    }
    return NextResponse.json({ delivered: true, rows: leads.length, date }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Registration report failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Report generation failed' }, { status: 503 });
  }
}
