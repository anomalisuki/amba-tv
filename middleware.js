// ─── PENGATURAN MAINTENANCE AMBA TV ───
const ALL_MAINTENANCE = false;
const MAINTENANCE_CHANNELS = [];
// ───────────────────────────────────────

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, '');

  // 1. Lewatkan aset gambar, css, js, dan halaman maintenance
  if (
    url.pathname === '/maintenance.html' ||
    url.pathname.startsWith('/src/') ||
    /\.(png|jpg|jpeg|gif|css|js|ico)$/.test(url.pathname)
  ) {
    return;
  }

  // 2. Jika ALL_MAINTENANCE aktif ATAU slug channel ada di daftar spesifik
  if (ALL_MAINTENANCE || MAINTENANCE_CHANNELS.includes(path)) {
    url.pathname = '/maintenance.html';
    return Response.redirect(url.toString(), 302);
  }
}
