export default async function handler(req, res) {
    // 1. Sesuaikan dengan ekstensi: Tembak spesifik ke domain Vercel kamu
    // Catatan: Jika Allow-Credentials aktif, Origin TIDAK BOLEH menggunakan tanda bintang (*)
    res.setHeader('Access-Control-Allow-Origin', 'https://amba-tv.vercel.app');
    
    // 2. Kunci utama dari ekstensi: Mengizinkan Credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // 3. Mengizinkan method yang dipilih di ekstensi
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, Referer, Origin, Authorization');

    // Tangani preflight request dari browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Parameter URL tidak ditemukan.' });
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Origin': 'https://www.visionplus.id',
                'Referer': 'https://www.visionplus.id/'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).send(`Target error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Handle file segment video/audio
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
