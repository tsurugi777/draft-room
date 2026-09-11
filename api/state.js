// api/state.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS básico (útil se testar local em outra porta)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const key = req.query.key; // 'players' ou 'drafts'
  if (!key) return res.status(400).json({ error: 'missing key' });

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT value FROM app_state WHERE key = ${key}`;
      if (rows.length === 0) return res.status(200).json(null);
      return res.status(200).json(rows[0].value);
    }

    if (req.method === 'PUT') {
      const body = req.body; // Vercel já parseia JSON
      await sql`
        INSERT INTO app_state (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(body)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}