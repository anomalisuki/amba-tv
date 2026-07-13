import { NextResponse } from 'next/server';

// ─── KETIK DI SINI UNTUK ATUR WEB AMBA TV ───
const MAINTENANCE_MODE = true; // Ubah ke false untuk mematikan maintenance
// ───────────────────────────────────────────

export function middleware(req) {
  const url = req.nextUrl;

  // Lewatkan pengecualian untuk file aset gambar, css, js, dan halaman maintenance itu sendiri
  if (
    url.pathname === '/maintenance.html' ||
    url.pathname.startsWith('/src/') ||
    /\.(png|jpg|jpeg|gif|css|js)$/.test(url.pathname)
  ) {
    return NextResponse.next();
  }

  // Jika mode maintenance AKTIF, lempar semua user ke halaman maintenance
  if (MAINTENANCE_MODE) {
    url.pathname = '/maintenance.html';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
