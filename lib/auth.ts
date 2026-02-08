import { createClient } from '@/lib/supabase/server'

/**
 * Get the current authenticated user (server-side)
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current session (server-side)
 */
export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getUser()
  return !!user
}
