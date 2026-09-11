// api/proxy.js
export default async function handler(req, res) {
  // Pega a URL da imagem do Sofascore passada como parâmetro
  const { url } = req.query;

  // Verifica se a URL foi fornecida
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Adiciona um cabeçalho "User-Agent" para simular um navegador real.
    // Isso pode ajudar a evitar bloqueios do Sofascore.
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Se a resposta do Sofascore não for bem-sucedida, repassa o erro
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }

    // Pega o tipo de conteúdo (ex: image/png, image/jpeg) e repassa
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);
    
    // Permite que a imagem seja cacheada pelo CDN da Vercel por um longo tempo
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Converte a resposta para um buffer e envia para o navegador
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}