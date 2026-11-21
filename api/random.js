// api/random.js - Restituisce un contenuto a caso dal miele
// GET /api/random -> { activity, type, participants, price, accessibility, key }
// Compatibile con ESP32-C3 + ST7735: activity = contenuto, type = nome
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const fallback = [
  { activity: "crea un semplice strumento musicale", type: "miele", participants: 1, price: 0.4, accessibility: 0.25, key: "7091374" },
  { activity: "fai una passeggiata e fotografa 5 dettagli", type: "marco", participants: 1, price: 0, accessibility: 0.1, key: "1000003" },
  { activity: "ascolta un disco intero senza saltare brani", type: "giulia", participants: 1, price: 0, accessibility: 0.1, key: "1000006" },
  { activity: "scrivi 3 cose belle di oggi", type: "miele", participants: 1, price: 0, accessibility: 0.1, key: "1000016" },
  { activity: "guarda il tramonto senza telefono", type: "salerno", participants: 1, price: 0, accessibility: 0.1, key: "1000015" }
];

export default async function handler(req, res) {
  let pool = fallback;
  try {
    const lista = await redis.lrange('miele', 0, -1);
    if (lista && lista.length > 0) {
      const parsed = lista.map((s) => {
        try { return JSON.parse(s); } catch { return null; }
      }).filter(Boolean);
      if (parsed.length > 0) pool = parsed;
    }
  } catch (e) {
    pool = fallback;
  }

  const random = pool[Math.floor(Math.random() * pool.length)];
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json(random);
}
