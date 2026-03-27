export async function onRequestPost(context) {
  const { env, request } = context;
  const KV = env.VOIDMAIL_KV;

  try {
    const { username, ttlHours = 24 } = await request.json();

    if (!username || typeof username !== 'string') {
      return jsonResponse({ error: 'Username is required' }, 400);
    }

    const sanitized = username.toLowerCase().trim();

    if (!/^[a-z0-9._-]{3,30}$/.test(sanitized)) {
      return jsonResponse({
        error: 'Username must be 3-30 characters: letters, numbers, dots, hyphens, underscores',
      }, 400);
    }

    const reserved = ['admin', 'postmaster', 'abuse', 'webmaster', 'noreply', 'support', 'info'];
    if (reserved.includes(sanitized)) {
      return jsonResponse({ error: 'This username is reserved' }, 400);
    }

    const existing = await KV.get(`inbox:${sanitized}`);
    if (existing) {
      return jsonResponse({ error: 'This inbox already exists. Try a different username.' }, 409);
    }

    const validTTL = Math.min(Math.max(parseInt(ttlHours) || 24, 1), 24);
    const ttlSeconds = validTTL * 3600;

    const recoveryKey = generateRecoveryKey();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    const inboxData = {
      username: sanitized,
      email: `${sanitized}@${env.EMAIL_DOMAIN || 'yourdomain.com'}`,
      recoveryKey,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ttlHours: validTTL,
    };

    await KV.put(`inbox:${sanitized}`, JSON.stringify(inboxData), {
      expirationTtl: ttlSeconds,
    });

    await KV.put(`recovery:${recoveryKey}`, sanitized, {
      expirationTtl: ttlSeconds,
    });

    await KV.put(`emails:${sanitized}`, JSON.stringify([]), {
      expirationTtl: ttlSeconds,
    });

    return jsonResponse({
      success: true,
      username: sanitized,
      email: inboxData.email,
      recoveryKey,
      createdAt: inboxData.createdAt,
      expiresAt: inboxData.expiresAt,
      ttlHours: validTTL,
    }, 201);

  } catch (err) {
    console.error('Create inbox error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function generateRecoveryKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      const randomBytes = new Uint8Array(1);
      crypto.getRandomValues(randomBytes);
      segment += chars[randomBytes[0] % chars.length];
    }
    segments.push(segment);
  }
  return segments.join('-');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
