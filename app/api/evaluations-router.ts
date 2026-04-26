import { z } from "zod";
import { createRouter, platoonInstructorQuery, manOWarQuery, anyStaffQuery } from "./middleware";
import {
  createEvaluation,
  getEvaluationByCorpsMemberAndRole,
  getEvaluationsByCorpsMember,
  getEvaluationsByEvaluator,
  updateEvaluation,
} from "./queries/evaluations";
import { updateCorpsMember } from "./queries/corps-members";
import { createAuditLog } from "./queries/audit-logs";

const scoreSchema = z.number().min(2).max(10).step(2);

const evaluationScores = z.object({
  corpsMemberId: z.string(),
  leadershipInitiative: scoreSchema,
  professionalBearing: scoreSchema,
  physicalFitness: scoreSchema,
  communicationSkills: scoreSchema,
  technicalCompetence: scoreSchema,
  teamworkCooperation: scoreSchema,
  reliabilityDependability: scoreSchema,
  respectDignityRights: scoreSchema,
});

function calcAverage(input: Omit<z.infer<typeof evaluationScores>, "corpsMemberId">): number {
  return (
    input.leadershipInitiative +
    input.professionalBearing +
    input.physicalFitness +
    input.communicationSkills +
    input.technicalCompetence +
    input.teamworkCooperation +
    input.reliabilityDependability +
    input.respectDignityRights
  ) / 8;
}

export const evaluationsRouter = createRouter({
  listByCorpsMember: anyStaffQuery
    .input(z.object({ corpsMemberId: z.string() }))
    .query(async ({ input }) => {
      return getEvaluationsByCorpsMember(input.corpsMemberId);
    }),

  listByEvaluator: anyStaffQuery.query(async ({ ctx }) => {
    return getEvaluationsByEvaluator(ctx.user.id);
  }),

  getByCorpsMemberAndRole: anyStaffQuery
    .input(
      z.object({
        corpsMemberId: z.string(),
        evaluatorRole: z.enum(["platoon_instructor", "man_o_war_instructor"]),
      })
    )
    .query(async ({ input }) => {
      return getEvaluationByCorpsMemberAndRole(input.corpsMemberId, input.evaluatorRole);
    }),

  submitPlatoonEvaluation: platoonInstructorQuery
    .input(evaluationScores)
    .mutation(async ({ input, ctx }) => {
      const overallAverage = calcAverage(input);
      const existing = await getEvaluationByCorpsMemberAndRole(input.corpsMemberId, "platoon_instructor");

      if (existing) {
        await updateEvaluation(existing.id, { ...input, overallAverage });
      } else {
        await createEvaluation({
          ...input,
          evaluatorId: ctx.user.id,
          evaluatorRole: "platoon_instructor",
          overallAverage,
        });
        await updateCorpsMember(input.corpsMemberId, { isEvaluatedByPlatoon: true });
      }

      await createAuditLog({
        userId: ctx.user.id,
        action: "SUBMIT_PLATOON_EVALUATION",
        entityType: "evaluation",
        entityId: input.corpsMemberId,
        details: `Submitted platoon evaluation for corps member ${input.corpsMemberId}`,
      });

      return { success: true };
    }),

  submitManOWarEvaluation: manOWarQuery
    .input(evaluationScores)
    .mutation(async ({ input, ctx }) => {
      const overallAverage = calcAverage(input);
      const existing = await getEvaluationByCorpsMemberAndRole(input.corpsMemberId, "man_o_war_instructor");

      if (existing) {
        await updateEvaluation(existing.id, { ...input, overallAverage });
      } else {
        await createEvaluation({
          ...input,
          evaluatorId: ctx.user.id,
          evaluatorRole: "man_o_war_instructor",
          overallAverage,
        });
        await updateCorpsMember(input.corpsMemberId, { isEvaluatedByManOWar: true });
      }

      await createAuditLog({
        userId: ctx.user.id,
        action: "SUBMIT_MAN_O_WAR_EVALUATION",
        entityType: "evaluation",
        entityId: input.corpsMemberId,
        details: `Submitted Man O'War evaluation for corps member ${input.corpsMemberId}`,
      });

      return { success: true };
    }),
});
