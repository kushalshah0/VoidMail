import PostalMime from "postal-mime";
import { saveMessage, getMessages, getMessagesSince, cleanupExpired, createInbox, getInboxByRecovery, deleteInbox, deleteMessages } from "./db";
import { renderUI } from "./ui";

export interface Env {
  DB: D1Database;
  DOMAIN: string;
}

const MESSAGE_TTL = 3600;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function generateLocalPart(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateRecoveryKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments: string[] = [];
  for (let i = 0; i < 4; i++) {
    let segment = "";
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, _ctx: ExecutionContext): Promise<void> {
    const raw = await new Response(message.raw).arrayBuffer();
    const parsed = await PostalMime.parse(raw);

    const toAddr = (parsed.to?.[0]?.address ?? message.to).toLowerCase();
    const fromAddr = (parsed.from?.address ?? message.from).toLowerCase();
    const subject = parsed.subject ?? "(no subject)";
    const text = parsed.text ?? "";
    const html = parsed.html ?? "";

    await saveMessage(env.DB, {
      to_addr: toAddr,
      from_addr: fromAddr,
      subject,
      text,
      html,
      ttl: MESSAGE_TTL,
    });
  },

  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") {
      return new Response(renderUI(env.DOMAIN), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (path === "/api/generate" && request.method === "POST") {
      const address = `${generateLocalPart()}@${env.DOMAIN}`;
      const recoveryKey = generateRecoveryKey();
      const inbox = await createInbox(env.DB, address, recoveryKey);
      return json({
        address,
        recoveryKey,
        createdAt: new Date(inbox.created_at * 1000).toISOString(),
        expiresAt: new Date(inbox.expires_at * 1000).toISOString(),
      });
    }

    if (path === "/api/recover" && request.method === "POST") {
      const body = await request.json() as { recoveryKey?: string };
      const key = (body.recoveryKey || "").toUpperCase().trim();
      if (!key) {
        return json({ error: "Recovery key is required" }, 400);
      }
      const inbox = await getInboxByRecovery(env.DB, key);
      if (!inbox) {
        return json({ error: "Invalid or expired recovery key" }, 404);
      }
      return json({ address: inbox.address, expiresAt: new Date(inbox.expires_at * 1000).toISOString() });
    }

    const inboxMatch = path.match(/^\/api\/inbox\/(.+)$/);
    if (inboxMatch) {
      const addr = decodeURIComponent(inboxMatch[1]).toLowerCase();

      if (request.method === "DELETE") {
        const body = await request.json() as { recoveryKey?: string };
        const key = (body.recoveryKey || "").toUpperCase().trim();
        const inbox = await getInboxByRecovery(env.DB, key);
        if (!inbox || inbox.address !== addr) {
          return json({ error: "Invalid recovery key" }, 403);
        }
        await deleteMessages(env.DB, addr);
        await deleteInbox(env.DB, addr);
        return json({ success: true });
      }

      const since = parseInt(url.searchParams.get("since") ?? "0", 10);
      const messages =
        since > 0 ? await getMessagesSince(env.DB, addr, since) : await getMessages(env.DB, addr);

      return json({ messages });
    }

    return json({ error: "Not found" }, 404);
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await cleanupExpired(env.DB);
  },
};
