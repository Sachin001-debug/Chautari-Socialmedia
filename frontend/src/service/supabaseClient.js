import { createClient } from '@supabase/supabase-js'

// Publishable key only. The secret key bypasses RLS and must stay on the server;
// Vite inlines any VITE_* value into the bundle, so it ships to the browser.
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default supabase
