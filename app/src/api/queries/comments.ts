import { getDb } from "./connection";
import type { Comment, InsertComment, CommandantComment, InsertCommandantComment } from "../../contracts/types";

const db = getDb();

export async function createComment(data: InsertComment): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await db.from("comments").insert({
    id,
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });
  if (error) throw error;
  return id;
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const { data, error } = await db.from("comments").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data as Comment | null;
}

export async function getCommentByCorpsMemberAndSoldier(corpsMemberId: string, soldierId: string): Promise<Comment | null> {
  const { data, error } = await db
    .from("comments")
    .select("*")
    .eq("corps_member_id", corpsMemberId)
    .eq("soldier_id", soldierId)
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as Comment | null;
}

export async function getCommentsByCorpsMember(corpsMemberId: string): Promise<Comment[]> {
  const { data, error } = await db.from("comments").select("*").eq("corps_member_id", corpsMemberId).order("created_at", { ascending: false });
  if (error) return [];
  return data as Comment[];
}

export async function getCommentsBySoldier(soldierId: string): Promise<Comment[]> {
  const { data, error } = await db.from("comments").select("*").eq("soldier_id", soldierId).order("created_at", { ascending: false });
  if (error) return [];
  return data as Comment[];
}

export async function updateComment(id: string, data: Partial<InsertComment>): Promise<void> {
  const { error } = await db.from("comments").update({ ...data, updated_at: new Date() }).eq("id", id);
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await db.from("comments").delete().eq("id", id);
  if (error) throw error;
}

export async function getCommentsCount(soldierId?: string): Promise<number> {
  let query = db.from("comments").select("*", { count: "exact", head: true });
  if (soldierId) query = query.eq("soldier_id", soldierId);
  
  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}

export async function createCommandantComment(data: InsertCommandantComment): Promise<string> {
  const existing = await getCommandantCommentByCorpsMember(data.corps_member_id);
  if (existing) {
    const { error } = await db.from("commandant_comments").update({ comment: data.comment, updated_at: new Date() }).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }
  
  const id = crypto.randomUUID();
  const { error } = await db.from("commandant_comments").insert({
    id,
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });
  if (error) throw error;
  return id;
}

export async function getCommandantCommentByCorpsMember(corpsMemberId: string): Promise<CommandantComment | null> {
  const { data, error } = await db
    .from("commandant_comments")
    .select("*")
    .eq("corps_member_id", corpsMemberId)
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as CommandantComment | null;
}

export async function updateCommandantComment(id: string, data: Partial<InsertCommandantComment>): Promise<void> {
  const { error } = await db.from("commandant_comments").update({ ...data, updated_at: new Date() }).eq("id", id);
  if (error) throw error;
}
