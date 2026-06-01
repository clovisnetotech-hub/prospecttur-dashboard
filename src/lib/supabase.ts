import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Lead = {
	id: number;
	razao_social: string;
	cnae: string;
	instagram: string | null;
	lead_score: number;
	justificativa_ia: string | null;
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
	if (client) return client;

	const url = import.meta.env.PUBLIC_SUPABASE_URL;
	const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !key) return null;

	client = createClient(url, key);
	return client;
}
