import { getDb } from "./connection";
import type { InsertUser, User } from "../../contracts/types";
import { nanoid } from "nanoid";

const db = getDb();

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await db.from("users").select("*").eq("id", id).single();
  if (error) return null;
  return data as User;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as User;
}

export async function upsertUser(data: InsertUser): Promise<void> {
  const now = new Date();
  const updateData = {
    ...data,
    last_sign_in_at: now,
    updated_at: now,
  };

  const { error } = await db
    .from("users")
    .upsert(updateData, {
      onConflict: "username",
      ignoreDuplicates: false,
    });

  if (error) throw error;
}

export async function getActiveUsers(): Promise<User[]> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("is_active", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as User[];
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("role", role)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as User[];
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as User[];
}

export async function updateUser(id: string, data: Partial<InsertUser>): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ ...data, updated_at: new Date() })
    .eq("id", id);
  if (error) throw error;
}

export async function deactivateUser(id: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ is_active: false, updated_at: new Date() })
    .eq("id", id);
  if (error) throw error;
}

export async function softDeleteUser(id: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ is_deleted: true, is_active: false, updated_at: new Date() })
    .eq("id", id);
  if (error) throw error;
}

export async function searchUsers(search: string, role?: string): Promise<User[]> {
  let query = db.from("users").select("*").eq("is_deleted", false);
  
  if (role) {
    query = query.eq("role", role);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return [];

  const users = data as User[];
  if (!search) return users;

  const s = search.toLowerCase();
  return users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(s) ||
      u.username?.toLowerCase().includes(s)
  );
}

export async function getUsersByPlatoon(platoon: number): Promise<User[]> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("assigned_platoon", platoon)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as User[];
}

export async function findUserByUnionId(_unionId: string): Promise<User | null> {
  return null;
}

