export async function onRequestGet(context) {
  const { env, params } = context;
  const KV = env.VOIDMAIL_KV;
  const emailId = params.id;

  try {
    const email = await KV.get(`email:${emailId}`, 'json');

    if (!email) {
      return jsonResponse({ error: 'Email not found or expired' }, 404);
    }

    if (!email.read) {
      email.read = true;
      const inbox = await KV.get(`inbox:${email.inbox}`, 'json');
      if (inbox) {
        const remaining = Math.max(
          0,
          Math.floor((new Date(inbox.expiresAt) - Date.now()) / 1000)
        );
        if (remaining > 0) {
          await KV.put(`email:${emailId}`, JSON.stringify(email), {
            expirationTtl: remaining,
          });

          const emailList = await KV.get(`emails:${email.inbox}`, 'json') || [];
          const updated = emailList.map((e) =>
            e.id === emailId ? { ...e, read: true } : e
          );
          await KV.put(`emails:${email.inbox}`, JSON.stringify(updated), {
            expirationTtl: remaining,
          });
        }
      }
    }

    return jsonResponse(email);

  } catch (err) {
    console.error('Get email error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
