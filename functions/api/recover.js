export async function onRequestPost(context) {
  const { env, request } = context;
  const KV = env.VOIDMAIL_KV;

  try {
    const { username, recoveryKey } = await request.json();

    if (!username || !recoveryKey) {
      return jsonResponse({ error: 'Username and recovery key are required' }, 400);
    }

    const sanitized = username.toLowerCase().trim();
    const keyUpper = recoveryKey.toUpperCase().trim();

    const inboxData = await KV.get(`inbox:${sanitized}`, 'json');

    if (!inboxData) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    if (inboxData.recoveryKey !== keyUpper) {
      return jsonResponse({ error: 'Invalid recovery key' }, 403);
    }

    const { recoveryKey: _key, ...safe } = inboxData;

    return jsonResponse({
      success: true,
      ...safe,
      expiresAt: inboxData.expiresAt,
    });

  } catch (err) {
    console.error('Recovery error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
