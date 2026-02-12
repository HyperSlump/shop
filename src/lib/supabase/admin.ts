import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Only use this client on the server as it has full access to your database
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
