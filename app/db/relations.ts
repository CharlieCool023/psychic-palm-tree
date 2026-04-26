import { relations } from "drizzle-orm";
import {
  users,
  batches,
  corpsMembers,
  higherInstitutions,
  evaluations,
  comments,
  commandantComments,
  auditLogs,
} from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  assignedBatch: one(batches, {
    fields: [users.assignedBatchId],
    references: [batches.id],
  }),
}));

export const batchesRelations = relations(batches, ({ many }) => ({
  corpsMembers: many(corpsMembers),
  staff: many(users),
}));

export const corpsMembersRelations = relations(corpsMembers, ({ one, many }) => ({
  batch: one(batches, {
    fields: [corpsMembers.batchId],
    references: [batches.id],
  }),
  higherInstitutions: many(higherInstitutions),
  evaluations: many(evaluations),
  comments: many(comments),
  commandantComment: one(commandantComments, {
    fields: [corpsMembers.id],
    references: [commandantComments.corpsMemberId],
  }),
}));

export const higherInstitutionsRelations = relations(higherInstitutions, ({ one }) => ({
  corpsMember: one(corpsMembers, {
    fields: [higherInstitutions.corpsMemberId],
    references: [corpsMembers.id],
  }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  corpsMember: one(corpsMembers, {
    fields: [evaluations.corpsMemberId],
    references: [corpsMembers.id],
  }),
  evaluator: one(users, {
    fields: [evaluations.evaluatorId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  corpsMember: one(corpsMembers, {
    fields: [comments.corpsMemberId],
    references: [corpsMembers.id],
  }),
  soldier: one(users, {
    fields: [comments.soldierId],
    references: [users.id],
  }),
}));

export const commandantCommentsRelations = relations(commandantComments, ({ one }) => ({
  corpsMember: one(corpsMembers, {
    fields: [commandantComments.corpsMemberId],
    references: [corpsMembers.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
