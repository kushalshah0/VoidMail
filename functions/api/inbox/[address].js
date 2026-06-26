export async function onRequest(context) {
  const { request, env, params } = context;
  const addr = decodeURIComponent(params.address).toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  if (request.method === 'DELETE') {
    const body = await request.json();
    const key = (body?.recoveryKey || '').toUpperCase().trim();
    const inbox = await env.DB.prepare(
      `SELECT * FROM inboxes WHERE recovery_key = ? AND expires_at > ? LIMIT 1`
    ).bind(key, now).all();

    if (inbox.results.length === 0 || inbox.results[0].address !== addr) {
      return new Response(JSON.stringify({ error: 'Invalid recovery key' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(`DELETE FROM messages WHERE to_addr = ?`).bind(addr).run();
    await env.DB.prepare(`DELETE FROM inboxes WHERE address = ?`).bind(addr).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const since = parseInt(url.searchParams.get('since') ?? '0', 10);
  let rows;

  if (since > 0) {
    const result = await env.DB.prepare(
      `SELECT * FROM messages WHERE to_addr = ? AND id > ? AND expires_at > ? ORDER BY id ASC`
    ).bind(addr, since, now).all();
    rows = result.results;
  } else {
    const result = await env.DB.prepare(
      `SELECT * FROM messages WHERE to_addr = ? AND expires_at > ? ORDER BY id ASC`
    ).bind(addr, now).all();
    rows = result.results;
  }

  return new Response(JSON.stringify({ messages: rows }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
