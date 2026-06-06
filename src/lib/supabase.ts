import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface Lead {
	id: number;
	razao_social: string;
	cnae: string;
	instagram: string | null;
	lead_score: number;
	justificativa_ia: string | null;
	telefone?: string | null;
	email?: string | null;
	created_at?: string | null;
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const LEADS_QUERY =
	'id, razao_social, cnae, instagram, lead_score, justificativa_ia, telefone, email, created_at';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
	supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabase(): SupabaseClient | null {
	return supabase;
}
