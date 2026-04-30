import { getDb } from "./connection";
import type { Batch, InsertBatch } from "../../../contracts/types";

const db = getDb();

function mapBatchRow(row: Record<string, unknown>): Batch {
  return {
    id: row.id as string,
    name: row.name as string,
    year: row.year as number,
    state: row.state as "ondo" | "lagos",
    description: row.description as string | undefined,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export async function getAllBatches(): Promise<Batch[]> {
  const { data, error } = await db.from("batches").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapBatchRow);
}

export async function getActiveBatch(): Promise<Batch | null> {
  const { data, error } = await db.from("batches").select("*").eq("is_active", true).limit(1).maybeSingle();
  if (error || !data) return null;
  return mapBatchRow(data as Record<string, unknown>);
}

export async function getBatchById(id: string): Promise<Batch | null> {
  const { data, error } = await db.from("batches").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapBatchRow(data as Record<string, unknown>);
}

export async function createBatch(data: InsertBatch): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await db.from("batches").insert({
    id,
    name: data.name,
    year: data.year,
    state: data.state,
    description: data.description,
    is_active: data.isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return id;
}

export async function updateBatch(id: string, data: Partial<InsertBatch>): Promise<void> {
  const snakeData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) snakeData.name = data.name;
  if (data.year !== undefined) snakeData.year = data.year;
  if (data.state !== undefined) snakeData.state = data.state;
  if (data.description !== undefined) snakeData.description = data.description;
  if (data.isActive !== undefined) snakeData.is_active = data.isActive;
  const { error } = await db.from("batches").update(snakeData).eq("id", id);
  if (error) throw error;
}

export async function deactivateBatch(id: string): Promise<void> {
  const { error } = await db.from("batches").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function activateBatch(id: string): Promise<void> {
  const { error } = await db.from("batches").update({ is_active: true, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
