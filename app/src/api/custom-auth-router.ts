import { z } from "zod";
import bcrypt from "bcryptjs";
import * as cookie from "cookie";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { CustomSession } from "./custom-auth";
import { getSessionCookieOptions } from "./lib/cookies";
import { signCustomSessionToken } from "./lib/custom-session";
import { findUserByUsername, findUserById, updateUser } from "./queries/users";
import { createAuditLog } from "./queries/audit-logs";

export const customAuthRouter = createRouter({
  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        expectedRole: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByUsername(input.username.toLowerCase());
      if (!user || !user.isActive || user.isDeleted) {
        throw new Error("Invalid username or password");
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new Error("Invalid username or password");
      }

      if (input.expectedRole && user.role !== input.expectedRole) {
        throw new Error("Invalid role for this login page");
      }

      await updateUser(user.id, { lastSignInAt: new Date() });

      const token = await signCustomSessionToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(CustomSession.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: CustomSession.maxAgeMs / 1000,
        })
      );

      await createAuditLog({
        userId: user.id,
        action: "LOGIN",
        entityType: "user",
        entityId: user.id,
        details: `User ${user.username} logged in as ${user.role}`,
      });

      return {
        success: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          state: user.state,
          assignedPlatoon: user.assignedPlatoon,
          assignedBatchId: user.assignedBatchId,
        },
      };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(CustomSession.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      })
    );

    await createAuditLog({
      userId: ctx.user.id,
      action: "LOGOUT",
      entityType: "user",
      entityId: ctx.user.id,
      details: `User ${ctx.user.username} logged out`,
    });

    return { success: true };
  }),

  me: authedQuery.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      fullName: ctx.user.fullName,
      username: ctx.user.username,
      role: ctx.user.role,
      state: ctx.user.state,
      assignedPlatoon: ctx.user.assignedPlatoon,
      assignedBatchId: ctx.user.assignedBatchId,
    };
  }),

  changePassword: authedQuery
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await findUserById(ctx.user.id);
      if (!user) {
        throw new Error("User not found");
      }

      const valid = await bcrypt.compare(input.currentPassword, user.password);
      if (!valid) {
        throw new Error("Current password is incorrect");
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);
      await updateUser(user.id, { password: hashedPassword });

      return { success: true };
    }),
});
