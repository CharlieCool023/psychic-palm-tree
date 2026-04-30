import { createClient } from "@supabase/supabase-js";


import { env } from "./env";

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;
const supabaseServiceKey = env.supabaseServiceRoleKey;

// Supabase client for user operations (read-only mostly)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Supabase client with service role (admin operations, migrations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
