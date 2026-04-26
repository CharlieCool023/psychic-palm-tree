import type { firestore as FirestoreType } from "firebase-admin";
import { getDb } from "./connection";
import type { CorpsMember, InsertCorpsMember, HigherInstitution, InsertHigherInstitution } from "../../contracts/types";

const db = getDb();

export async function createCorpsMember(data: InsertCorpsMember): Promise<string> {
  const docRef = await db.collection('corps_members').add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function getCorpsMemberById(id: string): Promise<CorpsMember | null> {
  const doc = await db.collection('corps_members').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as CorpsMember;
}

export async function getCorpsMemberByStateCode(stateCode: string): Promise<CorpsMember | null> {
  const snapshot = await db.collection('corps_members').where('stateCode', '==', stateCode).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as CorpsMember;
}

export async function getAllCorpsMembers(batchId?: string): Promise<CorpsMember[]> {
  let query: FirestoreType.Query = db.collection('corps_members').orderBy('createdAt', 'desc');
  if (batchId) {
    query = query.where('batchId', '==', batchId);
  }
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CorpsMember));
}

export async function getCorpsMembersByPlatoon(platoon: number, batchId?: string): Promise<CorpsMember[]> {
  let query: FirestoreType.Query = db.collection('corps_members')
    .where('platoon', '==', platoon)
    .orderBy('createdAt', 'desc');
  if (batchId) {
    query = query.where('batchId', '==', batchId);
  }
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CorpsMember));
}

export async function searchCorpsMembers(search: string, batchId?: string, platoon?: number, evaluatedBy?: string): Promise<CorpsMember[]> {
  let query: FirestoreType.Query = db.collection('corps_members');
  if (batchId) {
    query = query.where('batchId', '==', batchId);
  }
  if (platoon) {
    query = query.where('platoon', '==', platoon);
  }
  if (evaluatedBy === "platoon") {
    query = query.where('isEvaluatedByPlatoon', '==', true);
  } else if (evaluatedBy === "man_o_war") {
    query = query.where('isEvaluatedByManOWar', '==', true);
  } else if (evaluatedBy === "soldier") {
    query = query.where('hasSoldierComment', '==', true);
  }
  // For pending, it's or condition, which Firestore doesn't support easily, so fetch all and filter later if needed
  const snapshot = await query.orderBy('createdAt', 'desc').get();
  let corpsMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CorpsMember));

  if (search) {
    const s = search.toLowerCase();
    corpsMembers = corpsMembers.filter(cm =>
      cm.surname.toLowerCase().includes(s) ||
      cm.otherNames.toLowerCase().includes(s) ||
      cm.stateCode.toLowerCase().includes(s) ||
      cm.callUpNumber.toLowerCase().includes(s)
    );
  }

  if (evaluatedBy === "pending") {
    corpsMembers = corpsMembers.filter(cm =>
      !cm.isEvaluatedByPlatoon || !cm.isEvaluatedByManOWar || !cm.hasSoldierComment
    );
  }

  return corpsMembers;
}

export async function updateCorpsMember(id: string, data: Partial<InsertCorpsMember>): Promise<void> {
  await db.collection('corps_members').doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteCorpsMember(id: string): Promise<void> {
  await db.collection('corps_members').doc(id).delete();
}

export async function addHigherInstitution(data: InsertHigherInstitution): Promise<string> {
  const docRef = await db.collection('higher_institutions').add({
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function getHigherInstitutionsByCorpsMember(corpsMemberId: string): Promise<HigherInstitution[]> {
  const snapshot = await db.collection('higher_institutions')
    .where('corpsMemberId', '==', corpsMemberId)
    .orderBy('endDate', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HigherInstitution));
}

export async function getCorpsMembersCount(batchId?: string): Promise<number> {
  let query: FirestoreType.Query = db.collection('corps_members');
  if (batchId) {
    query = query.where('batchId', '==', batchId);
  }
  const snapshot = await query.get();
  return snapshot.size;
}
