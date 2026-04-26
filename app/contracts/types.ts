export type User = {
  id: string;
  fullName: string;
  username: string;
  password: string;
  email?: string;
  role: "super_admin" | "state_commandant" | "camp_commandant" | "platoon_instructor" | "man_o_war_instructor" | "soldier";
  state?: string;
  assignedPlatoon?: number;
  assignedBatchId?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
};

export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type Batch = {
  id: string;
  name: string;
  year: number;
  state: "ondo" | "lagos";
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertBatch = Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>;

export type CorpsMember = {
  id: string;
  batchId: string;
  passportPhoto?: string;
  surname: string;
  otherNames: string;
  formerName?: string;
  stateCode: string;
  callUpNumber: string;
  phoneNumber: string;
  stateOfOrigin: string;
  stateOfDeployment: "ondo" | "lagos";
  qualification: string;
  areaOfSpecialization: string;
  platoon: number;
  campExperienceComment?: string;
  isEvaluatedByPlatoon: boolean;
  isEvaluatedByManOWar: boolean;
  hasSoldierComment: boolean;
  hasCommandantComment: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCorpsMember = Omit<CorpsMember, 'id' | 'createdAt' | 'updatedAt'>;

export type HigherInstitution = {
  id: string;
  corpsMemberId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
};

export type InsertHigherInstitution = Omit<HigherInstitution, 'id' | 'createdAt'>;

export type Evaluation = {
  id: string;
  corpsMemberId: string;
  evaluatorId: string;
  evaluatorRole: "platoon_instructor" | "man_o_war_instructor";
  leadershipInitiative: number;
  professionalBearing: number;
  physicalFitness: number;
  communicationSkills: number;
  technicalCompetence: number;
  teamworkCooperation: number;
  reliabilityDependability: number;
  respectDignityRights: number;
  overallAverage: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertEvaluation = Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>;

export type Comment = {
  id: string;
  corpsMemberId: string;
  soldierId: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertComment = Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>;

export type CommandantComment = {
  id: string;
  corpsMemberId: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertCommandantComment = Omit<CommandantComment, 'id' | 'createdAt' | 'updatedAt'>;

export type AuditLog = {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: Date;
};

export type InsertAuditLog = Omit<AuditLog, 'id' | 'createdAt'>;

export * from "./errors";
