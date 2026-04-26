export const Session = {
  cookieName: "nysc_sid",
  maxAgeMs: 7 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;

export const RoleDashboardPaths: Record<string, string> = {
  super_admin: "/dashboard/super-admin",
  state_commandant: "/dashboard/state-commandant",
  camp_commandant: "/dashboard/commandant",
  platoon_instructor: "/dashboard/instructor",
  man_o_war_instructor: "/dashboard/man-o-war",
  soldier: "/dashboard/soldier",
};

export const RoleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  state_commandant: "State Commandant",
  camp_commandant: "Camp Commandant",
  platoon_instructor: "Platoon Instructor",
  man_o_war_instructor: "Man O'War Instructor",
  soldier: "Soldier",
};
