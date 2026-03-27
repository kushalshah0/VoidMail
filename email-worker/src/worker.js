export default {
  async email(message, env) {
    const KV = env.VOIDMAIL_KV;

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

      const remainingTtl = Math.max(
        60,
        Math.floor((new Date(inboxData.expiresAt) - Date.now()) / 1000)
      );

      const fullEmail = {
        id: emailId,
        inbox: username,
        from: message.from,
        to: toAddress,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
        snippet: emailContent.text?.substring(0, 150) || '',
        headers: emailContent.headers,
        receivedAt: new Date().toISOString(),
        read: false,
        size: rawEmail.length,
      };

      await KV.put(`email:${emailId}`, JSON.stringify(fullEmail), {
        expirationTtl: remainingTtl,
      });

      const emailList = await KV.get(`emails:${username}`, 'json') || [];
      emailList.push({
        id: emailId,
        from: message.from,
        subject: emailContent.subject,
        snippet: emailContent.text?.substring(0, 100) || '',
        receivedAt: fullEmail.receivedAt,
        read: false,
      });

      await KV.put(`emails:${username}`, JSON.stringify(emailList), {
        expirationTtl: remainingTtl,
      });

      console.log(`Email stored: ${emailId} for ${username}`);

    } catch (err) {
      console.error('Email worker error:', err);
    }
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
    const headerBodySplit = rawEmail.indexOf('\r\n\r\n');
    const headerSection = rawEmail.substring(0, headerBodySplit);
    const bodySection = rawEmail.substring(headerBodySplit + 4);

    const headerLines = headerSection.split('\r\n');
    let currentHeader = '';

    for (const line of headerLines) {
      if (line.startsWith(' ') || line.startsWith('\t')) {
        currentHeader += ' ' + line.trim();
      } else {
        if (currentHeader) {
          const colonIndex = currentHeader.indexOf(':');
          if (colonIndex > -1) {
            const key = currentHeader.substring(0, colonIndex).trim().toLowerCase();
            const value = currentHeader.substring(colonIndex + 1).trim();
            result.headers[key] = value;
          }
        }
        currentHeader = line;
      }
    }

    if (currentHeader) {
      const colonIndex = currentHeader.indexOf(':');
      if (colonIndex > -1) {
        const key = currentHeader.substring(0, colonIndex).trim().toLowerCase();
        const value = currentHeader.substring(colonIndex + 1).trim();
        result.headers[key] = value;
      }
    }

    result.subject = result.headers['subject'] || message.headers?.get('subject') || '(No Subject)';
    result.subject = decodeHeaderValue(result.subject);

    const contentType = result.headers['content-type'] || '';

    if (contentType.includes('multipart')) {
      const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/);
      if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const parts = bodySection.split(`--${boundary}`);

        for (const part of parts) {
          if (part.trim() === '--' || part.trim() === '') continue;

          const partHeaderEnd = part.indexOf('\r\n\r\n');
          if (partHeaderEnd === -1) continue;

          const partHeaders = part.substring(0, partHeaderEnd).toLowerCase();
          const partBody = part.substring(partHeaderEnd + 4).trim();

          if (partHeaders.includes('text/html')) {
            result.html = partBody;
          } else if (partHeaders.includes('text/plain')) {
            result.text = partBody;
          }
        }
      }
    } else if (contentType.includes('text/html')) {
      result.html = bodySection;
    } else {
      result.text = bodySection;
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

function decodeHeaderValue(value) {
  return value.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        return atob(text);
      } else if (encoding.toUpperCase() === 'Q') {
        return text.replace(/=([0-9A-Fa-f]{2})/g, (m, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        ).replace(/_/g, ' ');
      }
    } catch {
      return match;
    }
    return match;
  });
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

function generateId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
