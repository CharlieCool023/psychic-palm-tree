import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { createRouter, adminQuery, campCommandantQuery, anyStaffQuery } from "./middleware";
import {
  findUserById,
  findUserByUsername,
  getAllUsers,
  getUsersByRole,
  searchUsers,
  updateUser,
  deactivateUser,
  softDeleteUser,
} from "./queries/users";
import { createAuditLog } from "./queries/audit-logs";
import { getDb } from "./queries/connection";

export const usersRouter = createRouter({
  list: anyStaffQuery.query(async () => {
    return getAllUsers();
  }),

  listByRole: anyStaffQuery
    .input(z.object({ role: z.string() }))
    .query(async ({ input }) => {
      return getUsersByRole(input.role);
    }),

  search: anyStaffQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return searchUsers(input.search || "", input.role);
    }),

  getById: anyStaffQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await findUserById(input.id);
      if (!user) throw new Error("User not found");
      return user;
    }),

  create: campCommandantQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        username: z.string().min(3),
        password: z.string().min(6),
        role: z.enum([
          "camp_commandant",
          "platoon_instructor",
          "man_o_war_instructor",
          "soldier",
        ]),
        state: z.string().optional(),
        assignedPlatoon: z.number().min(1).max(10).optional(),
        assignedBatchId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByUsername(input.username.toLowerCase());
      if (existing) {
        throw new Error("Username already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);
      const userId = nanoid();
      await getDb().collection("users").doc(userId).set({
        id: userId,
        fullName: input.fullName,
        username: input.username.toLowerCase(),
        password: hashedPassword,
        role: input.role,
        state: input.state ?? null,
        assignedPlatoon: input.assignedPlatoon ?? null,
        assignedBatchId: input.assignedBatchId ?? null,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createAuditLog({
        userId: ctx.user.id,
        action: "CREATE_USER",
        entityType: "user",
        entityId: userId,
        details: `Created user ${input.username} with role ${input.role}`,
      });

      return { success: true, id: userId };
    }),

  createAdmin: adminQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        username: z.string().min(3),
        password: z.string().min(6),
        role: z.enum(["super_admin", "state_commandant", "camp_commandant"]),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByUsername(input.username.toLowerCase());
      if (existing) {
        throw new Error("Username already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);
      const userId = nanoid();
      await getDb().collection("users").doc(userId).set({
        id: userId,
        fullName: input.fullName,
        username: input.username.toLowerCase(),
        password: hashedPassword,
        role: input.role,
        state: input.state ?? null,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createAuditLog({
        userId: ctx.user.id,
        action: "CREATE_ADMIN_USER",
        entityType: "user",
        entityId: userId,
        details: `Created admin user ${input.username} with role ${input.role}`,
      });

      return { success: true, id: userId };
    }),

  update: campCommandantQuery
    .input(
      z.object({
        id: z.string(),
        fullName: z.string().min(1).optional(),
        username: z.string().min(3).optional(),
        role: z.enum(["super_admin", "state_commandant", "camp_commandant", "platoon_instructor", "man_o_war_instructor", "soldier"]).optional(),
        state: z.string().optional(),
        assignedPlatoon: z.number().min(1).max(10).optional(),
        assignedBatchId: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateUser(id, data);

      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_USER",
        entityType: "user",
        entityId: id,
        details: `Updated user ${id}`,
      });

      return { success: true };
    }),

  deactivate: campCommandantQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deactivateUser(input.id);

      await createAuditLog({
        userId: ctx.user.id,
        action: "DEACTIVATE_USER",
        entityType: "user",
        entityId: input.id,
        details: `Deactivated user ${input.id}`,
      });

      return { success: true };
    }),

  delete: campCommandantQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await softDeleteUser(input.id);

      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE_USER",
        entityType: "user",
        entityId: input.id,
        details: `Deleted user ${input.id}`,
      });

      return { success: true };
    }),
});
