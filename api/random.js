// api/random.js - LOGICA UGUALE A PRIMA
// Legge un contenuto a caso dalla lista "miele" su Upstash
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    const list = await redis.lrange('miele', 0, 50);
    if (!list || list.length === 0) {
      return res.status(200).json({
        activity: "il miele e vuoto - lascia il primo contenuto",
        type: "miele",
        participants: 1,
        price: 0,
        accessibility: 0.1,
        key: "0000000"
      });
    }
    const pick = list[Math.floor(Math.random() * list.length)];
    const entry = typeof pick === 'string' ? JSON.parse(pick) : pick;
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(entry);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
