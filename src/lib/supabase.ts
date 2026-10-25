import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface DatabaseStreamingServer {
  id: string
  name: string
  display_name: string
  badge: string
  quality: '4K' | '1080p' | 'HD'
  speed: 'Ultra' | 'Fast' | 'Stable'
  description: string
  movie_url_pattern: string
  tv_url_pattern: string
  status: 'pending' | 'approved' | 'rejected' | 'offline'
  submitter_name: string
  submitter_note?: string
  latency_ms?: number
  last_checked_at?: string
  created_at: string
}

export type ServerSubmissionInput = Omit<
  DatabaseStreamingServer,
  'id' | 'status' | 'latency_ms' | 'last_checked_at' | 'created_at'
>

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Checks if Supabase credentials are provided in the environment.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
)

/**
 * Singleton Supabase client instance.
 * Returns null if environment variables are not yet configured.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Fetches all globally approved streaming servers from Supabase.
 */
export async function fetchApprovedServers(): Promise<DatabaseStreamingServer[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('streaming_servers')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Failed to fetch approved streaming servers from Supabase:', error.message)
    return []
  }

  return (data as DatabaseStreamingServer[]) || []
}

/**
 * Submits a new streaming server to the community moderation queue.
 */
export async function submitServerForReview(
  input: ServerSubmissionInput
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error:
        'Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    }
  }

  const { error } = await supabase.from('streaming_servers').insert({
    name: input.name.trim(),
    display_name: input.display_name.trim() || input.name.trim(),
    badge: input.badge || `${input.quality} • ${input.speed}`,
    quality: input.quality,
    speed: input.speed,
    description: input.description?.trim() || '',
    movie_url_pattern: input.movie_url_pattern.trim(),
    tv_url_pattern: input.tv_url_pattern.trim(),
    status: 'pending',
    submitter_name: input.submitter_name?.trim() || 'Anonymous',
    submitter_note: input.submitter_note?.trim() || '',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
