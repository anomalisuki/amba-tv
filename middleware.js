// ─── KETIK DI SINI UNTUK ATUR WEB AMBA TV ───
const MAINTENANCE_MODE = false; // Ubah ke false untuk mematikan maintenance
// ───────────────────────────────────────────

export default async function middleware(request) {
  const url = new URL(request.url);

  // 1. Lewatkan pengecualian agar aset gambar, css, js, dan halaman maintenance tidak ikut terblokir
  if (
    url.pathname === '/maintenance.html' ||
    url.pathname.startsWith('/src/') ||
    /\.(png|jpg|jpeg|gif|css|js|ico)$/.test(url.pathname)
  ) {
    return; // Izinkan akses tanpa modifikasi
  }

  // 2. Jika mode maintenance AKTIF, arahkan semua halaman ke maintenance.html
  if (MAINTENANCE_MODE) {
    url.pathname = '/maintenance.html';
    return Response.redirect(url.toString(), 302);
  }
}
