import { validateCsvRow } from '../src/lib/csv';

describe('CSV validator', () => {
  it('valid row passes', () => {
    const row = { fullName:'John Doe', phone:'9876543210', city:'Chandigarh', propertyType:'Apartment', bhk:'2', purpose:'Buy', timeline:'0-3m', source:'Website' } as any;
    const res = validateCsvRow(row, 1);
    expect(res.ok).toBe(true);
  });

  it('invalid phone fails', () => {
    const row = { fullName:'X', phone:'abc', city:'Chandigarh', propertyType:'Apartment', bhk:'2', purpose:'Buy', timeline:'0-3m', source:'Website' } as any;
    const res = validateCsvRow(row, 1);
    expect(res.ok).toBe(false);
  });
});
