export async function onRequestGet(context) {
  const { env, params } = context;
  const KV = env.VOIDMAIL_KV;
  const username = params.username.toLowerCase();

  try {
    const data = await KV.get(`inbox:${username}`, 'json');

    if (!data) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    const { recoveryKey, ...safe } = data;
    return jsonResponse(safe);

  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function onRequestDelete(context) {
  const { env, params, request } = context;
  const KV = env.VOIDMAIL_KV;
  const username = params.username.toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));

    const inboxData = await KV.get(`inbox:${username}`, 'json');

    if (!inboxData) {
      return jsonResponse({ error: 'Inbox not found or expired' }, 404);
    }

    if (body.recoveryKey && body.recoveryKey !== inboxData.recoveryKey) {
      return jsonResponse({ error: 'Invalid recovery key' }, 403);
    }

    const emailList = await KV.get(`emails:${username}`, 'json') || [];

    const deletePromises = emailList.map((e) => KV.delete(`email:${e.id}`));

    deletePromises.push(
      KV.delete(`inbox:${username}`),
      KV.delete(`emails:${username}`),
      KV.delete(`recovery:${inboxData.recoveryKey}`)
    );

    await Promise.all(deletePromises);

    return jsonResponse({ success: true, message: 'Inbox deleted' });

  } catch (err) {
    console.error('Delete inbox error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
