import PostalMime from "postal-mime";
import { saveMessage, getMessages, getMessagesSince, cleanupExpired } from "./db";
import { renderUI } from "./ui";

export interface Env {
  DB: D1Database;
  DOMAIN: string;
}

const MESSAGE_TTL = 3600;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
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
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") {
      return new Response(renderUI(env.DOMAIN), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (path === "/api/generate") {
      const address = `${generateLocalPart()}@${env.DOMAIN}`;
      return json({ address });
    }

    const inboxMatch = path.match(/^\/api\/inbox\/(.+)$/);
    if (inboxMatch) {
      const addr = decodeURIComponent(inboxMatch[1]).toLowerCase();
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
