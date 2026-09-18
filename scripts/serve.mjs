import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, isAbsolute, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.env.ESTANCIA_PREVIEW_PORT ?? 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method ?? 'GET')) {
    response.writeHead(405, { ...securityHeaders, Allow: 'GET, HEAD' }).end();
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    let file = normalize(join(root, requested));
    const relativePath = relative(root, file);

    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      response.writeHead(403, securityHeaders).end('Forbidden');
      return;
    }

    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const fileStats = await stat(file);

    if (!fileStats.isFile()) {
      response.writeHead(404, securityHeaders).end('Not found');
      return;
    }

    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": types[extname(file)] ?? "application/octet-stream"
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch {
    response.writeHead(404, securityHeaders).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`preview: http://localhost:${port}`));