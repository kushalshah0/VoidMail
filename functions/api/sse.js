export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return new Response('Missing username', { status: 400 });
  }

  if (!env.EMAIL_WORKER) {
    return new Response('Email worker not configured', { status: 500 });
  }

  return env.EMAIL_WORKER.fetch(request);
}
