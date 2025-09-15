import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBuyerSchema } from '@/lib/validators/buyer';

const timelineMapRev: Record<string,string> = { '_0_3m': '0-3m', '_3_6m': '3-6m', '_GT6m': '>6m', 'Exploring': 'Exploring' };
const bhkMap: Record<string,string> = { '_1':'1','_2':'2','_3':'3','_4':'4','Studio':'Studio' };

export async function GET(req: Request, { params } : { params: { id: string }}) {
  const id = params.id;
  const buyer = await prisma.buyer.findUnique({ where: { id }});
  if (!buyer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(buyer);
}

export async function PUT(req: Request, { params } : { params: { id: string }}) {
  const id = params.id;
  const body = await req.json();
  const parsed = createBuyerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  // concurrency check
  if (!body.updatedAt) return NextResponse.json({ error: 'Missing updatedAt for concurrency check' }, { status: 400 });
  const existing = await prisma.buyer.findUnique({ where: { id }});
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (new Date(body.updatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
    return NextResponse.json({ error: 'Record changed, please refresh' }, { status: 409 });
  }

  const prev = existing;
  const ownerId = 'demo-user-id'; // replace with auth user

  const updated = await prisma.buyer.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone,
      city: parsed.data.city,
      propertyType: parsed.data.propertyType,
      bhk: parsed.data.bhk ? (parsed.data.bhk === '1' ? '_1' : parsed.data.bhk === '2' ? '_2' : parsed.data.bhk === '3' ? '_3' : parsed.data.bhk === '4' ? '_4' : 'Studio') : null,
      purpose: parsed.data.purpose,
      budgetMin: parsed.data.budgetMin ?? null,
      budgetMax: parsed.data.budgetMax ?? null,
      timeline: parsed.data.timeline === '0-3m' ? '_0_3m' : parsed.data.timeline === '3-6m' ? '_3_6m' : parsed.data.timeline === '>6m' ? '_GT6m' : 'Exploring',
      source: parsed.data.source === 'Walk-in' ? 'Walk_in' : parsed.data.source,
      notes: parsed.data.notes ?? null,
      tags: parsed.data.tags ?? []
    }
  });

  const diff: any = {};
  for (const k of Object.keys(parsed.data) as (keyof typeof parsed.data)[]) {
    // simple diffing
    // @ts-ignore
    if ((prev as any)[k] !== (updated as any)[k]) diff[k] = { from: (prev as any)[k], to: (updated as any)[k] };
  }

  await prisma.buyerHistory.create({ data: { buyerId: id, changedBy: ownerId, diff }});
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params } : { params: { id: string }}) {
  const id = params.id;
  // ownership check would be here (skipped in demo)
  await prisma.buyer.delete({ where: { id }});
  return NextResponse.json({ ok: true });
}
