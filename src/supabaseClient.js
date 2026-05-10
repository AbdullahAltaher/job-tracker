import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwjpxiktpkaeegpzhduj.supabase.co'
const supabaseKey = 'sb_publishable_mFlahM0hWD7VsXejpi9U0g_BtERUiGk'

export const supabase = createClient(supabaseUrl, supabaseKey)