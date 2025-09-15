import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBuyerSchema } from '@/lib/validators/buyer';
import { rateLimit } from '@/lib/rateLimit';

const timelineMap: Record<string,string> = { '0-3m': '_0_3m', '3-6m': '_3_6m', '>6m': '_GT6m', 'Exploring': 'Exploring' };
const sourceMap: Record<string,string> = { 'Walk-in': 'Walk_in' };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '10');
  const q = url.searchParams.get('q') || undefined;
  const city = url.searchParams.get('city') || undefined;
  const propertyType = url.searchParams.get('propertyType') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const timeline = url.searchParams.get('timeline') || undefined;

  const where: any = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timelineMap[timeline] ?? undefined;
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.buyer.count({ where })
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(req: Request) {
  await rateLimit(req);
  const body = await req.json();
  const parsed = createBuyerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const data = parsed.data;
  const ownerId = 'demo-user-id'; // replace with auth user id

  const created = await prisma.buyer.create({
    data: {
      fullName: data.fullName,
      email: data.email ?? null,
      phone: data.phone,
      city: data.city,
      propertyType: data.propertyType,
      bhk: data.bhk ? (data.bhk === '1' ? '_1' : data.bhk === '2' ? '_2' : data.bhk === '3' ? '_3' : data.bhk === '4' ? '_4' : 'Studio') : null,
      purpose: data.purpose,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      timeline: timelineMap[data.timeline] as any,
      source: sourceMap[data.source] ?? data.source,
      notes: data.notes ?? null,
      tags: data.tags ?? [],
      ownerId
    }
  });

  await prisma.buyerHistory.create({ data: { buyerId: created.id, changedBy: ownerId, diff: { created } }});

  return NextResponse.json(created, { status: 201 });
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBuyerSchema } from '@/lib/validators/buyer';
import { rateLimit } from '@/lib/rateLimit';

const timelineMap: Record<string,string> = { '0-3m': '_0_3m', '3-6m': '_3_6m', '>6m': '_GT6m', 'Exploring': 'Exploring' };
const sourceMap: Record<string,string> = { 'Walk-in': 'Walk_in' };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '10');
  const q = url.searchParams.get('q') || undefined;
  const city = url.searchParams.get('city') || undefined;
  const propertyType = url.searchParams.get('propertyType') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const timeline = url.searchParams.get('timeline') || undefined;

  const where: any = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timelineMap[timeline] ?? undefined;
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.buyer.count({ where })
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(req: Request) {
  await rateLimit(req);
  const body = await req.json();
  const parsed = createBuyerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const data = parsed.data;
  const ownerId = 'demo-user-id'; // replace with auth user id

  const created = await prisma.buyer.create({
    data: {
      fullName: data.fullName,
      email: data.email ?? null,
      phone: data.phone,
      city: data.city,
      propertyType: data.propertyType,
      bhk: data.bhk ? (data.bhk === '1' ? '_1' : data.bhk === '2' ? '_2' : data.bhk === '3' ? '_3' : data.bhk === '4' ? '_4' : 'Studio') : null,
      purpose: data.purpose,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      timeline: timelineMap[data.timeline] as any,
      source: sourceMap[data.source] ?? data.source,
      notes: data.notes ?? null,
      tags: data.tags ?? [],
      ownerId
    }
  });

  await prisma.buyerHistory.create({ data: { buyerId: created.id, changedBy: ownerId, diff: { created } }});

  return NextResponse.json(created, { status: 201 });
}
