// Minimal static server for browser tests. No dependency, no caching, no guessing.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

export function startServer(root, port = 0) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith('/')) path += 'index.html';
    const filePath = join(root, normalize(path).replace(/^(\.\.[/\\])+/, ''));
    try {
      const body = await readFile(filePath);
      response.writeHead(200, {
        'Content-Type': TYPES[extname(filePath)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      response.end(body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('not found');
    }
  });
  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}
