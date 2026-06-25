export default {
  async email(message, env) {
    const KV = env.VOIDMAIL_KV;
    const BROADCASTER = env.SSE_BROADCASTER;

    try {
      const toAddress = message.to;
      const username = toAddress.split('@')[0].toLowerCase();

      const inboxData = await KV.get(`inbox:${username}`, 'json');
      if (!inboxData) {
        message.setReject('Inbox not found');
        return;
      }

      const rawEmail = await new Response(message.raw).text();
      const emailContent = parseEmail(rawEmail, message);
      const emailId = generateId();

      const remainingTtl = Math.floor(
        (new Date(inboxData.expiresAt) - Date.now()) / 1000
      );

      if (remainingTtl <= 0) {
        message.setReject('Inbox expired');
        return;
      }

      const snippetSource = emailContent.text || htmlToText(emailContent.html);

      const emailSummary = {
        id: emailId,
        from: message.from,
        subject: emailContent.subject,
        snippet: snippetSource.substring(0, 100),
        receivedAt: new Date().toISOString(),
        read: false,
      };

      const fullEmail = {
        id: emailId,
        inbox: username,
        from: message.from,
        to: toAddress,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
        snippet: snippetSource.substring(0, 150),
        headers: emailContent.headers,
        receivedAt: emailSummary.receivedAt,
        read: false,
        size: rawEmail.length,
      };

      const emailList = await KV.get(`emails:${username}`, 'json') || [];
      emailList.push(emailSummary);

      await Promise.all([
        KV.put(`email:${emailId}`, JSON.stringify(fullEmail), {
          expirationTtl: remainingTtl,
        }),
        KV.put(`emails:${username}`, JSON.stringify(emailList), {
          expirationTtl: remainingTtl,
        }),
      ]);

      if (BROADCASTER) {
        try {
          const doId = BROADCASTER.idFromName(username);
          const doStub = BROADCASTER.get(doId);
          await doStub.fetch(new Request('http://internal/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailSummary }),
          }));
        } catch (e) {
          console.error('Broadcast error:', e);
        }
      }

      console.log(`Email stored: ${emailId} for ${username}`);
    } catch (err) {
      console.error('Email worker error:', err);
    }
  },
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/sse' || url.searchParams.has('username')) {
      const username = url.searchParams.get('username');
      if (!username) {
        return new Response('Missing username', { status: 400 });
      }

      const doId = env.SSE_BROADCASTER.idFromName(username);
      const doStub = env.SSE_BROADCASTER.get(doId);
      return doStub.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};

function parseEmail(rawEmail, message) {
  const result = {
    subject: '',
    text: '',
    html: '',
    headers: {},
  };

  try {
    const normalizedEmail = normalizeLineEndings(rawEmail);
    const { headers, body } = splitHeadersAndBody(normalizedEmail);

    result.headers = headers;
    result.subject = decodeHeaderValue(
      headers.subject || message.headers?.get('subject') || '(No Subject)'
    );

    const content = extractBestContent(headers, body);

    result.html = content.html || '';
    result.text = content.text || '';

    if (!result.text && result.html) {
      result.text = htmlToText(result.html);
    }

    if (result.html) {
      result.html = sanitizeHtml(result.html);
    }
  } catch (err) {
    console.error('Email parse error:', err);
    result.text = rawEmail;
  }

  return result;
}

function normalizeLineEndings(value) {
  return (value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function splitHeadersAndBody(input) {
  const separatorIndex = input.indexOf('\n\n');

  if (separatorIndex === -1) {
    return {
      headers: parseHeaders(input),
      body: '',
    };
  }

  return {
    headers: parseHeaders(input.slice(0, separatorIndex)),
    body: input.slice(separatorIndex + 2),
  };
}

function parseHeaders(headerSection) {
  const headers = {};
  const rawLines = normalizeLineEndings(headerSection).split('\n');
  const lines = [];

  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += ` ${line.trim()}`;
    } else {
      lines.push(line);
    }
  }

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();
    headers[key] = value;
  }

  return headers;
}

function extractBestContent(headers, body) {
  const contentType = parseContentType(headers['content-type']);
  const disposition = (headers['content-disposition'] || '').toLowerCase();
  const encoding = (headers['content-transfer-encoding'] || '').toLowerCase();
  const charset = contentType.params.charset || 'utf-8';

  if (disposition.includes('attachment')) {
    return { html: '', text: '' };
  }

  if (contentType.mime.startsWith('multipart/')) {
    const boundary = contentType.params.boundary;
    if (!boundary) {
      return { html: '', text: '' };
    }

    const parts = splitMultipartBody(body, boundary);
    let bestHtml = '';
    let bestText = '';

    for (const part of parts) {
      const { headers: partHeaders, body: partBody } = splitHeadersAndBody(part);
      const content = extractBestContent(partHeaders, partBody);

      if (!bestHtml && content.html) bestHtml = content.html;
      if (!bestText && content.text) bestText = content.text;

      if (bestHtml && bestText) break;
    }

    return { html: bestHtml, text: bestText };
  }

  const decodedBody = decodeBody(body, encoding, charset);

  if (contentType.mime === 'text/html') {
    return { html: decodedBody, text: '' };
  }

  if (contentType.mime === 'text/plain') {
    return { html: '', text: decodedBody };
  }

  return { html: '', text: '' };
}

