import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const types = { '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };

createServer((request, response) => {
  const path = normalize(new URL(request.url, 'http://localhost').pathname);
  let file = join(root, path);
  if (statSync(file, { throwIfNoEntry: false })?.isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(root) || !existsSync(file)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(4321, '127.0.0.1');
