import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('Supabase Key:', supabaseAnonKey ? 'Configurado' : 'NÃO CONFIGURADO');

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
	supabase = createClient(supabaseUrl, supabaseAnonKey);
	console.log('Supabase client criado com sucesso');
} else {
	console.error('Credenciais do Supabase não configuradas!');
}

export function getSupabase(): SupabaseClient | null {
	return supabase;
}