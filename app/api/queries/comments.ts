import type { firestore as FirestoreType } from "firebase-admin";
import { getDb, fromDoc } from "./connection";
import type { Comment, InsertComment, CommandantComment, InsertCommandantComment } from "../../contracts/types";

const db = getDb();

export async function createComment(data: InsertComment): Promise<string> {
  const docRef = await db.collection('comments').add({ ...data, createdAt: new Date(), updatedAt: new Date() });
  return docRef.id;
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const doc = await db.collection('comments').doc(id).get();
  if (!doc.exists) return null;
  return fromDoc<Comment>({ id: doc.id, ...doc.data() });
}

export async function getCommentByCorpsMemberAndSoldier(corpsMemberId: string, soldierId: string): Promise<Comment | null> {
  const snapshot = await db.collection('comments')
    .where('corpsMemberId', '==', corpsMemberId)
    .where('soldierId', '==', soldierId)
    .limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return fromDoc<Comment>({ id: doc.id, ...doc.data() });
}

export async function getCommentsByCorpsMember(corpsMemberId: string): Promise<Comment[]> {
  const snapshot = await db.collection('comments')
    .where('corpsMemberId', '==', corpsMemberId)
    .orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => fromDoc<Comment>({ id: doc.id, ...doc.data() }));
}

export async function getCommentsBySoldier(soldierId: string): Promise<Comment[]> {
  const snapshot = await db.collection('comments')
    .where('soldierId', '==', soldierId)
    .orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => fromDoc<Comment>({ id: doc.id, ...doc.data() }));
}

export async function updateComment(id: string, data: Partial<InsertComment>): Promise<void> {
  await db.collection('comments').doc(id).update({ ...data, updatedAt: new Date() });
}

export async function deleteComment(id: string): Promise<void> {
  await db.collection('comments').doc(id).delete();
}

export async function getCommentsCount(soldierId?: string): Promise<number> {
  let query: FirestoreType.Query = db.collection('comments');
  if (soldierId) query = query.where('soldierId', '==', soldierId);
  const snapshot = await query.get();
  return snapshot.size;
}

export async function createCommandantComment(data: InsertCommandantComment): Promise<string> {
  const existing = await getCommandantCommentByCorpsMember(data.corpsMemberId);
  if (existing) {
    await db.collection('commandant_comments').doc(existing.id).update({ comment: data.comment, updatedAt: new Date() });
    return existing.id;
  }
  const docRef = await db.collection('commandant_comments').add({ ...data, createdAt: new Date(), updatedAt: new Date() });
  return docRef.id;
}

export async function getCommandantCommentByCorpsMember(corpsMemberId: string): Promise<CommandantComment | null> {
  const snapshot = await db.collection('commandant_comments')
    .where('corpsMemberId', '==', corpsMemberId)
    .limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return fromDoc<CommandantComment>({ id: doc.id, ...doc.data() });
}

export async function updateCommandantComment(id: string, data: Partial<InsertCommandantComment>): Promise<void> {
  await db.collection('commandant_comments').doc(id).update({ ...data, updatedAt: new Date() });
}
