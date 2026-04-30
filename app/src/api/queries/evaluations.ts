import { getDb } from "./connection";
import type { Evaluation, InsertEvaluation } from "../../contracts/types";

const db = getDb();

function mapEvaluationRow(row: Record<string, unknown>): Evaluation {
  return {
    id: row.id as string,
    corpsMemberId: row.corps_member_id as string,
    evaluatorId: row.evaluator_id as string,
    evaluatorRole: row.evaluator_role as "platoon_instructor" | "man_o_war_instructor",
    leadershipInitiative: Number(row.leadership_initiative),
    professionalBearing: Number(row.professional_bearing),
    physicalFitness: Number(row.physical_fitness),
    communicationSkills: Number(row.communication_skills),
    technicalCompetence: Number(row.technical_competence),
    teamworkCooperation: Number(row.teamwork_cooperation),
    reliabilityDependability: Number(row.reliability_dependability),
    respectDignityRights: Number(row.respect_dignity_rights),
    overallAverage: Number(row.overall_average),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export async function createEvaluation(data: InsertEvaluation): Promise<string> {
  const id = crypto.randomUUID();
  const { error } = await db.from("evaluations").insert({
    id,
    corps_member_id: data.corpsMemberId,
    evaluator_id: data.evaluatorId,
    evaluator_role: data.evaluatorRole,
    leadership_initiative: data.leadershipInitiative,
    professional_bearing: data.professionalBearing,
    physical_fitness: data.physicalFitness,
    communication_skills: data.communicationSkills,
    technical_competence: data.technicalCompetence,
    teamwork_cooperation: data.teamworkCooperation,
    reliability_dependability: data.reliabilityDependability,
    respect_dignity_rights: data.respectDignityRights,
    overall_average: data.overallAverage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return id;
}

export async function getEvaluationById(id: string): Promise<Evaluation | null> {
  const { data, error } = await db.from("evaluations").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapEvaluationRow(data as Record<string, unknown>);
}

export async function getEvaluationByCorpsMemberAndRole(corpsMemberId: string, evaluatorRole: string): Promise<Evaluation | null> {
  const { data, error } = await db
    .from("evaluations")
    .select("*")
    .eq("corps_member_id", corpsMemberId)
    .eq("evaluator_role", evaluatorRole)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapEvaluationRow(data as Record<string, unknown>);
}

export async function getEvaluationsByCorpsMember(corpsMemberId: string): Promise<Evaluation[]> {
  const { data, error } = await db.from("evaluations").select("*").eq("corps_member_id", corpsMemberId).order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapEvaluationRow);
}

export async function getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
  const { data, error } = await db.from("evaluations").select("*").eq("evaluator_id", evaluatorId).order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapEvaluationRow);
}

export async function updateEvaluation(id: string, data: Partial<InsertEvaluation>): Promise<void> {
  const snakeData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.corpsMemberId !== undefined) snakeData.corps_member_id = data.corpsMemberId;
  if (data.evaluatorId !== undefined) snakeData.evaluator_id = data.evaluatorId;
  if (data.evaluatorRole !== undefined) snakeData.evaluator_role = data.evaluatorRole;
  if (data.leadershipInitiative !== undefined) snakeData.leadership_initiative = data.leadershipInitiative;
  if (data.professionalBearing !== undefined) snakeData.professional_bearing = data.professionalBearing;
  if (data.physicalFitness !== undefined) snakeData.physical_fitness = data.physicalFitness;
  if (data.communicationSkills !== undefined) snakeData.communication_skills = data.communicationSkills;
  if (data.technicalCompetence !== undefined) snakeData.technical_competence = data.technicalCompetence;
  if (data.teamworkCooperation !== undefined) snakeData.teamwork_cooperation = data.teamworkCooperation;
  if (data.reliabilityDependability !== undefined) snakeData.reliability_dependability = data.reliabilityDependability;
  if (data.respectDignityRights !== undefined) snakeData.respect_dignity_rights = data.respectDignityRights;
  if (data.overallAverage !== undefined) snakeData.overall_average = data.overallAverage;
  const { error } = await db.from("evaluations").update(snakeData).eq("id", id);
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


