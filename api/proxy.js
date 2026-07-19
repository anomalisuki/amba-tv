export default async function handler(req, res) {
    // 1. Izinkan akses CORS untuk frontend kamu
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, Referer, Origin');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Parameter URL tidak ditemukan.' });
    }

    try {
        // Ekstrak domain asal (misal: https://canal86.my.id) untuk memalsukan header
        const parsedUrl = new URL(url);
        const originUrl = parsedUrl.origin;

        // 2. Lakukan fetch dengan menyamar secara penuh
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Origin': originUrl,       // Memalsukan Origin agar disangka dari web mereka sendiri
                'Referer': originUrl + '/' // Memalsukan Referer
            }
        });
        
        if (!response.ok) {
            // Jika masih 403 atau error lain, kirimkan status aslinya
            return res.status(response.status).send(`Server target merespons dengan status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        const data = await response.text();
        return res.status(200).send(data);

    } catch (error) {
        return res.status(500).json({ 
            error: 'Gagal mengambil data dari URL target', 
            details: error.message 
        });
    }
}
