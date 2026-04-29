import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  decimal,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("role", [
  "super_admin",
  "state_commandant",
  "camp_commandant",
  "platoon_instructor",
  "man_o_war_instructor",
  "soldier",
]);

export const batchState = pgEnum("batch_state", ["ondo", "lagos"]);

export const evaluatorRole = pgEnum("evaluator_role", [
  "platoon_instructor",
  "man_o_war_instructor",
]);

export const deploymentState = pgEnum("state_of_deployment", ["ondo", "lagos"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  role: userRole("role").notNull(),
  state: varchar("state", { length: 50 }),
  assignedPlatoon: integer("assigned_platoon"),
  assignedBatchId: varchar("assigned_batch_id", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at"),
});

export const batches = pgTable("batches", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  year: integer("year").notNull(),
  state: batchState("state").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const corpsMembers = pgTable("corps_members", {
  id: varchar("id", { length: 255 }).primaryKey(),
  batchId: varchar("batch_id", { length: 255 }).notNull(),
  passportPhoto: text("passport_photo"),
  surname: varchar("surname", { length: 255 }).notNull(),
  otherNames: varchar("other_names", { length: 255 }).notNull(),
  formerName: varchar("former_name", { length: 255 }),
  stateCode: varchar("state_code", { length: 50 }).notNull().unique(),
  callUpNumber: varchar("call_up_number", { length: 100 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  stateOfOrigin: varchar("state_of_origin", { length: 50 }).notNull(),
  stateOfDeployment: deploymentState("state_of_deployment").notNull(),
  qualification: varchar("qualification", { length: 100 }).notNull(),
  areaOfSpecialization: varchar("area_of_specialization", { length: 100 }).notNull(),
  platoon: integer("platoon").notNull(),
  campExperienceComment: text("camp_experience_comment"),
  isEvaluatedByPlatoon: boolean("is_evaluated_by_platoon").default(false).notNull(),
  isEvaluatedByManOWar: boolean("is_evaluated_by_man_o_war").default(false).notNull(),
  hasSoldierComment: boolean("has_soldier_comment").default(false).notNull(),
  hasCommandantComment: boolean("has_commandant_comment").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const higherInstitutions = pgTable("higher_institutions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  corpsMemberId: varchar("corps_member_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evaluations = pgTable("evaluations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  corpsMemberId: varchar("corps_member_id", { length: 255 }).notNull(),
  evaluatorId: varchar("evaluator_id", { length: 255 }).notNull(),
  evaluatorRole: evaluatorRole("evaluator_role").notNull(),
  leadershipInitiative: integer("leadership_initiative").notNull(),
  professionalBearing: integer("professional_bearing").notNull(),
  physicalFitness: integer("physical_fitness").notNull(),
  communicationSkills: integer("communication_skills").notNull(),
  technicalCompetence: integer("technical_competence").notNull(),
  teamworkCooperation: integer("teamwork_cooperation").notNull(),
  reliabilityDependability: integer("reliability_dependability").notNull(),
  respectDignityRights: integer("respect_dignity_rights").notNull(),
  overallAverage: decimal("overall_average", { precision: 4, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const comments = pgTable("comments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  corpsMemberId: varchar("corps_member_id", { length: 255 }).notNull(),
  soldierId: varchar("soldier_id", { length: 255 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const commandantComments = pgTable("commandant_comments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  corpsMemberId: varchar("corps_member_id", { length: 255 }).notNull().unique(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Batch = typeof batches.$inferSelect;
export type InsertBatch = typeof batches.$inferInsert;
export type CorpsMember = typeof corpsMembers.$inferSelect;
export type InsertCorpsMember = typeof corpsMembers.$inferInsert;
export type HigherInstitution = typeof higherInstitutions.$inferSelect;
export type InsertHigherInstitution = typeof higherInstitutions.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type CommandantComment = typeof commandantComments.$inferSelect;
export type InsertCommandantComment = typeof commandantComments.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
