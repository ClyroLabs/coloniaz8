import { createClient } from '@supabase/supabase-js';

import { environment } from '../environments/environment';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Para usar tipos gerados pelo Supabase CLI:
// 1. Adicione '@supabase/cli' como dev dependency.
// 2. Execute 'supabase gen types typescript --linked --quiet > src/lib/database.types.ts'
// 3. Descomente a linha abaixo e ajuste o path se necessário:
// import { Database } from './database.types';
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);