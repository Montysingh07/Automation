'use client';
import React, { useState } from 'react';
import { z } from 'zod';
import { createBuyerSchema } from '@/lib/validators/buyer';

type Props = { initial?: any, onSaved?: (b:any)=>void };

export default function BuyerForm({ initial = {}, onSaved }: Props) {
  const [form, setForm] = useState<any>(initial);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function update(k:string, v:any){ setForm((p:any)=> ({...p, [k]: v})); }

  async function submit(e: any) {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    // client-side Zod parse
    const parsed = createBuyerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.format());
      setLoading(false);
      return;
    }
    const res = await fetch('/api/buyers', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) {
      setError(await res.json());
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLoading(false);
    onSaved?.(data);
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Full name</label>
        <input value={form.fullName||''} onChange={e=>update('fullName', e.target.value)} required />
      </div>
      <div>
        <label>Phone</label>
        <input value={form.phone||''} onChange={e=>update('phone', e.target.value)} required />
      </div>
      <div>
        <label>Email</label>
        <input value={form.email||''} onChange={e=>update('email', e.target.value)} />
      </div>
      <div>
        <label>Property Type</label>
        <select value={form.propertyType||''} onChange={e=>update('propertyType', e.target.value)}>
          <option value="">Select</option>
          <option>Apartment</option><option>Villa</option><option>Plot</option><option>Office</option><option>Retail</option>
        </select>
      </div>
      <div>
        <label>BHK (if Apartment/Villa)</label>
        <select value={form.bhk||''} onChange={e=>update('bhk', e.target.value)}>
          <option value="">Select</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="Studio">Studio</option>
        </select>
      </div>

      <div>
        <label>Purpose</label>
        <select value={form.purpose||'Buy'} onChange={e=>update('purpose', e.target.value)}>
          <option>Buy</option><option>Rent</option>
        </select>
      </div>

      <div>
        <label>Budget Min</label>
        <input value={form.budgetMin||''} type="number" onChange={e=>update('budgetMin', e.target.value)} />
      </div>
      <div>
        <label>Budget Max</label>
        <input value={form.budgetMax||''} type="number" onChange={e=>update('budgetMax', e.target.value)} />
      </div>

      <div>
        <label>Timeline</label>
        <select value={form.timeline||'0-3m'} onChange={e=>update('timeline', e.target.value)}>
          <option>0-3m</option><option>3-6m</option><option>&gt;6m</option><option>Exploring</option>
        </select>
      </div>

      <div>
        <label>Source</label>
        <select value={form.source||'Website'} onChange={e=>update('source', e.target.value)}>
          <option>Website</option><option>Referral</option><option>Walk-in</option><option>Call</option><option>Other</option>
        </select>
      </div>

      <div>
        <label>Notes</label>
        <textarea value={form.notes||''} onChange={e=>update('notes', e.target.value)} maxLength={1000} />
      </div>

      <div>
        <label>Tags (comma separated)</label>
        <input value={form.tags?.join(',')||''} onChange={e=>update('tags', e.target.value.split(',').map((s:any)=>s.trim()).filter(Boolean))} />
      </div>

      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>

      {error && <pre style={{color:'red'}}>{JSON.stringify(error, null, 2)}</pre>}
    </form>
  );
}
