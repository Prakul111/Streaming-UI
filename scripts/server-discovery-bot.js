/**
 * Streaming Server Discovery & Health Probe Bot
 *
 * Capabilities:
 * 1. Probes candidate streaming servers for HTTP 200 and X-Frame-Options compatibility.
 * 2. Measures round-trip latency and classifies speed (Ultra, Fast, Stable).
 * 3. Connects to Supabase (if configured) to:
 *    - Auto-approve working servers in the 'pending' queue.
 *    - Monitor existing 'approved' servers and flag offline ones.
 * 4. Runs standalone via: node scripts/server-discovery-bot.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const TEST_TMDB_ID = 550 // Fight Club
const PROBE_TIMEOUT_MS = 6000

// Curated seed sources and known embed providers to scan for new mirrors
const DISCOVERY_CANDIDATES = [
  {
    name: 'AutoEmbed Mirror',
    movie_url_pattern: 'https://player.autoembed.app/embed/movie/{tmdbId}',
    tv_url_pattern: 'https://player.autoembed.app/embed/tv/{tmdbId}/{season}/{episode}',
    quality: '4K',
  },
  {
    name: 'CineSRC Fast',
    movie_url_pattern: 'https://cinesrc.st/embed/movie/{tmdbId}',
    tv_url_pattern: 'https://cinesrc.st/embed/tv/{tmdbId}?s={season}&e={episode}',
    quality: '1080p',
  },
  {
    name: 'VidSrc Me Mirror',
    movie_url_pattern: 'https://vidsrcme.ru/embed/movie/{tmdbId}',
    tv_url_pattern: 'https://vidsrcme.ru/embed/tv/{tmdbId}/{season}/{episode}',
    quality: '1080p',
  },
  {
    name: 'VidSrc Embed',
    movie_url_pattern: 'https://vidsrc-embed.su/embed/movie/{tmdbId}',
    tv_url_pattern: 'https://vidsrc-embed.su/embed/tv/{tmdbId}/{season}/{episode}',
    quality: '1080p',
  },
  {
    name: 'SuperEmbed Stream',
    movie_url_pattern: 'https://www.superembed.stream/embed/movie/{tmdbId}',
    tv_url_pattern: 'https://www.superembed.stream/embed/tv/{tmdbId}/{season}/{episode}',
    quality: '1080p',
  },
]

/**
 * Tests an embed URL pattern for frame-embeddability and network latency.
 */
async function probeServerUrl(urlPattern) {
  const testUrl = urlPattern.replace(/\{tmdbId\}/gi, String(TEST_TMDB_ID))

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  const startTime = Date.now()

  try {
    const res = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const latency = Date.now() - startTime

    const xFrameOptions = (res.headers.get('x-frame-options') || '').toUpperCase()
    const isFrameBlocked = xFrameOptions.includes('DENY') || xFrameOptions.includes('SAMEORIGIN')

    const isSuccess = res.status >= 200 && res.status < 400 && !isFrameBlocked

    let speed = 'Stable'
    if (latency < 400) speed = 'Ultra'
    else if (latency < 900) speed = 'Fast'

    return {
      success: isSuccess,
      status: res.status,
      latency,
      speed,
      xFrameOptions: xFrameOptions || 'None (Embeddable)',
      testUrl,
    }
  } catch (err) {
    clearTimeout(timeoutId)
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Probe timed out (>6s)' : err.message,
      latency: Date.now() - startTime,
      testUrl,
    }
  }
}

async function runBot() {
  console.log('===========================================================')
  console.log('🤖 STREAMING SERVER DISCOVERY & HEALTH PROBE')
  console.log('===========================================================')
  console.log(`Test Movie TMDB ID: ${TEST_TMDB_ID} (Fight Club)`)
  console.log(`Current Time: ${new Date().toISOString()}\n`)

  const supabase =
    SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

  if (supabase) {
    console.log('Connected to Supabase. Processing community submissions...\n')

    // 1. Process Pending Submissions
    const { data: pendingServers, error: pendingErr } = await supabase
      .from('streaming_servers')
      .select('*')
      .eq('status', 'pending')

    if (pendingErr) {
      console.error('Error fetching pending servers:', pendingErr.message)
    } else if (pendingServers && pendingServers.length > 0) {
      console.log(`Found ${pendingServers.length} pending server(s) to verify:`)

      for (const server of pendingServers) {
        console.log(`\nTesting pending server: "${server.name}"`)
        const probeResult = await probeServerUrl(server.movie_url_pattern)

        if (probeResult.success) {
          console.log(
            `  ✅ Server PASSED probe (${probeResult.latency}ms, Speed: ${probeResult.speed}). Approving globally!`
          )
          await supabase
            .from('streaming_servers')
            .update({
              status: 'approved',
              speed: probeResult.speed,
              latency_ms: probeResult.latency,
              last_checked_at: new Date().toISOString(),
            })
            .eq('id', server.id)
        } else {
          console.log(
            `  ❌ Server FAILED probe: ${probeResult.error || `HTTP ${probeResult.status}`}. Rejecting.`
          )
          await supabase
            .from('streaming_servers')
            .update({
              status: 'rejected',
              last_checked_at: new Date().toISOString(),
            })
            .eq('id', server.id)
        }
      }
    } else {
      console.log('No pending community servers awaiting verification.')
    }

    // 2. Health-Check Approved Servers (keep list fresh)
    const { data: approvedServers } = await supabase
      .from('streaming_servers')
      .select('*')
      .eq('status', 'approved')

    if (approvedServers && approvedServers.length > 0) {
      console.log(`\nHealth checking ${approvedServers.length} approved server(s)...`)
      for (const server of approvedServers) {
        const probeResult = await probeServerUrl(server.movie_url_pattern)
        if (!probeResult.success) {
          console.log(`  ⚠️ Approved server "${server.name}" is DOWN. Marking offline.`)
          await supabase
            .from('streaming_servers')
            .update({
              status: 'offline',
              last_checked_at: new Date().toISOString(),
            })
            .eq('id', server.id)
        } else {
          console.log(`  ✓ "${server.name}" OK (${probeResult.latency}ms)`)
          await supabase
            .from('streaming_servers')
            .update({
              latency_ms: probeResult.latency,
              speed: probeResult.speed,
              last_checked_at: new Date().toISOString(),
            })
            .eq('id', server.id)
        }
      }
    }
  } else {
    console.log('Note: Running in standalone probe mode (no Supabase keys set).')
    console.log('Testing seed candidate discovery mirrors:\n')

    for (const candidate of DISCOVERY_CANDIDATES) {
      process.stdout.write(`Probing "${candidate.name}"... `)
      const result = await probeServerUrl(candidate.movie_url_pattern)

      if (result.success) {
        console.log(`✅ ONLINE | Latency: ${result.latency}ms | Speed: ${result.speed}`)
      } else {
        console.log(`❌ FAILED (${result.error || `HTTP ${result.status}`})`)
      }
    }
  }

  console.log('\n===========================================================')
  console.log('Probe run complete!')
  console.log('===========================================================')
}

runBot().catch((err) => {
  console.error('Bot execution failed:', err)
  process.exit(1)
})
