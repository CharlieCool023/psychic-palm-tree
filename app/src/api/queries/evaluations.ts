import { getDb } from "./connection";
import type { Evaluation, InsertEvaluation } from "../../contracts/types";

const db = getDb();

export async function createEvaluation(data: InsertEvaluation): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await db.from("evaluations").insert({
    id,
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });
  if (error) throw error;
  return id;
}

export async function getEvaluationById(id: string): Promise<Evaluation | null> {
  const { data, error } = await db.from("evaluations").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data as Evaluation | null;
}

export async function getEvaluationByCorpsMemberAndRole(corpsMemberId: string, evaluatorRole: string): Promise<Evaluation | null> {
  const { data, error } = await db
    .from("evaluations")
    .select("*")
    .eq("corps_member_id", corpsMemberId)
    .eq("evaluator_role", evaluatorRole)
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as Evaluation | null;
}

export async function getEvaluationsByCorpsMember(corpsMemberId: string): Promise<Evaluation[]> {
  const { data, error } = await db.from("evaluations").select("*").eq("corps_member_id", corpsMemberId).order("created_at", { ascending: false });
  if (error) return [];
  return data as Evaluation[];
}

export async function getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
  const { data, error } = await db.from("evaluations").select("*").eq("evaluator_id", evaluatorId).order("created_at", { ascending: false });
  if (error) return [];
  return data as Evaluation[];
}

export async function updateEvaluation(id: string, data: Partial<InsertEvaluation>): Promise<void> {
  const { error } = await db.from("evaluations").update({ ...data, updated_at: new Date() }).eq("id", id);
  if (error) throw error;
}

export async function deleteEvaluation(id: string): Promise<void> {
  const { error } = await db.from("evaluations").delete().eq("id", id);
  if (error) throw error;
}

export async function getEvaluationsCount(evaluatorId?: string): Promise<number> {
  let query = db.from("evaluations").select("*", { count: "exact", head: true });
  if (evaluatorId) query = query.eq("evaluator_id", evaluatorId);
  
  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}
