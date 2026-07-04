
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Protocol Node
 * URL: https://rtqesocsexlyzwwlydlj.supabase.co
 * Service: Registry & Mirror Persistence
 */
const supabaseUrl = 'https://rtqesocsexlyzwwlydlj.supabase.co';
const supabaseKey = 'sb_publishable_W8D6ZL0sPmqhxxMMqknNNQ_HJFPntS2';

export const supabase = createClient(supabaseUrl, supabaseKey);
