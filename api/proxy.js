import https from 'https';

export default function handler(req, res) {
    // 1. Pertahankan konfigurasi CORS agar sesuai dengan ekstensi
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
        const targetUrl = new URL(url);

        // 2. Opsi request menggunakan modul HTTPS native untuk kebebasan header penuh
        const options = {
            hostname: targetUrl.hostname,
            path: targetUrl.pathname + targetUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                // Replikasi setingan ekstensi secara mentah
                'Origin': 'https://amba-tv.vercel.app',
                'Referer': 'https://amba-tv.vercel.app/'
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            // Salin Content-Type asli dari server target (baik berkas teks mpd maupun binary m4s)
            const contentType = proxyRes.headers['content-type'];
            if (contentType) {
                res.setHeader('Content-Type', contentType);
            }

            res.status(proxyRes.statusCode);

            // Kumpulkan data chunk dan langsung teruskan ke browser
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (e) => {
            res.status(500).json({ error: 'Proxy Request Error', details: e.message });
        });

        proxyReq.end();

    } catch (error) {
        return res.status(500).json({ error: 'URL Parsing Error', details: error.message });
    }
}
