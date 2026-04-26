import { z } from "zod";
import { createRouter, publicQuery, campCommandantQuery, anyStaffQuery } from "./middleware";
import {
  getAllBatches,
  getActiveBatch,
  getBatchById,
  createBatch,
  updateBatch,
  deactivateBatch,
  activateBatch,
} from "./queries/batches";
import { createAuditLog } from "./queries/audit-logs";

export const batchesRouter = createRouter({
  list: anyStaffQuery.query(async () => {
    return getAllBatches();
  }),

  getActive: publicQuery.query(async () => {
    return getActiveBatch();
  }),

  getById: anyStaffQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const batch = await getBatchById(input.id);
      if (!batch) throw new Error("Batch not found");
      return batch;
    }),

  create: campCommandantQuery
    .input(
      z.object({
        name: z.string().min(1),
        year: z.number().min(2020).max(2100),
        state: z.enum(["ondo", "lagos"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const batchId = await createBatch({
        name: input.name,
        year: input.year,
        state: input.state,
        description: input.description,
        isActive: false,
      });

      await createAuditLog({
        userId: ctx.user.id,
        action: "CREATE_BATCH",
        entityType: "batch",
        entityId: batchId,
        details: `Created batch ${input.name}`,
      });

      return { success: true, id: batchId };
    }),

  update: campCommandantQuery
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        year: z.number().optional(),
        state: z.enum(["ondo", "lagos"]).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateBatch(id, data);

      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_BATCH",
        entityType: "batch",
        entityId: id,
        details: `Updated batch ${id}`,
      });

      return { success: true };
    }),

  activate: campCommandantQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await activateBatch(input.id);

      await createAuditLog({
        userId: ctx.user.id,
        action: "ACTIVATE_BATCH",
        entityType: "batch",
        entityId: input.id,
        details: `Activated batch ${input.id}`,
      });

      return { success: true };
    }),

  deactivate: campCommandantQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deactivateBatch(input.id);

      await createAuditLog({
        userId: ctx.user.id,
        action: "DEACTIVATE_BATCH",
        entityType: "batch",
        entityId: input.id,
        details: `Deactivated batch ${input.id}`,
      });

      return { success: true };
    }),
});
