import { getDb } from "./connection";
import type { InsertAuditLog, AuditLog } from "../../contracts/types";

const db = getDb();

function mapAuditRow(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    action: row.action as string,
    entityType: row.entity_type as string,
    entityId: row.entity_id as string | undefined,
    details: row.details as string | undefined,
    createdAt: new Date(row.created_at as string),
  };
}

export async function createAuditLog(data: InsertAuditLog): Promise<void> {
  const { error } = await db.from("audit_logs").insert({
    user_id: data.userId,
    action: data.action,
    entity_type: data.entityType,
    entity_id: data.entityId,
    details: data.details,
    created_at: new Date().toISOString(),
  });
  // Non-critical: swallow errors so login flow is not broken by audit logging failures
  if (error) console.error("Audit log error:", error.message);
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const { data, error } = await db
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapAuditRow);
}

export async function getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
  const { data, error } = await db
    .from("audit_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapAuditRow);
}
