export default async function handler(req, res) {
    // 1. Replikasi penuh CORS Unblock header injection
    res.setHeader('Access-Control-Allow-Origin', 'https://amba-tv.vercel.app');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, Referer, Origin, Authorization, X-Requested-With, Accept');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Parameter URL tidak ditemukan.' });
    }

    try {
        // 2. Tembak langsung URL tanpa memalsukan domain luar 
        // Biarkan header berjalan natural layaknya request dari domain vercel kamu sesuai instruksi ekstensi
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Origin': 'https://amba-tv.vercel.app',
                'Referer': 'https://amba-tv.vercel.app/'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).send(`Target error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Handle file transmisi stream video (.m4s, .mp4, dll)
        if (url.includes('.m4s') || url.includes('.mp4') || !contentType?.includes('text')) {
            const arrayBuffer = await response.arrayBuffer();
            return res.status(200).send(Buffer.from(arrayBuffer));
        }

        // Handle file teks manifest (.mpd)
        const data = await response.text();
        return res.status(200).send(data);

    } catch (error) {
        return res.status(500).json({ error: 'Proxy Error', details: error.message });
    }
}
