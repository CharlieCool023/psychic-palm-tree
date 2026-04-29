import { getDb } from "./connection";
import type { InsertCorpsMember, CorpsMember } from "../../contracts/types";

const db = getDb();

export async function createCorpsMember(data: InsertCorpsMember): Promise<CorpsMember> {
  const { data: result, error } = await db
    .from("corps_members")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as CorpsMember;
}

export async function getCorpsMemberById(id: string): Promise<CorpsMember | null> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as CorpsMember;
}

export async function getCorpsMemberByStateCode(stateCode: string): Promise<CorpsMember | null> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .eq("state_code", stateCode)
    .single();
  if (error) return null;
  return data as CorpsMember;
}

export async function getAllCorpsMembers(): Promise<CorpsMember[]> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as CorpsMember[];
}

export async function getCorpsMembersByPlatoon(platoon: number): Promise<CorpsMember[]> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .eq("platoon", platoon)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as CorpsMember[];
}

export async function searchCorpsMembers(search: string): Promise<CorpsMember[]> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .or(`surname.ilike.%${search}%,other_names.ilike.%${search}%,state_code.ilike.%${search}%`)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as CorpsMember[];
}

export async function updateCorpsMember(id: string, data: Partial<InsertCorpsMember>): Promise<void> {
  const { error } = await db
    .from("corps_members")
    .update({ ...data, updated_at: new Date() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCorpsMember(id: string): Promise<void> {
  const { error } = await db
    .from("corps_members")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function addHigherInstitution(data: { corpsMemberId: string; name: string; startDate: Date; endDate: Date }): Promise<void> {
  const { error } = await db
    .from("higher_institutions")
    .insert(data);
  if (error) throw error;
}

export async function getHigherInstitutionsByCorpsMember(corpsMemberId: string) {
  const { data, error } = await db
    .from("higher_institutions")
    .select("*")
    .eq("corps_member_id", corpsMemberId)
    .order("start_date", { ascending: false });
  if (error) return [];
  return data;
}