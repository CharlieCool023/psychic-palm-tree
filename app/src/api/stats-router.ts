import { z } from "zod";
import { createRouter, anyStaffQuery } from "./middleware";
import {
  getDashboardStats,
  getBatchStats,
  getPlatoonStats,
} from "./queries/stats";

export const statsRouter = createRouter({
  dashboard: anyStaffQuery.query(async () => {
    return getDashboardStats();
  }),

  batch: anyStaffQuery
    .input(z.object({ batchId: z.string() }))
    .query(async ({ input }) => {
      return getBatchStats(input.batchId);
    }),

  platoon: anyStaffQuery
    .input(
      z.object({
        platoon: z.number(),
        batchId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getPlatoonStats(input.platoon, input.batchId);
    }),
});
