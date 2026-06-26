export interface MessageRow {
  id: number;
  to_addr: string;
  from_addr: string;
  subject: string;
  text: string;
  html: string;
  received_at: number;
  expires_at: number;
}

export interface NewMessage {
  to_addr: string;
  from_addr: string;
  subject: string;
  text: string;
  html: string;
  ttl: number;
}

export async function saveMessage(db: D1Database, msg: NewMessage): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO messages (to_addr, from_addr, subject, text, html, received_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(msg.to_addr, msg.from_addr, msg.subject, msg.text, msg.html, now, now + msg.ttl)
    .run();
}

export async function getMessages(db: D1Database, addr: string): Promise<MessageRow[]> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(`SELECT * FROM messages WHERE to_addr = ? AND expires_at > ? ORDER BY id ASC`)
    .bind(addr, now)
    .all<MessageRow>();
  return result.results;
}

export async function getMessagesSince(
  db: D1Database,
  addr: string,
  sinceId: number,
): Promise<MessageRow[]> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(`SELECT * FROM messages WHERE to_addr = ? AND id > ? AND expires_at > ? ORDER BY id ASC`)
    .bind(addr, sinceId, now)
    .all<MessageRow>();
  return result.results;
}

export async function cleanupExpired(db: D1Database): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`DELETE FROM messages WHERE expires_at < ?`).bind(now).run();
}