function splitMultipartBody(body, boundary) {
  const normalizedBody = normalizeLineEndings(body);
  const delimiter = `--${boundary}`;

  return normalizedBody
    .split(delimiter)
    .map((part) => part.replace(/^\n+/, '').replace(/\n+$/, ''))
    .filter((part) => part && part !== '--' && !part.startsWith('--'));
}

function parseContentType(headerValue = 'text/plain; charset=utf-8') {
  const [mimePart, ...paramParts] = headerValue.split(';');
  const params = {};

  for (const part of paramParts) {
    const equalsIndex = part.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = part.slice(0, equalsIndex).trim().toLowerCase();
    const value = part.slice(equalsIndex + 1).trim().replace(/^"|"$/g, '');
    params[key] = value;
  }

  return {
    mime: (mimePart || 'text/plain').trim().toLowerCase(),
    params,
  };
}

function decodeBody(body, encoding, charset) {
  const cleanedBody = normalizeLineEndings(body).replace(/^\n+|\n+$/g, '');

  if (!cleanedBody) return '';

  if (encoding.includes('quoted-printable')) {
    return decodeQuotedPrintable(cleanedBody, charset);
  }

  if (encoding.includes('base64')) {
    return decodeBase64(cleanedBody, charset);
  }

  return cleanedBody;
}

function decodeQuotedPrintable(input, charset = 'utf-8') {
  const normalized = normalizeLineEndings(input).replace(/=\n/g, '');
  const bytes = [];

  for (let i = 0; i < normalized.length; i += 1) {
    const current = normalized[i];
    const hex = normalized.slice(i + 1, i + 3);

    if (current === '=' && /^[0-9A-Fa-f]{2}$/.test(hex)) {
      bytes.push(parseInt(hex, 16));
      i += 2;
      continue;
    }

    bytes.push(normalized.charCodeAt(i));
  }

  const decoded = decodeBytes(bytes, charset);
  return decoded.replace(/=+$/, '').trim();
}

function decodeBase64(input, charset = 'utf-8') {
  try {
    const normalized = input.replace(/\s+/g, '');
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return decodeBytes(bytes, charset);
  } catch {
    return input;
  }
}

function decodeHeaderValue(value = '') {
  return value.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        const binary = atob(text);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i += 1) {
          bytes[i] = binary.charCodeAt(i);
        }

        return decodeBytes(bytes, charset);
      }

      if (encoding.toUpperCase() === 'Q') {
        const qpSource = text.replace(/_/g, ' ');
        return decodeQuotedPrintable(qpSource, charset);
      }
    } catch {
      return match;
    }

    return match;
  });
}

function decodeBytes(bytes, charset = 'utf-8') {
  const supportedCharset = normalizeCharset(charset);
  const uint8Array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  try {
    return new TextDecoder(supportedCharset).decode(uint8Array);
  } catch {
    try {
      return new TextDecoder('utf-8').decode(uint8Array);
    } catch {
      return Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join('');
    }
  }
}

function normalizeCharset(charset = 'utf-8') {
  const normalized = charset.toLowerCase().replace(/['"]/g, '').trim();

  if (normalized === 'utf8') return 'utf-8';
  if (normalized === 'us-ascii') return 'utf-8';
  if (normalized === 'iso-8859-1') return 'windows-1252';

  return normalized || 'utf-8';
}

function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '');
}

function htmlToText(html = '') {
  return html
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function generateId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export class SseBroadcaster {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/sse' || url.pathname === '/api/sse') {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const clientId = crypto.randomUUID();

      this.clients.set(clientId, writer);

      const encoder = new TextEncoder();

      const cleanup = () => {
        this.clients.delete(clientId);
        try { writer.close(); } catch {}
      };

      const keepAliveInterval = setInterval(() => {
        this.state.waitUntil((async () => {
          try {
            await writer.write(encoder.encode(': ping\n\n'));
          } catch {
            clearInterval(keepAliveInterval);
          }
        })());
      }, 15000);

      const abortHandler = () => {
        clearInterval(keepAliveInterval);
        cleanup();
      };

      if (request.signal) {
        request.signal.addEventListener('abort', abortHandler);
      }

      this.state.waitUntil(
        new Promise((resolve) => {
          if (request.signal) {
            request.signal.addEventListener('abort', () => {
              clearInterval(keepAliveInterval);
              cleanup();
              resolve();
            });
          }
        })
      );

      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      };

      const response = new Response(readable, { headers });

      writer.write(encoder.encode(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`));

      return response;
    }

    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const data = await request.json();
      const encoder = new TextEncoder();
      const message = `event: new-email\ndata: ${JSON.stringify(data)}\n\n`;
      const encoded = encoder.encode(message);

      const promises = [];
      for (const [clientId, writer] of this.clients) {
        try {
          promises.push(writer.write(encoded));
        } catch {
          this.clients.delete(clientId);
        }
      }
      await Promise.allSettled(promises);
      return new Response('OK');
    }

    return new Response('Not Found', { status: 404 });
  }
}
