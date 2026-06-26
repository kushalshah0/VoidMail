import PostalMime from "postal-mime";
import { saveMessage, cleanupExpired } from "./db";

export interface Env {
  DB: D1Database;
}

const MESSAGE_TTL = 3600;

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

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await cleanupExpired(env.DB);
  },
};
