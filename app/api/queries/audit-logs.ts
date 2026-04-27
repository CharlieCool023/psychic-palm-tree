import { getDb, fromDoc } from "./connection";
import type { InsertAuditLog, AuditLog } from "../../contracts/types";

const db = getDb();

export async function createAuditLog(data: InsertAuditLog): Promise<void> {
  await db.collection('audit_logs').add({ ...data, createdAt: new Date() });
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const snapshot = await db.collection('audit_logs').orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs.map(doc => fromDoc<AuditLog>({ id: doc.id, ...doc.data() }));
}

export async function getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
  const snapshot = await db.collection('audit_logs')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => fromDoc<AuditLog>({ id: doc.id, ...doc.data() }));
}
