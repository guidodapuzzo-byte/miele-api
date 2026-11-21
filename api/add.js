// api/add.js - Raccoglitore generico
// POST /api/add  body: { nome: "marco", contenuto: "fai una passeggiata..." }
// Salva in Redis come { activity: contenuto, type: nome, key }
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "solo POST" });
  }

  const body = req.body || {};
  // Accetta sia i nomi nuovi (nome/contenuto) sia i vecchi (type/activity) per compatibilità
  const nomeRaw = body.nome || body.type || body.name || "";
  const contenutoRaw = body.contenuto || body.activity || body.content || "";

  if (typeof nomeRaw !== 'string' || !nomeRaw.trim()) {
    return res.status(400).json({ error: "manca nome" });
  }
  if (typeof contenutoRaw !== 'string' || !contenutoRaw.trim()) {
    return res.status(400).json({ error: "manca contenuto" });
  }

  const nome = nomeRaw.trim().toLowerCase().slice(0, 30);
  const contenuto = contenutoRaw.trim().toLowerCase().slice(0, 80);

  if (nome.length < 2) return res.status(400).json({ error: "nome troppo corto" });
  if (contenuto.length < 3) return res.status(400).json({ error: "contenuto troppo corto" });
  if (contenuto.includes('http') || contenuto.includes('<') || contenuto.includes('>')) {
    return res.status(400).json({ error: "niente link o html" });
  }

  const key = String(Math.floor(1000000 + Math.random() * 9000000));
  const item = {
    activity: contenuto,
    type: nome,
    participants: 1,
    price: 0,
    accessibility: 0.2,
    key
  };

  await redis.lpush('miele', JSON.stringify(item));
  await redis.ltrim('miele', 0, 999);

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ ok: true, key, miele: item });
}
