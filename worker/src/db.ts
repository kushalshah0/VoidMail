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

export interface InboxRow {
  address: string;
  recovery_key: string;
  created_at: number;
  expires_at: number;
}

const INBOX_TTL = 3600;

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

export async function deleteMessages(db: D1Database, addr: string): Promise<void> {
  await db.prepare(`DELETE FROM messages WHERE to_addr = ?`).bind(addr).run();
}

export async function createInbox(db: D1Database, address: string, recoveryKey: string): Promise<InboxRow> {
  const now = Math.floor(Date.now() / 1000);
  const row: InboxRow = {
    address,
    recovery_key: recoveryKey,
    created_at: now,
    expires_at: now + INBOX_TTL,
  };
  await db
    .prepare(
      `INSERT INTO inboxes (address, recovery_key, created_at, expires_at)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(row.address, row.recovery_key, row.created_at, row.expires_at)
    .run();
  return row;
}

export async function getInboxByRecovery(db: D1Database, recoveryKey: string): Promise<InboxRow | null> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(`SELECT * FROM inboxes WHERE recovery_key = ? AND expires_at > ? LIMIT 1`)
    .bind(recoveryKey, now)
    .all<InboxRow>();
  return result.results[0] ?? null;
}

export async function getInboxByAddress(db: D1Database, address: string): Promise<InboxRow | null> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(`SELECT * FROM inboxes WHERE address = ? AND expires_at > ? LIMIT 1`)
    .bind(address, now)
    .all<InboxRow>();
  return result.results[0] ?? null;
}

export async function deleteInbox(db: D1Database, address: string): Promise<void> {
  await db.prepare(`DELETE FROM inboxes WHERE address = ?`).bind(address).run();
}

export async function cleanupExpired(db: D1Database): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`DELETE FROM messages WHERE expires_at < ?`).bind(now).run();
  await db.prepare(`DELETE FROM inboxes WHERE expires_at < ?`).bind(now).run();
}
