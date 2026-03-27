const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export function createInbox(username, ttlHours = 24) {
  return request('/inbox', {
    method: 'POST',
    body: JSON.stringify({ username, ttlHours }),
  });
}

export function getInbox(username) {
  return request(`/inbox/${username}`);
}

export function getEmails(username) {
  return request(`/emails/${username}`);
}

export function getEmail(emailId) {
  return request(`/email/${emailId}`);
}

export function recoverInbox(username, recoveryKey) {
  return request('/recover', {
    method: 'POST',
    body: JSON.stringify({ username, recoveryKey }),
  });
}

export function deleteInbox(username, recoveryKey) {
  return request(`/inbox/${username}`, {
    method: 'DELETE',
    body: JSON.stringify({ recoveryKey }),
  });
}
