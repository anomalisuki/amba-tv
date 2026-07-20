export default async function handler(req, res) {
  // Ambil URL dari query parameter
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter diperlukan' });
  }

  try {
    // Fetch dengan headers yang meniru browser asli
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Origin': 'https://www.visionplus.id',
        'Referer': 'https://www.visionplus.id/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    });

    // Cek jika response gagal
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Gagal fetch: ${response.status} ${response.statusText}` 
      });
    }

    // Ambil content-type asli dari response
    const contentType = response.headers.get('content-type');
    
    // Set CORS header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Set content-type sesuai aslinya
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Handle data sebagai buffer (biner) bukan text
    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal proxy error', 
      message: error.message 
    });
  }
}

// Handle OPTIONS request untuk CORS preflight
export async function OPTIONS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
}
