const hits = new Map<string, { count: number, ts: number }>();

export async function rateLimit(req: Request, limit = 30, windowMs = 60 * 1000) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const key = ip;
  const now = Date.now();
  const item = hits.get(key) ?? { count: 0, ts: now };
  if (now - item.ts > windowMs) {
    item.count = 0;
    item.ts = now;
  }
  item.count += 1;
  hits.set(key, item);
  if (item.count > limit) throw new Error('Too many requests');
}
