import { neon } from "@neondatabase/serverless";

// Created inside each request handler so Next.js build doesn't try to
// initialize the connection without DATABASE_URL present.
export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

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
