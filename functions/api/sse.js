export async function onRequestGet(context) {
  const { env, request } = context;
  const KV = env.VOIDMAIL_KV;
  const username = new URL(request.url).searchParams.get('username');

  if (!username) {
    return new Response('Missing username', { status: 400 });
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let lastEmailCount = 0;
      let lastEmailId = null;

      const sendEvent = async (data) => {
        if (isClosed) return;
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch {}
      };

      const checkForNewEmails = async () => {
        try {
          const emails = await KV.get(`emails:${username.toLowerCase()}`, 'json') || [];
          
          if (emails.length > lastEmailCount || (emails.length > 0 && emails[0].id !== lastEmailId)) {
            lastEmailCount = emails.length;
            lastEmailId = emails[0]?.id;
            await sendEvent({ type: 'new_email', emails, count: emails.length });
          }
        } catch {}
      };

      await sendEvent({ type: 'connected', username });

      const interval = setInterval(checkForNewEmails, 1000);

      const cleanup = () => {
        clearInterval(interval);
        isClosed = true;
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
