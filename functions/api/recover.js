export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const key = (body?.recoveryKey || '').toUpperCase().trim();

  if (!key) {
    return new Response(JSON.stringify({ error: 'Recovery key is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const result = await env.DB.prepare(
    `SELECT * FROM inboxes WHERE recovery_key = ? AND expires_at > ? LIMIT 1`
  ).bind(key, now).all();

  if (result.results.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid or expired recovery key' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const inbox = result.results[0];
  return new Response(JSON.stringify({
    address: inbox.address,
    expiresAt: new Date(inbox.expires_at * 1000).toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
