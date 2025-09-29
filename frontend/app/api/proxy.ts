// Next.js API route handler to proxy requests to backend service
import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, method, headers, body } = req;
  // Remove /api/proxy from the path
  const targetPath = req.url?.replace(/^\/api\/proxy/, '') || '/';
  const targetUrl = `${BACKEND_URL}${targetPath}`;

  const proxyRes = await fetch(targetUrl, {
    method,
    headers: {
      ...headers,
      host: undefined, // Remove host header for proxy
    } as any,
    body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
  });

  const data = await proxyRes.text();
  res.status(proxyRes.status);
  res.setHeader('Content-Type', proxyRes.headers.get('content-type') || 'text/plain');
  res.send(data);
}
