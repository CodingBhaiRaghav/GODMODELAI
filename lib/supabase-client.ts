import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getOrCreateSessionId(): Promise<string> {
  let sessionId = localStorage.getItem('app_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('app_session_id', sessionId)
  }
  return sessionId
}

export async function getApiKeys(sessionId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('groq_api_key, google_api_key')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching API keys:', error)
    return { groq_api_key: null, google_api_key: null }
  }

  return data || { groq_api_key: null, google_api_key: null }
}

export async function saveApiKeys(
  sessionId: string,
  groqKey: string | null,
  googleKey: string | null
) {
  const { data: existing } = await supabase
    .from('api_keys')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('api_keys')
      .update({
        groq_api_key: groqKey,
        google_api_key: googleKey,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error updating API keys:', error)
      throw error
    }
  } else {
    const { error } = await supabase
      .from('api_keys')
      .insert({
        session_id: sessionId,
        groq_api_key: groqKey,
        google_api_key: googleKey,
      })

    if (error) {
      console.error('Error inserting API keys:', error)
      throw error
    }
  }
}
