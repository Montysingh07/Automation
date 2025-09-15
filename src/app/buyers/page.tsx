import { prisma } from '@/lib/prisma';
import BuyerTable from '@/components/BuyerTable';
import Link from 'next/link';

export default async function BuyersPage({ searchParams }: { searchParams: any }) {
  const page = Number(searchParams.page || 1);
  const pageSize = 10;
  const where: any = {};
  if (searchParams.city) where.city = searchParams.city;
  if (searchParams.propertyType) where.propertyType = searchParams.propertyType;
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.timeline) {
    const map: any = { '0-3m':'_0_3m','3-6m':'_3_6m','>6m':'_GT6m','Exploring':'Exploring' };
    where.timeline = map[searchParams.timeline] ?? undefined;
  }
  if (searchParams.q) {
    where.OR = [
      { fullName: { contains: searchParams.q, mode: 'insensitive' } },
      { email: { contains: searchParams.q, mode: 'insensitive' } },
      { phone: { contains: searchParams.q } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.buyer.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page-1)*pageSize, take: pageSize }),
    prisma.buyer.count({ where })
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1>Buyers</h1>
      <div style={{ marginBottom: 12 }}>
        <Link href="/buyers/new"><button>Create new</button></Link>
      </div>

      {/* @ts-expect-error Client component */}
      <BuyerTable items={items} onView={(id:string)=> window.location.href = `/buyers/${id}`} />

      <div style={{ marginTop: 12 }}>
        Page {page} / {totalPages}
        <div>
          {page > 1 && <a href={`?${new URLSearchParams({ ...searchParams, page: String(page-1) }).toString()}`}>Prev</a>}
          {page < totalPages && <a href={`?${new URLSearchParams({ ...searchParams, page: String(page+1) }).toString()}`} style={{ marginLeft: 8 }}>Next</a>}
        </div>
      </div>
    </div>
  );
}
