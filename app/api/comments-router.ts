import { z } from "zod";
import { createRouter, soldierQuery, anyStaffQuery, campCommandantQuery } from "./middleware";
import {
  createComment,
  getCommentByCorpsMemberAndSoldier,
  getCommentsByCorpsMember,
  getCommentsBySoldier,
  updateComment,
  createCommandantComment,
  getCommandantCommentByCorpsMember,
  updateCommandantComment,
} from "./queries/comments";
import { updateCorpsMember } from "./queries/corps-members";
import { createAuditLog } from "./queries/audit-logs";

export const commentsRouter = createRouter({
  listByCorpsMember: anyStaffQuery
    .input(z.object({ corpsMemberId: z.string() }))
    .query(async ({ input }) => {
      return getCommentsByCorpsMember(input.corpsMemberId);
    }),

  listBySoldier: soldierQuery.query(async ({ ctx }) => {
    return getCommentsBySoldier(ctx.user.id);
  }),

  submitSoldierComment: soldierQuery
    .input(
      z.object({
        corpsMemberId: z.string(),
        comment: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await getCommentByCorpsMemberAndSoldier(input.corpsMemberId, ctx.user.id);

      if (existing) {
        await updateComment(existing.id, { comment: input.comment });
      } else {
        await createComment({
          corpsMemberId: input.corpsMemberId,
          soldierId: ctx.user.id,
          comment: input.comment,
        });
        await updateCorpsMember(input.corpsMemberId, { hasSoldierComment: true });
      }

      await createAuditLog({
        userId: ctx.user.id,
        action: "SUBMIT_SOLDIER_COMMENT",
        entityType: "comment",
        entityId: input.corpsMemberId,
        details: `Submitted soldier comment for corps member ${input.corpsMemberId}`,
      });

      return { success: true };
    }),

  submitCommandantComment: campCommandantQuery
    .input(
      z.object({
        corpsMemberId: z.string(),
        comment: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await getCommandantCommentByCorpsMember(input.corpsMemberId);

      if (existing) {
        await updateCommandantComment(existing.id, { comment: input.comment });
      } else {
        await createCommandantComment({
          corpsMemberId: input.corpsMemberId,
          comment: input.comment,
        });
        await updateCorpsMember(input.corpsMemberId, { hasCommandantComment: true });
      }

      await createAuditLog({
        userId: ctx.user.id,
        action: "SUBMIT_COMMANDANT_COMMENT",
        entityType: "commandant_comment",
        entityId: input.corpsMemberId,
        details: `Submitted commandant comment for corps member ${input.corpsMemberId}`,
      });

      return { success: true };
    }),

  getCommandantComment: anyStaffQuery
    .input(z.object({ corpsMemberId: z.string() }))
    .query(async ({ input }) => {
      return getCommandantCommentByCorpsMember(input.corpsMemberId);
    }),
});
