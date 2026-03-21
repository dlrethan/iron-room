import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uztmqmblzmqpwrwqqnml.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dG1xbWJsem1xcHdyd3Fxbm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjY0MjMsImV4cCI6MjA4OTcwMjQyM30.GQKlMyBJRVK-vJRLwpSE528Im95yMUqm_fFS-C9g1PI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
