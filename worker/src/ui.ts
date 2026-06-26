export function renderUI(domain: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Temp Mail</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
  }
  .container { width: 100%; max-width: 720px; }
  h1 { font-size: 1.6rem; margin-bottom: 0.25rem; }
  .subtitle { color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem; }
  .address-box {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .address-box .addr {
    flex: 1;
    font-size: 1.05rem;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: #38bdf8;
    word-break: break-all;
  }
  .address-box .status {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  button {
    background: #334155;
    color: #e2e8f0;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  button:hover { background: #475569; }
  button.primary { background: #0ea5e9; }
  button.primary:hover { background: #0284c7; }
  .toolbar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .inbox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .inbox-header h2 { font-size: 1.1rem; }
  .inbox-header .count { color: #94a3b8; font-size: 0.85rem; }
  .message-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .message {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    overflow: hidden;
  }
  .message-header {
    padding: 0.85rem 1.25rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  .message-header:hover { background: #273449; }
  .message-meta { flex: 1; min-width: 0; }
  .message-from { font-weight: 600; font-size: 0.9rem; }
  .message-subject { color: #94a3b8; font-size: 0.85rem; margin-top: 0.15rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .message-time { color: #64748b; font-size: 0.78rem; flex-shrink: 0; }
  .message-body {
    display: none;
    padding: 0 1.25rem 1rem;
    border-top: 1px solid #334155;
    margin-top: 0;
  }
  .message.expanded .message-body { display: block; }
  .message-body iframe { width: 100%; border: none; border-radius: 8px; min-height: 200px; background: #fff; }
  .message-body .text-fallback { white-space: pre-wrap; font-size: 0.88rem; color: #cbd5e1; padding: 0.5rem 0; }
  .empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #64748b;
  }
  .empty .spinner {
    width: 32px; height: 32px;
    border: 3px solid #334155;
    border-top-color: #38bdf8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .new-badge {
    display: inline-block;
    background: #22c55e;
    color: #0f172a;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 99px;
    margin-left: 0.4rem;
    vertical-align: middle;
  }
</style>
</head>
<body>
<div class="container">
  <h1>Temp Mail</h1>
  <p class="subtitle">Disposable inbox &middot; messages expire in 1 hour</p>

  <div class="address-box">
    <div class="status"></div>
    <div class="addr" id="addr">loading...</div>
    <button onclick="copyAddr()">Copy</button>
    <button class="primary" onclick="newAddr()">New</button>
  </div>

  <div class="toolbar">
    <button onclick="refresh()">Refresh now</button>
  </div>

  <div class="inbox-header">
    <h2>Inbox</h2>
    <span class="count" id="count"></span>
  </div>

  <div class="message-list" id="inbox">
    <div class="empty"><div class="spinner"></div>Waiting for emails...</div>
  </div>
</div>

<script>
const DOMAIN = ${JSON.stringify(domain)};
let currentAddr = '';
let lastSeenId = 0;
let pollTimer = null;
const POLL_INTERVAL = 2000;

function genLocalPart() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let r = '';
  for (let i = 0; i < 10; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

function newAddr() {
  currentAddr = genLocalPart() + '@' + DOMAIN;
  localStorage.setItem('voidmail_addr', currentAddr);
  lastSeenId = 0;
  document.getElementById('addr').textContent = currentAddr;
  document.getElementById('inbox').innerHTML = '<div class="empty"><div class="spinner"></div>Waiting for emails...</div>';
  document.getElementById('count').textContent = '';
  loadExisting();
}

function copyAddr() {
  navigator.clipboard.writeText(currentAddr);
}

function fmtTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function addMessage(msg, isNew) {
  const list = document.getElementById('inbox');
  const empty = list.querySelector('.empty');
  if (empty) empty.remove();

  const div = document.createElement('div');
  div.className = 'message';
  div.dataset.id = msg.id;

  const badge = isNew ? '<span class="new-badge">NEW</span>' : '';
  div.innerHTML =
    "<div class=\"message-header\" onclick=\"this.parentElement.classList.toggle('expanded')\">" +
      "<div class=\"message-meta\">" +
        "<div class=\"message-from\">" + escapeHtml(msg.from_addr) + badge + "</div>" +
        "<div class=\"message-subject\">" + escapeHtml(msg.subject) + "</div>" +
      "</div>" +
      "<div class=\"message-time\">" + fmtTime(msg.received_at) + "</div>" +
    "</div>" +
    "<div class=\"message-body\">" +
      (msg.html ? "<iframe srcdoc=\"" + escapeHtml(msg.html) + "\" sandbox=\"\"></iframe>"
                : "<div class=\"text-fallback\">" + escapeHtml(msg.text) + "</div>") +
    "</div>";

  list.prepend(div);

  if (msg.id > lastSeenId) lastSeenId = msg.id;
  updateCount();
}

function updateCount() {
  const n = document.querySelectorAll('.message').length;
  document.getElementById('count').textContent = n ? n + ' message' + (n > 1 ? 's' : '') : '';
}

async function loadExisting() {
  try {
    const res = await fetch('/api/inbox/' + encodeURIComponent(currentAddr));
    const data = await res.json();
    if (data.messages && data.messages.length) {
      for (const m of data.messages) addMessage(m, false);
      lastSeenId = data.messages[data.messages.length - 1].id;
    }
  } catch (e) {}
  startPolling();
}

async function poll() {
  try {
    const res = await fetch('/api/inbox/' + encodeURIComponent(currentAddr) + '?since=' + lastSeenId);
    const data = await res.json();
    if (data.messages && data.messages.length) {
      for (const m of data.messages) addMessage(m, true);
    }
  } catch (e) {}
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(poll, POLL_INTERVAL);
}

function refresh() { poll(); }

(function init() {
  const saved = localStorage.getItem('voidmail_addr');
  if (saved) {
    currentAddr = saved;
  } else {
    currentAddr = genLocalPart() + '@' + DOMAIN;
    localStorage.setItem('voidmail_addr', currentAddr);
  }
  document.getElementById('addr').textContent = currentAddr;
  loadExisting();
})();
</script>
</body>
</html>`;
}
