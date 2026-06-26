const API_BASE = import.meta.env.VITE_API_BASE || '';
const TIMEOUT_MS = 12000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function generateAddress(username) {
  const body = username ? JSON.stringify({ username }) : undefined;
  return request('/api/generate', {
    method: 'POST',
    body,
  });
}

export function recoverInbox(recoveryKey) {
  return request('/api/recover', {
    method: 'POST',
    body: JSON.stringify({ recoveryKey }),
  });
}

export function deleteInbox(address, recoveryKey) {
  return request(`/api/inbox/${encodeURIComponent(address)}`, {
    method: 'DELETE',
    body: JSON.stringify({ recoveryKey }),
  });
}

export function getInbox(address) {
  return request(`/api/inbox/${encodeURIComponent(address)}`);
}

export function getInboxSince(address, sinceId) {
  return request(`/api/inbox/${encodeURIComponent(address)}?since=${sinceId}`);
}

export function getEmail(address, emailId) {
  return request(`/api/inbox/${encodeURIComponent(address)}`).then(data => 
    data.messages.find(m => m.id === emailId)
  );
}