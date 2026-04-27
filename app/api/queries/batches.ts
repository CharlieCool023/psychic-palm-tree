import { getDb, fromDoc } from "./connection";
import type { Batch, InsertBatch } from "../../contracts/types";

const db = getDb();

export async function getAllBatches(): Promise<Batch[]> {
  const snapshot = await db.collection('batches').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => fromDoc<Batch>({ id: doc.id, ...doc.data() }));
}

export async function getActiveBatch(): Promise<Batch | null> {
  const snapshot = await db.collection('batches').where('isActive', '==', true).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return fromDoc<Batch>({ id: doc.id, ...doc.data() });
}

export async function getBatchById(id: string): Promise<Batch | null> {
  const doc = await db.collection('batches').doc(id).get();
  if (!doc.exists) return null;
  return fromDoc<Batch>({ id: doc.id, ...doc.data() });
}

export async function createBatch(data: InsertBatch): Promise<string> {
  const docRef = await db.collection('batches').add({ ...data, createdAt: new Date(), updatedAt: new Date() });
  return docRef.id;
}

export async function updateBatch(id: string, data: Partial<InsertBatch>): Promise<void> {
  await db.collection('batches').doc(id).update({ ...data, updatedAt: new Date() });
}

export async function deactivateBatch(id: string): Promise<void> {
  await db.collection('batches').doc(id).update({ isActive: false, updatedAt: new Date() });
}

export async function activateBatch(id: string): Promise<void> {
  await db.collection('batches').doc(id).update({ isActive: true, updatedAt: new Date() });
}
