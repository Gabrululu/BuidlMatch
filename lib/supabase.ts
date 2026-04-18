import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public read-only client (safe to use in browser)
export const supabase = createClient(url, anonKey);

// Server-only client with elevated privileges (API routes only)
export const supabaseAdmin = createClient(url, serviceKey);

export type Builder = {
  fid: number;
  username: string;
  bio: string;
  skills: string[];
  wallet: string;
  avatar_url: string | null;
  registered_at: string;
  active: boolean;
};

export type Project = {
  id: number;
  owner_fid: number;
  title: string;
  plan_json: Record<string, unknown>;
  metadata_uri: string | null;
  tx_hash: string | null;
  published_at: string;
};
