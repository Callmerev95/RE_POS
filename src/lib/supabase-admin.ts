import { createClient } from "@supabase/supabase-js";

// Server-side Supabase admin client. Requires these env vars to be set:
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role key)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// DEBUGGING:
console.log("DEBUG SUPABASE URL:", supabaseUrl);
console.log("DEBUG SUPABASE KEY:", supabaseServiceKey ? "Ada/Terbaca" : "KOSONG/UNDEFINED");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
