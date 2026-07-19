export default async function handler(req, res) {
    // 1. Izinkan akses dari origin manapun agar terbebas dari masalah CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

    // 2. Tangani request Preflight (OPTIONS) otomatis dari browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Ambil URL target dari parameter query (misal: /api/proxy?url=https://...)
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Parameter URL tidak ditemukan.' });
    }

    try {
        // 4. Lakukan fetch ke server tujuan (Server-side bypass CORS)
        const response = await fetch(url, {
            headers: {
                // Menyamarkan request sebagai browser biasa agar tidak diblokir oleh server target
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).send(`Server target merespons dengan status: ${response.status}`);
        }

        // 5. Teruskan Content-Type asli (misal: application/dash+xml untuk MPD)
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // 6. Kirim data manifest kembali ke Shaka Player kamu
        const data = await response.text();
        return res.status(200).send(data);

    } catch (error) {
        return res.status(500).json({ 
            error: 'Gagal mengambil data dari URL target', 
            details: error.message 
        });
    }
}
