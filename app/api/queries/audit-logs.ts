import { getDb } from "./connection";
import type { InsertAuditLog, AuditLog } from "../../contracts/types";

const db = getDb();

export async function createAuditLog(data: InsertAuditLog): Promise<void> {
  const { error } = await db.from("audit_logs").insert({
    ...data,
    created_at: new Date(),
  });
  if (error) throw error;
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const { data, error } = await db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) return [];
  return data as AuditLog[];
}

export async function getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
  const { data, error } = await db.from("audit_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) return [];
  return data as AuditLog[];
}
