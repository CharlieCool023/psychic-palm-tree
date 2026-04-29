import { z } from "zod";
import { createRouter, publicQuery, anyStaffQuery } from "./middleware";
import {
  createCorpsMember,
  getCorpsMemberById,
  getCorpsMemberByStateCode,
  getAllCorpsMembers,
  getCorpsMembersByPlatoon,
  searchCorpsMembers,
  updateCorpsMember,
  deleteCorpsMember,
  addHigherInstitution,
  getHigherInstitutionsByCorpsMember,
} from "./queries/corps-members";
import { getActiveBatch } from "./queries/batches";
import { createAuditLog } from "./queries/audit-logs";

export const corpsMembersRouter = createRouter({
  list: anyStaffQuery
    .input(
      z.object({
        batchId: z.string().optional(),
        platoon: z.number().optional(),
        search: z.string().optional(),
        evaluatedBy: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      if (input?.search) {
        return searchCorpsMembers(input.search, input.batchId, input.platoon, input.evaluatedBy);
      }
      if (input?.platoon) {
        return getCorpsMembersByPlatoon(input.platoon, input.batchId);
      }
      return getAllCorpsMembers(input?.batchId);
    }),

  getById: anyStaffQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const member = await getCorpsMemberById(input.id);
      if (!member) throw new Error("Corps member not found");
      const institutions = await getHigherInstitutionsByCorpsMember(input.id);
      return { ...member, higherInstitutions: institutions };
    }),

  getByStateCode: anyStaffQuery
    .input(z.object({ stateCode: z.string() }))
    .query(async ({ input }) => {
      const member = await getCorpsMemberByStateCode(input.stateCode);
      if (!member) throw new Error("Corps member not found");
      return member;
    }),

  register: publicQuery
    .input(
      z.object({
        passportPhoto: z.string().optional(),
        surname: z.string().min(1),
        otherNames: z.string().min(1),
        formerName: z.string().optional(),
        stateCode: z.string().regex(/^(OD|LA)\/\d{2}C\/\d{4}$/),
        callUpNumber: z.string().regex(/^NYSC\/\w+\/\d{4}\/\d+$/),
        phoneNumber: z.string().regex(/^(\+234|0)\d{10}$/),
        stateOfOrigin: z.string().min(1),
        stateOfDeployment: z.enum(["ondo", "lagos"]),
        qualification: z.string().min(1),
        areaOfSpecialization: z.string().min(1),
        platoon: z.number().min(1).max(10),
        campExperienceComment: z.string().optional(),
        higherInstitutions: z.array(
          z.object({
            name: z.string().min(1),
            startDate: z.string(),
            endDate: z.string(),
          })
        ).min(1),
      })
    )
    .mutation(async ({ input }) => {
      const activeBatch = await getActiveBatch();
      if (!activeBatch) {
        throw new Error("No active batch found. Registration is closed.");
      }

      const existing = await getCorpsMemberByStateCode(input.stateCode);
      if (existing) {
        throw new Error("A corps member with this state code already exists");
      }

      const corpsMemberId = await createCorpsMember({
        batchId: activeBatch.id,
        passportPhoto: input.passportPhoto,
        surname: input.surname.toUpperCase(),
        otherNames: input.otherNames.toUpperCase(),
        formerName: input.formerName ? input.formerName.toUpperCase() : undefined,
        stateCode: input.stateCode.toUpperCase(),
        callUpNumber: input.callUpNumber.toUpperCase(),
        phoneNumber: input.phoneNumber,
        stateOfOrigin: input.stateOfOrigin,
        stateOfDeployment: input.stateOfDeployment,
        qualification: input.qualification,
        areaOfSpecialization: input.areaOfSpecialization,
        platoon: input.platoon,
        campExperienceComment: input.campExperienceComment,
        isEvaluatedByPlatoon: false,
        isEvaluatedByManOWar: false,
        hasSoldierComment: false,
        hasCommandantComment: false,
      });

      for (const inst of input.higherInstitutions) {
        await addHigherInstitution({
          corpsMemberId,
          name: inst.name,
          startDate: new Date(inst.startDate),
          endDate: new Date(inst.endDate),
        });
      }

      await createAuditLog({
        userId: undefined,
        action: "REGISTER_CORPS_MEMBER",
        entityType: "corps_member",
        entityId: corpsMemberId,
        details: `Registered corps member ${input.surname} ${input.otherNames}`,
      });

      return { success: true, id: corpsMemberId };
    }),

  update: anyStaffQuery
    .input(
      z.object({
        id: z.string(),
        data: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateCorpsMember(input.id, input.data);

      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_CORPS_MEMBER",
        entityType: "corps_member",
        entityId: input.id,
        details: `Updated corps member ${input.id}`,
      });

      return { success: true };
    }),

  delete: anyStaffQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deleteCorpsMember(input.id);

      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE_CORPS_MEMBER",
        entityType: "corps_member",
        entityId: input.id,
        details: `Deleted corps member ${input.id}`,
      });

      return { success: true };
    }),
});
