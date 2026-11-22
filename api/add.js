import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, activity } = req.body || {};
  if (!type || !activity) return res.status(400).json({ error: 'missing fields' });

  const time = new Date().toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');

  // Solo per te, nel JSON grezzo
  const n = await redis.incr('miele:counter');
  const ua = req.headers['user-agent'] || '';
  const device = ua.toLowerCase().includes('mobile') ? 'mobile' : 'desktop';
  const country = req.headers['x-vercel-ip-country'] || '';
  const city = req.headers['x-vercel-ip-city'] || '';
  const lang = String(req.headers['accept-language'] || '').slice(0, 5);

  const entry = {
    activity: String(activity).slice(0, 80),
    type: String(type).slice(0, 30),
    time: time,
    key: Date.now().toString(),
    _n: n,
    _time_full: new Date().toISOString(),
    _country: country,
    _city: city,
    _device: device,
    _lang: lang,
    _len: String(activity).length
  };

  await redis.lpush('miele', JSON.stringify(entry));
  return res.status(200).json(entry);
}
