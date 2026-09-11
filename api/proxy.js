// api/proxy.js
// Proxy reverso para imagens do Sofascore.
// Resolve o bloqueio de CORS que impede carregar imagens diretamente.

const ALLOWED_TYPES = ['player', 'team', 'manager'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, id } = req.query;

  // Validação
  if (!type || !id) {
    return res.status(400).json({ error: 'Parâmetros type e id são obrigatórios' });
  }

  if (!ALLOWED_TYPES.includes(String(type).toLowerCase())) {
    return res.status(400).json({ error: 'Tipo inválido. Use player, team ou manager.' });
  }

  if (!/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'ID deve ser numérico' });
  }

  const targetUrl = `https://api.sofascore.app/api/v1/${type}/${id}/image`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com'
      },
      redirect: 'follow'
    });

    console.log(`[Proxy] ${type}/${id} → ${response.status}`);

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Sofascore respondeu ${response.status}`,
        url: targetUrl 
      });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Proxy-Status', 'ok');

    return res.status(200).send(buffer);
  } catch (error) {
    console.error('[Proxy] Erro:', error);
    return res.status(502).json({ 
      error: 'Falha ao buscar a imagem',
      details: error.message 
    });
  }
}