import { getDb } from "./connection";
import type { Comment, InsertComment, CommandantComment, InsertCommandantComment } from "../../../contracts/types";

const db = getDb();

function mapCommentRow(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    corpsMemberId: row.corps_member_id as string,
    soldierId: row.soldier_id as string,
    comment: row.comment as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapCommandantCommentRow(row: Record<string, unknown>): CommandantComment {
  return {
    id: row.id as string,
    corpsMemberId: row.corps_member_id as string,
    comment: row.comment as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export async function createComment(data: InsertComment): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await db.from("comments").insert({
    id,
    corps_member_id: data.corpsMemberId,
    soldier_id: data.soldierId,
    comment: data.comment,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return id;
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const { data, error } = await db.from("comments").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapCommentRow(data as Record<string, unknown>);
}

export async function getCommentByCorpsMemberAndSoldier(corpsMemberId: string, soldierId: string): Promise<Comment | null> {
  const { data, error } = await db
    .from("comments")
    .select("*")
    .eq("corps_member_id", corpsMemberId)
    .eq("soldier_id", soldierId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapCommentRow(data as Record<string, unknown>);
}

export async function getCommentsByCorpsMember(corpsMemberId: string): Promise<Comment[]> {
  const { data, error } = await db.from("comments").select("*").eq("corps_member_id", corpsMemberId).order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapCommentRow);
}

export async function getCommentsBySoldier(soldierId: string): Promise<Comment[]> {
  const { data, error } = await db.from("comments").select("*").eq("soldier_id", soldierId).order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapCommentRow);
}

export async function updateComment(id: string, data: Partial<InsertComment>): Promise<void> {
  const snakeData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.corpsMemberId !== undefined) snakeData.corps_member_id = data.corpsMemberId;
  if (data.soldierId !== undefined) snakeData.soldier_id = data.soldierId;
  if (data.comment !== undefined) snakeData.comment = data.comment;
  const { error } = await db.from("comments").update(snakeData).eq("id", id);
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
  const existing = await getCommandantCommentByCorpsMember(data.corpsMemberId);
  if (existing) {
    const { error } = await db.from("commandant_comments").update({ comment: data.comment, updated_at: new Date().toISOString() }).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const id = crypto.randomUUID();
  const { error } = await db.from("commandant_comments").insert({
    id,
    corps_member_id: data.corpsMemberId,
    comment: data.comment,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  if (error || !data) return null;
  return mapCommandantCommentRow(data as Record<string, unknown>);
}

export async function updateCommandantComment(id: string, data: Partial<InsertCommandantComment>): Promise<void> {
  const snakeData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.corpsMemberId !== undefined) snakeData.corps_member_id = data.corpsMemberId;
  if (data.comment !== undefined) snakeData.comment = data.comment;
  const { error } = await db.from("commandant_comments").update(snakeData).eq("id", id);
  if (error) throw error;
}
