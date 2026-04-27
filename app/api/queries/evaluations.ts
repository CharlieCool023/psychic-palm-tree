import type { firestore as FirestoreType } from "firebase-admin";
import { getDb, fromDoc } from "./connection";
import type { Evaluation, InsertEvaluation } from "../../contracts/types";

const db = getDb();

export async function createEvaluation(data: InsertEvaluation): Promise<string> {
  const docRef = await db.collection('evaluations').add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function getEvaluationById(id: string): Promise<Evaluation | null> {
  const doc = await db.collection('evaluations').doc(id).get();
  if (!doc.exists) return null;
  return fromDoc<Evaluation>({ id: doc.id, ...doc.data() });
}

export async function getEvaluationByCorpsMemberAndRole(corpsMemberId: string, evaluatorRole: string): Promise<Evaluation | null> {
  const snapshot = await db.collection('evaluations')
    .where('corpsMemberId', '==', corpsMemberId)
    .where('evaluatorRole', '==', evaluatorRole)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return fromDoc<Evaluation>({ id: doc.id, ...doc.data() });
}

export async function getEvaluationsByCorpsMember(corpsMemberId: string): Promise<Evaluation[]> {
  const snapshot = await db.collection('evaluations')
    .where('corpsMemberId', '==', corpsMemberId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => fromDoc<Evaluation>({ id: doc.id, ...doc.data() }));
}

export async function getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
  const snapshot = await db.collection('evaluations')
    .where('evaluatorId', '==', evaluatorId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => fromDoc<Evaluation>({ id: doc.id, ...doc.data() }));
}

export async function updateEvaluation(id: string, data: Partial<InsertEvaluation>): Promise<void> {
  await db.collection('evaluations').doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteEvaluation(id: string): Promise<void> {
  await db.collection('evaluations').doc(id).delete();
}

export async function getEvaluationsCount(evaluatorId?: string): Promise<number> {
  let query: FirestoreType.Query = db.collection('evaluations');
  if (evaluatorId) {
    query = query.where('evaluatorId', '==', evaluatorId);
  }
  const snapshot = await query.get();
  return snapshot.size;
}
