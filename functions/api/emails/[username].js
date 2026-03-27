export async function onRequestGet(context) {
  const { env, params } = context;
  const KV = env.VOIDMAIL_KV;
  const username = params.username.toLowerCase();

  try {
    const inbox = await KV.get(`inbox:${username}`);
    if (!inbox) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    const emails = await KV.get(`emails:${username}`, 'json') || [];

    emails.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

    return jsonResponse({
      username,
      count: emails.length,
      emails,
    });

  } catch (err) {
    console.error('List emails error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
