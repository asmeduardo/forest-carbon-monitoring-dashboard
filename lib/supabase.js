// lib/supabase.js - Versão segura
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL e chave anônima são necessários! Configure suas variáveis de ambiente."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
