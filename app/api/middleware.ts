import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(...roles: string[]) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("super_admin"));
export const stateCommandantQuery = authedQuery.use(requireRole("super_admin", "state_commandant"));
export const campCommandantQuery = authedQuery.use(requireRole("super_admin", "camp_commandant"));
export const platoonInstructorQuery = authedQuery.use(requireRole("platoon_instructor"));
export const manOWarQuery = authedQuery.use(requireRole("man_o_war_instructor"));
export const soldierQuery = authedQuery.use(requireRole("soldier"));
export const anyStaffQuery = authedQuery.use(requireRole(
  "super_admin",
  "state_commandant",
  "camp_commandant",
  "platoon_instructor",
  "man_o_war_instructor",
  "soldier"
));
