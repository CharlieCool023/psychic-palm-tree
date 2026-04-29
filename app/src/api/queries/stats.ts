import { getDb } from "./connection";

const db = getDb();

export async function getDashboardStats() {
  const totalUsersSnapshot = await db.from("users").select("*", { count: "exact", head: true }).eq("is_deleted", false);
  const totalCommandantsSnapshot = await db.from("users").select("*", { count: "exact", head: true }).eq("role", "camp_commandant").eq("is_deleted", false);
  const totalBatchesSnapshot = await db.from("batches").select("*", { count: "exact", head: true });
  const totalCorpsMembersSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true });
  const evaluatedByPlatoonSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("is_evaluated_by_platoon", true);
  const evaluatedByManOWarSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("is_evaluated_by_man_o_war", true);
  const withSoldierCommentSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("has_soldier_comment", true);
  const withCommandantCommentSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("has_commandant_comment", true);

  return {
    totalUsers: totalUsersSnapshot.count || 0,
    totalCommandants: totalCommandantsSnapshot.count || 0,
    totalBatches: totalBatchesSnapshot.count || 0,
    totalCorpsMembers: totalCorpsMembersSnapshot.count || 0,
    evaluatedByPlatoon: evaluatedByPlatoonSnapshot.count || 0,
    evaluatedByManOWar: evaluatedByManOWarSnapshot.count || 0,
    withSoldierComment: withSoldierCommentSnapshot.count || 0,
    withCommandantComment: withCommandantCommentSnapshot.count || 0,
  };
}

export async function getBatchStats(batchId: string) {
  const totalCorpsMembersSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("batch_id", batchId);
  const evaluatedByPlatoonSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("batch_id", batchId).eq("is_evaluated_by_platoon", true);
  const evaluatedByManOWarSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("batch_id", batchId).eq("is_evaluated_by_man_o_war", true);
  const withSoldierCommentSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("batch_id", batchId).eq("has_soldier_comment", true);
  const withCommandantCommentSnapshot = await db.from("corps_members").select("*", { count: "exact", head: true }).eq("batch_id", batchId).eq("has_commandant_comment", true);

  return {
    totalCorpsMembers: totalCorpsMembersSnapshot.count || 0,
    evaluatedByPlatoon: evaluatedByPlatoonSnapshot.count || 0,
    evaluatedByManOWar: evaluatedByManOWarSnapshot.count || 0,
    withSoldierComment: withSoldierCommentSnapshot.count || 0,
    withCommandantComment: withCommandantCommentSnapshot.count || 0,
  };
}

export async function getPlatoonStats(platoon: number, batchId?: string) {
  let query = db.from("corps_members").eq("platoon", platoon);
  if (batchId) query = query.eq("batch_id", batchId);

  const totalMembersSnapshot = await query.select("*", { count: "exact", head: true });
  const evaluatedByPlatoonSnapshot = await query.eq("is_evaluated_by_platoon", true).select("*", { count: "exact", head: true });
  const evaluatedByManOWarSnapshot = await query.eq("is_evaluated_by_man_o_war", true).select("*", { count: "exact", head: true });
  const withSoldierCommentSnapshot = await query.eq("has_soldier_comment", true).select("*", { count: "exact", head: true });

  return {
    totalMembers: totalMembersSnapshot.count || 0,
    evaluatedByPlatoon: evaluatedByPlatoonSnapshot.count || 0,
    evaluatedByManOWar: evaluatedByManOWarSnapshot.count || 0,
    withSoldierComment: withSoldierCommentSnapshot.count || 0,
  };
}

export async function getEvaluationAverage(corpsMemberId: string): Promise<string> {
  const { data, error } = await db.from("evaluations").select("overall_average").eq("corps_member_id", corpsMemberId);
  if (error || !data || data.length === 0) return "0";
  const evaluations = data.map(e => e.overall_average);
  const avg = evaluations.reduce((sum: number, val: number) => sum + val, 0) / evaluations.length;
  return avg.toFixed(2);
}
