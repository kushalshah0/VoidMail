const ALLOWED_ORIGINS = [
  'https://mail.kushal.qzz.io',
  'http://localhost:5173',
  'http://localhost:4173',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function onRequest(context) {
  const { request, next } = context;
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : '';

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...CORS_HEADERS, 'Access-Control-Allow-Origin': allowed || 'null' },
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', allowed);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
