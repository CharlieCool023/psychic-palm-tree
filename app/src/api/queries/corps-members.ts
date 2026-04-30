import { getDb } from "./connection";
import type { InsertCorpsMember, CorpsMember } from "../../../contracts/types";

const db = getDb();

function mapCorpsMemberRow(row: Record<string, unknown>): CorpsMember {
  return {
    id: row.id as string,
    batchId: row.batch_id as string,
    passportPhoto: row.passport_photo as string | undefined,
    surname: row.surname as string,
    otherNames: row.other_names as string,
    formerName: row.former_name as string | undefined,
    stateCode: row.state_code as string,
    callUpNumber: row.call_up_number as string,
    phoneNumber: row.phone_number as string,
    stateOfOrigin: row.state_of_origin as string,
    stateOfDeployment: row.state_of_deployment as "ondo" | "lagos",
    qualification: row.qualification as string,
    areaOfSpecialization: row.area_of_specialization as string,
    platoon: row.platoon as number,
    campExperienceComment: row.camp_experience_comment as string | undefined,
    isEvaluatedByPlatoon: row.is_evaluated_by_platoon as boolean,
    isEvaluatedByManOWar: row.is_evaluated_by_man_o_war as boolean,
    hasSoldierComment: row.has_soldier_comment as boolean,
    hasCommandantComment: row.has_commandant_comment as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export async function createCorpsMember(data: InsertCorpsMember): Promise<CorpsMember> {
  const id = crypto.randomUUID();
  const { data: result, error } = await db
    .from("corps_members")
    .insert({
      id,
      batch_id: data.batchId,
      passport_photo: data.passportPhoto,
      surname: data.surname,
      other_names: data.otherNames,
      former_name: data.formerName,
      state_code: data.stateCode,
      call_up_number: data.callUpNumber,
      phone_number: data.phoneNumber,
      state_of_origin: data.stateOfOrigin,
      state_of_deployment: data.stateOfDeployment,
      qualification: data.qualification,
      area_of_specialization: data.areaOfSpecialization,
      platoon: data.platoon,
      camp_experience_comment: data.campExperienceComment,
      is_evaluated_by_platoon: data.isEvaluatedByPlatoon,
      is_evaluated_by_man_o_war: data.isEvaluatedByManOWar,
      has_soldier_comment: data.hasSoldierComment,
      has_commandant_comment: data.hasCommandantComment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return mapCorpsMemberRow(result as Record<string, unknown>);
}

export async function getCorpsMemberById(id: string): Promise<CorpsMember | null> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return mapCorpsMemberRow(data as Record<string, unknown>);
}

export async function getCorpsMemberByStateCode(stateCode: string): Promise<CorpsMember | null> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .eq("state_code", stateCode)
    .single();
  if (error || !data) return null;
  return mapCorpsMemberRow(data as Record<string, unknown>);
}

export async function getAllCorpsMembers(): Promise<CorpsMember[]> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapCorpsMemberRow);
}

export async function getCorpsMembersByPlatoon(platoon: number): Promise<CorpsMember[]> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .eq("platoon", platoon)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapCorpsMemberRow);
}

export async function searchCorpsMembers(search: string): Promise<CorpsMember[]> {
  const { data, error } = await db
    .from("corps_members")
    .select("*")
    .or(`surname.ilike.%${search}%,other_names.ilike.%${search}%,state_code.ilike.%${search}%`)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Record<string, unknown>[]).map(mapCorpsMemberRow);
}

export async function updateCorpsMember(id: string, data: Partial<InsertCorpsMember>): Promise<void> {
  const snakeData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.batchId !== undefined) snakeData.batch_id = data.batchId;
  if (data.passportPhoto !== undefined) snakeData.passport_photo = data.passportPhoto;
  if (data.surname !== undefined) snakeData.surname = data.surname;
  if (data.otherNames !== undefined) snakeData.other_names = data.otherNames;
  if (data.formerName !== undefined) snakeData.former_name = data.formerName;
  if (data.stateCode !== undefined) snakeData.state_code = data.stateCode;
  if (data.callUpNumber !== undefined) snakeData.call_up_number = data.callUpNumber;
  if (data.phoneNumber !== undefined) snakeData.phone_number = data.phoneNumber;
  if (data.stateOfOrigin !== undefined) snakeData.state_of_origin = data.stateOfOrigin;
  if (data.stateOfDeployment !== undefined) snakeData.state_of_deployment = data.stateOfDeployment;
  if (data.qualification !== undefined) snakeData.qualification = data.qualification;
  if (data.areaOfSpecialization !== undefined) snakeData.area_of_specialization = data.areaOfSpecialization;
  if (data.platoon !== undefined) snakeData.platoon = data.platoon;
  if (data.campExperienceComment !== undefined) snakeData.camp_experience_comment = data.campExperienceComment;
  if (data.isEvaluatedByPlatoon !== undefined) snakeData.is_evaluated_by_platoon = data.isEvaluatedByPlatoon;
  if (data.isEvaluatedByManOWar !== undefined) snakeData.is_evaluated_by_man_o_war = data.isEvaluatedByManOWar;
  if (data.hasSoldierComment !== undefined) snakeData.has_soldier_comment = data.hasSoldierComment;
  if (data.hasCommandantComment !== undefined) snakeData.has_commandant_comment = data.hasCommandantComment;
  const { error } = await db.from("corps_members").update(snakeData).eq("id", id);
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
    .insert({
      corps_member_id: data.corpsMemberId,
      name: data.name,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      created_at: new Date().toISOString(),
    });
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