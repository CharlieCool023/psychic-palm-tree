import { getDb } from "./connection";
import type { InsertUser, User } from "../../contracts/types";
import { nanoid } from "nanoid";

const db = getDb();

// Map Supabase snake_case row → camelCase User type
function mapRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    username: row.username as string,
    password: row.password as string,
    email: row.email as string | undefined,
    role: row.role as User["role"],
    state: row.state as string | undefined,
    assignedPlatoon: row.assigned_platoon as number | undefined,
    assignedBatchId: row.assigned_batch_id as string | undefined,
    isActive: row.is_active as boolean,
    isDeleted: row.is_deleted as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    lastSignInAt: row.last_sign_in_at ? new Date(row.last_sign_in_at as string) : undefined,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await db.from("users").select("*").eq("id", id).single();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function upsertUser(data: InsertUser): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await db
    .from("users")
    .upsert(
      {
        full_name: data.fullName,
        username: data.username,
        password: data.password,
        email: data.email,
        role: data.role,
        state: data.state,
        assigned_platoon: data.assignedPlatoon,
        assigned_batch_id: data.assignedBatchId,
        is_active: data.isActive,
        is_deleted: data.isDeleted,
        last_sign_in_at: now,
        updated_at: now,
      },
      { onConflict: "username", ignoreDuplicates: false }
    );
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
  return (data as Record<string, unknown>[]).map(mapRow);
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("role", role)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapRow);
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapRow);
}

export async function updateUser(id: string, data: Partial<InsertUser>): Promise<void> {
  // Convert camelCase fields → Supabase snake_case column names
  const snakeData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.fullName !== undefined) snakeData.full_name = data.fullName;
  if (data.username !== undefined) snakeData.username = data.username;
  if (data.password !== undefined) snakeData.password = data.password;
  if (data.email !== undefined) snakeData.email = data.email;
  if (data.role !== undefined) snakeData.role = data.role;
  if (data.state !== undefined) snakeData.state = data.state;
  if (data.assignedPlatoon !== undefined) snakeData.assigned_platoon = data.assignedPlatoon;
  if (data.assignedBatchId !== undefined) snakeData.assigned_batch_id = data.assignedBatchId;
  if (data.isActive !== undefined) snakeData.is_active = data.isActive;
  if (data.isDeleted !== undefined) snakeData.is_deleted = data.isDeleted;
  if (data.lastSignInAt !== undefined) snakeData.last_sign_in_at = (data.lastSignInAt as Date).toISOString();

  const { error } = await db.from("users").update(snakeData).eq("id", id);
  if (error) throw error;
}

export async function deactivateUser(id: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function softDeleteUser(id: string): Promise<void> {
  const { error } = await db
    .from("users")
    .update({ is_deleted: true, is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function searchUsers(search: string, role?: string): Promise<User[]> {
  let query = db.from("users").select("*").eq("is_deleted", false);
  if (role) query = query.eq("role", role);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return [];

  const users = (data as Record<string, unknown>[]).map(mapRow);
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
  return (data as Record<string, unknown>[]).map(mapRow);
}

export async function findUserByUnionId(_unionId: string): Promise<User | null> {
  return null;
}
