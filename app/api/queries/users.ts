import { getDb } from "./connection";
import type { InsertUser, User } from "../../contracts/types";

const db = getDb();

export async function findUserById(id: string): Promise<User | null> {
  const doc = await db.collection('users').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as User;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

export async function upsertUser(data: InsertUser): Promise<void> {
  const existingUser = await findUserByUsername(data.username);
  const updateData = {
    ...data,
    lastSignInAt: new Date(),
    updatedAt: new Date(),
  };
  if (existingUser) {
    await db.collection('users').doc(existingUser.id).update(updateData);
  } else {
    await db.collection('users').add({
      ...data,
      lastSignInAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function getActiveUsers(): Promise<User[]> {
  const snapshot = await db.collection('users')
    .where('isActive', '==', true)
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const snapshot = await db.collection('users')
    .where('role', '==', role)
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getAllUsers(): Promise<User[]> {
  const snapshot = await db.collection('users')
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function updateUser(id: string, data: Partial<InsertUser>): Promise<void> {
  await db.collection('users').doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deactivateUser(id: string): Promise<void> {
  await db.collection('users').doc(id).update({
    isActive: false,
    updatedAt: new Date(),
  });
}

export async function softDeleteUser(id: string): Promise<void> {
  await db.collection('users').doc(id).update({
    isDeleted: true,
    isActive: false,
    updatedAt: new Date(),
  });
}

export async function searchUsers(search: string, role?: string): Promise<User[]> {
  let query: FirebaseFirestore.Query = db.collection('users').where('isDeleted', '==', false);
  if (role) {
    query = query.where('role', '==', role);
  }
  const snapshot = await query.orderBy('createdAt', 'desc').get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  if (search) {
    const s = search.toLowerCase();
    return users.filter(u =>
      u.fullName?.toLowerCase().includes(s) || u.username?.toLowerCase().includes(s)
    );
  }
  return users;
}

export async function getUsersByPlatoon(platoon: number): Promise<User[]> {
  const snapshot = await db.collection('users')
    .where('assignedPlatoon', '==', platoon)
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

// OAuth compatibility
export async function findUserByUnionId(_unionId: string): Promise<User | null> {
  return null;
}

