'use client';
import React from 'react';

export default function BuyerTable({ items, onView }: any) {
  return (
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead>
        <tr>
          <th>Name</th><th>Phone</th><th>City</th><th>Property</th><th>Budget</th><th>Timeline</th><th>Status</th><th>Updated</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((b:any) => (
          <tr key={b.id}>
            <td>{b.fullName}</td>
            <td>{b.phone}</td>
            <td>{b.city}</td>
            <td>{b.propertyType}</td>
            <td>{b.budgetMin ?? '-'} - {b.budgetMax ?? '-'}</td>
            <td>{String(b.timeline)}</td>
            <td>{b.status}</td>
            <td>{new Date(b.updatedAt).toLocaleString()}</td>
            <td><button onClick={()=>onView?.(b.id)}>View</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
