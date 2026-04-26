import { getDb } from "./connection";

const db = getDb();

export async function getDashboardStats() {
  const totalUsersSnapshot = await db.collection('users').where('isDeleted', '==', false).get();
  const totalCommandantsSnapshot = await db.collection('users')
    .where('role', '==', 'camp_commandant')
    .where('isDeleted', '==', false)
    .get();
  const totalBatchesSnapshot = await db.collection('batches').get();
  const totalCorpsMembersSnapshot = await db.collection('corps_members').get();
  const evaluatedByPlatoonSnapshot = await db.collection('corps_members').where('isEvaluatedByPlatoon', '==', true).get();
  const evaluatedByManOWarSnapshot = await db.collection('corps_members').where('isEvaluatedByManOWar', '==', true).get();
  const withSoldierCommentSnapshot = await db.collection('corps_members').where('hasSoldierComment', '==', true).get();
  const withCommandantCommentSnapshot = await db.collection('corps_members').where('hasCommandantComment', '==', true).get();

  return {
    totalUsers: totalUsersSnapshot.size,
    totalCommandants: totalCommandantsSnapshot.size,
    totalBatches: totalBatchesSnapshot.size,
    totalCorpsMembers: totalCorpsMembersSnapshot.size,
    evaluatedByPlatoon: evaluatedByPlatoonSnapshot.size,
    evaluatedByManOWar: evaluatedByManOWarSnapshot.size,
    withSoldierComment: withSoldierCommentSnapshot.size,
    withCommandantComment: withCommandantCommentSnapshot.size,
  };
}

export async function getBatchStats(batchId: string) {
  const totalCorpsMembersSnapshot = await db.collection('corps_members').where('batchId', '==', batchId).get();
  const evaluatedByPlatoonSnapshot = await db.collection('corps_members')
    .where('batchId', '==', batchId)
    .where('isEvaluatedByPlatoon', '==', true)
    .get();
  const evaluatedByManOWarSnapshot = await db.collection('corps_members')
    .where('batchId', '==', batchId)
    .where('isEvaluatedByManOWar', '==', true)
    .get();
  const withSoldierCommentSnapshot = await db.collection('corps_members')
    .where('batchId', '==', batchId)
    .where('hasSoldierComment', '==', true)
    .get();
  const withCommandantCommentSnapshot = await db.collection('corps_members')
    .where('batchId', '==', batchId)
    .where('hasCommandantComment', '==', true)
    .get();

  return {
    totalCorpsMembers: totalCorpsMembersSnapshot.size,
    evaluatedByPlatoon: evaluatedByPlatoonSnapshot.size,
    evaluatedByManOWar: evaluatedByManOWarSnapshot.size,
    withSoldierComment: withSoldierCommentSnapshot.size,
    withCommandantComment: withCommandantCommentSnapshot.size,
  };
}

export async function getPlatoonStats(platoon: number, batchId?: string) {
  let query = db.collection('corps_members').where('platoon', '==', platoon);
  if (batchId) {
    query = query.where('batchId', '==', batchId);
  }

  const totalMembersSnapshot = await query.get();
  const evaluatedByPlatoonSnapshot = await query.where('isEvaluatedByPlatoon', '==', true).get();
  const evaluatedByManOWarSnapshot = await query.where('isEvaluatedByManOWar', '==', true).get();
  const withSoldierCommentSnapshot = await query.where('hasSoldierComment', '==', true).get();

  return {
    totalMembers: totalMembersSnapshot.size,
    evaluatedByPlatoon: evaluatedByPlatoonSnapshot.size,
    evaluatedByManOWar: evaluatedByManOWarSnapshot.size,
    withSoldierComment: withSoldierCommentSnapshot.size,
  };
}

export async function getEvaluationAverage(corpsMemberId: string): Promise<string> {
  const snapshot = await db.collection('evaluations')
    .where('corpsMemberId', '==', corpsMemberId)
    .get();
  if (snapshot.empty) return "0";
  const evaluations = snapshot.docs.map(doc => doc.data().overallAverage);
  const avg = evaluations.reduce((sum, val) => sum + val, 0) / evaluations.length;
  return avg.toFixed(2);
}
