const DOMAIN = 'kushal.qzz.io';
const INBOX_TTL = 3600;

function generateLocalPart() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateRecoveryKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join('-');
}

export async function onRequest(context) {
  const { request, env } = context;
  const domain = env.DOMAIN || DOMAIN;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let address;
  const body = await request.json();
  const username = body?.username;

  if (username) {
    const u = username.toLowerCase().trim();
    if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(u)) {
      return new Response(JSON.stringify({ error: 'Username must be 3-30 characters: letters, numbers, dots, hyphens, underscores' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const reserved = ['admin', 'postmaster', 'abuse', 'webmaster', 'noreply', 'support', 'info', 'mail', 'contact'];
    if (reserved.includes(u)) {
      return new Response(JSON.stringify({ error: 'This username is reserved' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    address = `${u}@${domain}`;
    const now = Math.floor(Date.now() / 1000);
    const existing = await env.DB.prepare(
      `SELECT * FROM inboxes WHERE address = ? AND expires_at > ? LIMIT 1`
    ).bind(address, now).all();
    if (existing.results.length > 0) {
      return new Response(JSON.stringify({ error: 'This username is already taken. Try a different one.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    address = `${generateLocalPart()}@${domain}`;
  }

  const recoveryKey = generateRecoveryKey();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO inboxes (address, recovery_key, created_at, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(address, recoveryKey, now, now + INBOX_TTL).run();

  return new Response(JSON.stringify({
    address,
    recoveryKey,
    createdAt: new Date(now * 1000).toISOString(),
    expiresAt: new Date((now + INBOX_TTL) * 1000).toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
