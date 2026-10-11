// Supabase connection for cloud sync.
// Paste your project's values from Supabase → Project Settings → API (or "Connect").
// The anon / publishable key is meant to be public: row-level security in supabase/schema.sql
// makes sure each signed-in person can only read and write their own list.
// Leave both empty to run without sign-in (data stays on the device).
window.NYC_CONFIG = {
  supabaseUrl: 'https://octgaltlmqwcqewbxocb.supabase.co',
  supabaseAnonKey: 'sb_publishable_aP3g7MgD21wvpdskSfHU4A_WCFAC1Tg'
};
