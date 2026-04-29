import { supabase } from "../lib/supabase";

export function getDb() {
  return supabase;
}
