import { parse } from 'csv-parse/sync';
import { createBuyerSchema } from './validators/buyer';
import { prisma } from './prisma';

export function parseCsvRows(csvText: string) {
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  return records as Record<string,string>[];
}

export function validateCsvRow(row: Record<string,string>, rowNum: number) {
  const input = {
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    city: row.city,
    propertyType: row.propertyType,
    bhk: row.bhk,
    purpose: row.purpose,
    budgetMin: row.budgetMin,
    budgetMax: row.budgetMax,
    timeline: row.timeline,
    source: row.source,
    notes: row.notes,
    tags: row.tags ? row.tags.split('|').map(s => s.trim()).filter(Boolean) : []
  };

  const result = createBuyerSchema.safeParse(input);
  if (!result.success) return { ok: false, row: rowNum, errors: result.error.issues.map(i => i.message) };
  return { ok: true, row: rowNum, data: result.data };
}

export async function importCsvTransactional(csvText: string, ownerId: string) {
  const rows = parseCsvRows(csvText);
  if (rows.length > 200) return { ok: false, error: 'Max 200 rows allowed' };
  const validated = rows.map((r, idx) => validateCsvRow(r, idx + 1));
  const errors = validated.filter(v => !v.ok);
  const valids = validated.filter(v => v.ok).map(v => (v as any).data);

  if (errors.length) return { ok: false, errors };

  const created = await prisma.$transaction(valids.map(v => prisma.buyer.create({ data: {
    fullName: v.fullName,
    email: v.email ?? null,
    phone: v.phone,
    city: v.city,
    propertyType: v.propertyType,
    bhk: v.bhk ? (v.bhk === '1' ? '_1' : v.bhk === '2' ? '_2' : v.bhk === '3' ? '_3' : v.bhk === '4' ? '_4' : 'Studio') : null,
    purpose: v.purpose,
    budgetMin: v.budgetMin ?? null,
    budgetMax: v.budgetMax ?? null,
    timeline: v.timeline === '0-3m' ? '_0_3m' : v.timeline === '3-6m' ? '_3_6m' : v.timeline === '>6m' ? '_GT6m' : 'Exploring',
    source: v.source === 'Walk-in' ? 'Walk_in' : v.source,
    notes: v.notes ?? null,
    tags: v.tags ?? [],
    ownerId
  }})));

  return { ok: true, count: created.length };
}
