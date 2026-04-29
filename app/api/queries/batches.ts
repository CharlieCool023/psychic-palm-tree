import { getDb } from "./connection";
import type { Batch, InsertBatch } from "../../contracts/types";

const db = getDb();

export async function getAllBatches(): Promise<Batch[]> {
  const { data, error } = await db.from("batches").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data as Batch[];
}

export async function getActiveBatch(): Promise<Batch | null> {
  const { data, error } = await db.from("batches").select("*").eq("is_active", true).limit(1).maybeSingle();
  if (error) return null;
  return data as Batch | null;
}

export async function getBatchById(id: string): Promise<Batch | null> {
  const { data, error } = await db.from("batches").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data as Batch | null;
}

export async function createBatch(data: InsertBatch): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await db.from("batches").insert({
    id,
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });
  if (error) throw error;
  return id;
}

export async function updateBatch(id: string, data: Partial<InsertBatch>): Promise<void> {
  const { error } = await db.from("batches").update({ ...data, updated_at: new Date() }).eq("id", id);
  if (error) throw error;
}

export async function deactivateBatch(id: string): Promise<void> {
  const { error } = await db.from("batches").update({ is_active: false, updated_at: new Date() }).eq("id", id);
  if (error) throw error;
}

export async function activateBatch(id: string): Promise<void> {
  const { error } = await db.from("batches").update({ is_active: true, updated_at: new Date() }).eq("id", id);
  if (error) throw error;
}
