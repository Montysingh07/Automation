import { z } from 'zod';

export const buyerInput = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.enum(['Chandigarh','Mohali','Zirakpur','Panchkula','Other']),
  propertyType: z.enum(['Apartment','Villa','Plot','Office','Retail']),
  bhk: z.enum(['1','2','3','4','Studio']).optional(),
  purpose: z.enum(['Buy','Rent']),
  budgetMin: z.preprocess(v => v === '' ? undefined : Number(v), z.number().int().nonnegative().optional()),
  budgetMax: z.preprocess(v => v === '' ? undefined : Number(v), z.number().int().nonnegative().optional()),
  timeline: z.enum(['0-3m','3-6m','>6m','Exploring']),
  source: z.enum(['Website','Referral','Walk-in','Call','Other']),
  notes: z.string().max(1000).optional().or(z.literal('')).transform(v => v || undefined),
  tags: z.array(z.string()).optional().or(z.undefined())
});

export const createBuyerSchema = buyerInput.superRefine((data, ctx) => {
  if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'BHK is required for Apartment or Villa', path: ['bhk'] });
  }
  if (data.budgetMin !== undefined && data.budgetMax !== undefined && data.budgetMax < data.budgetMin) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'budgetMax must be >= budgetMin', path: ['budgetMax'] });
  }
});

export type CreateBuyerInput = z.infer<typeof buyerInput>;
