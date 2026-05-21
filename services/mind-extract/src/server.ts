import http from 'node:http';
import { extractFromUrl } from './extract.js';
import { isInstagramCdnHost, isValidPreviewImageUrl } from './imageUrl.js';

const PORT = Number(process.env.PORT ?? 8787);
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? '*';

function corsHeaders(contentType?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...(contentType ? { 'Content-Type': contentType } : {}),
  };
}

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, corsHeaders('application/json'));
  res.end(JSON.stringify(body));
}

const UPSTREAM_IMAGE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://www.instagram.com/',
  Origin: 'https://www.instagram.com',
};

async function fetchUpstreamImage(target: string, method: 'GET' | 'HEAD' = 'GET') {
  return fetch(target, {
    method,
    redirect: 'follow',
    headers: UPSTREAM_IMAGE_HEADERS,
    signal: AbortSignal.timeout(15000),
  });
}

function validateProxyTarget(target: string): URL | null {
  try {
    const u = new URL(target);
    if (!/^https?:$/i.test(u.protocol)) return null;
    if (!isInstagramCdnHost(u.hostname) || !isValidPreviewImageUrl(target)) return null;
    return u;
  } catch {
    return null;
  }
}

async function proxyImageHead(target: string, res: http.ServerResponse) {
  const upstream = await fetchUpstreamImage(target, 'HEAD');
  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
  if (!upstream.ok) {
    res.writeHead(upstream.status, corsHeaders('application/json'));
    res.end();
    return;
  }
  res.writeHead(200, {
    ...corsHeaders(contentType),
    'Cache-Control': 'public, max-age=3600',
    ...(upstream.headers.get('content-length')
      ? { 'Content-Length': upstream.headers.get('content-length')! }
      : {}),
  });
  res.end();
}

async function proxyImageGet(target: string, res: http.ServerResponse) {
  const upstream = await fetchUpstreamImage(target, 'GET');
  if (!upstream.ok) {
    sendJson(res, upstream.status, { error: `Upstream ${upstream.status}` });
    return;
  }
  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
  if (!/^image\//i.test(contentType)) {
    sendJson(res, 502, { error: `Upstream returned ${contentType}` });
    return;
  }
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.writeHead(200, { ...corsHeaders(contentType), 'Cache-Control': 'public, max-age=3600' });
  res.end(buf);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const reqUrl = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const target = reqUrl.searchParams.get('url')?.trim();

  if (reqUrl.pathname === '/proxy') {
    if (!target) {
      sendJson(res, 400, { error: 'Missing url query parameter' });
      return;
    }
    try {
      if (!validateProxyTarget(target)) {
        sendJson(res, 403, { error: 'Invalid or disallowed image URL' });
        return;
      }
      if (req.method === 'HEAD') {
        await proxyImageHead(target, res);
      } else {
        await proxyImageGet(target, res);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Proxy failed';
      sendJson(res, 502, { error: message });
    }
    return;
  }

  if (reqUrl.pathname !== '/' && reqUrl.pathname !== '/extract') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  if (!target) {
    sendJson(res, 400, { error: 'Missing url query parameter' });
    return;
  }

  try {
    new URL(target);
  } catch {
    sendJson(res, 400, { error: 'Invalid url' });
    return;
  }

  try {
    const payload = await extractFromUrl(target);
    sendJson(res, 200, payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Extract failed';
    sendJson(res, 502, { error: message });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`mind-extract listening on http://localhost:${PORT}/?url=ENCODED`);
});
