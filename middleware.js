// ───────────────────────────────────────────
const MAINTENANCE_MODE = true;
// ───────────────────────────────────────────

export default async function middleware(request) {
  const url = new URL(request.url);

  if (
    url.pathname === '/maintenance.html' ||
    url.pathname.startsWith('/src/') ||
    /\.(png|jpg|jpeg|gif|css|js|ico)$/.test(url.pathname)
  ) {
    return;
  }

  if (MAINTENANCE_MODE) {
    url.pathname = '/maintenance.html';
    return Response.redirect(url.toString(), 302);
  }
}
