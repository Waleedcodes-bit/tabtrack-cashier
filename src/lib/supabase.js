import { createClient } from '@supabase/supabase-js'

const getStorage = () => {
  try {
    return localStorage.getItem('navoq_remember_me') === 'true'
      ? localStorage
      : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: getStorage(),
      persistSession: true,
    },
  }
);