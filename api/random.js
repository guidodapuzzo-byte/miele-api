import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const items = await redis.lrange('miele', 0, -1);
  if (!items || items.length === 0) return res.status(404).json({ error: 'empty' });

  const raw = items[Math.floor(Math.random() * items.length)];
  const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;

  return res.status(200).json({
    activity: obj.activity,
    type: obj.type,
    key: obj.key,
    time: obj.time || '',
    _n: obj._n || '',
    _time_full: obj._time_full || '',
    _country: obj._country || '',
    _city: obj._city || '',
    _device: obj._device || '',
    _lang: obj._lang || '',
    _len: obj._len || ''
  });
}
