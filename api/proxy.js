// 1. Wajib deklarasikan runtime Edge agar Vercel tahu ini fungsi Edge
export const config = { runtime: "edge" };

export default async function handler(request) {
    // 2. Definisi Header CORS untuk konsistensi dengan Web Player
    const CORS_HEADERS = {
        "Access-Control-Allow-Origin": "https://amba-tv.vercel.app",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
        "Access-Control-Allow-Headers": "Content-Type, User-Agent, Referer, Origin, Authorization, Accept, X-Requested-With",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "cross-origin"
    };

    // Handle preflight request CORS
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 3. Ambil parameter enkripsi 'hash' (Base64) dari URL
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");

    if (!hash) {
        return new Response(JSON.stringify({ error: "Parameter hash tidak ditemukan." }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
    }

    try {
        // Dekripsi Base64 di Edge Runtime menggunakan metode atob natif
        const decodedUrl = atob(hash);
        
        // 4. Lakukan fetch menggunakan Web API murni yang didukung Edge Runtime
        const response = await fetch(decodedUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                "Origin": "https://amba-tv.vercel.app",
                "Referer": "https://amba-tv.vercel.app/"
            }
        });

        if (!response.ok) {
            return new Response(`Target upstream error: ${response.status}`, {
                status: response.status,
                headers: CORS_HEADERS
            });
        }

        // 5. Salin Content-Type asli (misalnya berkas teks .mpd atau binary .m4s)
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        
        // Gabungkan header CORS kita dengan header tipe konten asli dari stream video
        const responseHeaders = {
            ...CORS_HEADERS,
            "Content-Type": contentType
        };

        // Alirkan body response secara mentah (streaming data biner video)
        return new Response(response.body, {
            status: 200,
            headers: responseHeaders
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Edge Proxy Error", detail: String(error) }), {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
    }
}
