import { useState, useId } from 'react'
import {
  X,
  Server,
  Sparkles,
  Globe,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidUrlPattern, evaluateServerUrl, EMBED_TEST_FIXTURES } from '@/lib/server-url-parser'
import { submitServerForReview, isSupabaseConfigured } from '@/lib/supabase'
import { useStreamingServers } from '@/hooks/use-streaming-servers'

interface SubmitServerModalProps {
  isOpen: boolean
  onClose: () => void
  initialMoviePattern?: string
  initialTvPattern?: string
}

type SubmissionMode = 'global' | 'local'

export default function SubmitServerModal({
  isOpen,
  onClose,
  initialMoviePattern = '',
  initialTvPattern = '',
}: SubmitServerModalProps) {
  const modalId = useId()
  const { addLocalServer, refetchCommunityServers } = useStreamingServers()

  // Form State
  const [mode, setMode] = useState<SubmissionMode>('global')
  const [name, setName] = useState('')
  const [moviePattern, setMoviePattern] = useState(initialMoviePattern)
  const [tvPattern, setTvPattern] = useState(initialTvPattern)
  const [quality, setQuality] = useState<'4K' | '1080p' | 'HD'>('1080p')
  const [speed, setSpeed] = useState<'Ultra' | 'Fast' | 'Stable'>('Fast')
  const [description, setDescription] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitterNote, setSubmitterNote] = useState('')

  // Live Test Sandbox State
  const [testMediaType, setTestMediaType] = useState<'movie' | 'tv'>('movie')
  const [sandboxIframeKey, setSandboxIframeKey] = useState(0)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  // Pattern Validations
  const movieValidation = isValidUrlPattern(moviePattern)
  const tvValidation = isValidUrlPattern(tvPattern)
  const isFormValid =
    name.trim().length >= 2 &&
    movieValidation.valid &&
    tvValidation.valid

  // Evaluated Sandbox URL
  const evaluatedTestUrl = (() => {
    if (testMediaType === 'movie') {
      if (!moviePattern) return ''
      return evaluateServerUrl(moviePattern, EMBED_TEST_FIXTURES.movie)
    } else {
      if (!tvPattern) return ''
      return evaluateServerUrl(tvPattern, EMBED_TEST_FIXTURES.tv)
    }
  })()

  const handleCopyUrl = () => {
    if (!evaluatedTestUrl) return
    navigator.clipboard.writeText(evaluatedTestUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!isFormValid) {
      setErrorMessage('Please fill in all required fields with valid URL templates.')
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'local') {
        // Instant save to current browser localStorage
        addLocalServer({
          name: name.trim(),
          displayName: name.trim(),
          badge: `${quality} • Custom`,
          quality,
          speed,
          description: description.trim() || 'Custom user server',
          movie_url_pattern: moviePattern.trim(),
          tv_url_pattern: tvPattern.trim(),
        })

        setSuccessMessage('Server saved to your browser! It is now ready to use in your player.')
        setTimeout(() => {
          onClose()
          resetForm()
        }, 1800)
      } else {
        // Global community submission to Supabase
        const result = await submitServerForReview({
          name: name.trim(),
          display_name: name.trim(),
          badge: `${quality} • ${speed}`,
          quality,
          speed,
          description: description.trim() || 'Community submitted server',
          movie_url_pattern: moviePattern.trim(),
          tv_url_pattern: tvPattern.trim(),
          submitter_name: submitterName.trim() || 'Anonymous',
          submitter_note: submitterNote.trim(),
        })

        if (!result.success) {
          throw new Error(result.error || 'Failed to submit server.')
        }

        setSuccessMessage(
          'Server submitted successfully! Our automated health-check probe will test the server and approve it globally.'
        )
        refetchCommunityServers()
        setTimeout(() => {
          onClose()
          resetForm()
        }, 2200)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during submission.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setMoviePattern('')
    setTvPattern('')
    setDescription('')
    setSubmitterName('')
    setSubmitterNote('')
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0c0e18] border border-white/15 rounded-3xl shadow-[0_0_80px_rgba(168,85,247,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-b border-white/10 bg-[#101321] shrink-0 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Server className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 id={`${modalId}-title`} className="text-sm sm:text-base font-bold text-white truncate">
                  Add Streaming Server
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  Global & Local
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/50 line-clamp-1 sm:line-clamp-none">
                Share a new streaming API with the community or save it to your browser
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mode Selector Tabs (Global Community vs Instant Local) */}
        <div className="grid grid-cols-2 gap-2 p-2 px-3 sm:px-7 bg-[#080a12] border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setMode('global')}
            className={cn(
              'h-11 sm:h-10 flex items-center justify-center gap-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border',
              mode === 'global'
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
            )}
          >
            <Globe className="size-4 shrink-0" />
            <span className="sm:hidden">Community</span>
            <span className="hidden sm:inline">Submit to Community (Worldwide)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('local')}
            className={cn(
              'h-11 sm:h-10 flex items-center justify-center gap-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border',
              mode === 'local'
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
            )}
          >
            <Laptop className="size-4 shrink-0" />
            <span className="sm:hidden">My Browser</span>
            <span className="hidden sm:inline">Save to My Browser (Instant Local)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-5 sm:space-y-6 custom-scrollbar">
          {/* Mode Explainer Banner */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 flex items-start gap-3">
            <Sparkles className="size-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              {mode === 'global' ? (
                <>
                  <span className="font-bold text-purple-300">Community Submission: </span>
                  Submits the streaming server to the global verification database. Our automated health probe will check the stream status and distribute it to all visitors worldwide.
                  {!isSupabaseConfigured && (
                    <span className="block mt-1 text-amber-300 font-semibold">
                      Note: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect your database.
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="font-bold text-purple-300">Browser-Only Mode: </span>
                  Instantly saves this server to your current browser storage. It will be immediately available in your player dropdown without waiting for verification or requiring a database.
                </>
              )}
            </div>
          </div>

          {/* Success / Error Messages */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="submit-server-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Server Name & Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-white/90">
                  Server Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VidSrc Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Quality Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/90">Quality</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['4K', '1080p', 'HD'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={cn(
                        'h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer border select-none',
                        quality === q
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.35)]'
                          : 'bg-white/5 border-white/10 text-white/65 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/90">Speed Rating</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Ultra', 'Fast', 'Stable'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={cn(
                        'h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer border select-none',
                        speed === s
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.35)]'
                          : 'bg-white/5 border-white/10 text-white/65 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Movie Embed URL Pattern */}
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                  Movie Embed Pattern <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-purple-300 font-mono">
                  Placeholder: {'{tmdbId}'} or {'{imdbId}'}
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="https://example.com/embed/movie/{tmdbId}"
                value={moviePattern}
                onChange={(e) => setMoviePattern(e.target.value)}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-white font-mono text-xs placeholder:text-white/30 focus:outline-none transition-all',
                  moviePattern && !movieValidation.valid
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-white/10 focus:border-purple-500'
                )}
              />
              {moviePattern && !movieValidation.valid && (
                <p className="text-[11px] text-red-400">{movieValidation.error}</p>
              )}
            </div>

            {/* TV Embed URL Pattern */}
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <label className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                  TV Show Embed Pattern <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-purple-300 font-mono">
                  Placeholders: {'{tmdbId}'}, {'{season}'}, {'{episode}'}
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="https://example.com/embed/tv/{tmdbId}/{season}/{episode}"
                value={tvPattern}
                onChange={(e) => setTvPattern(e.target.value)}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-white font-mono text-xs placeholder:text-white/30 focus:outline-none transition-all',
                  tvPattern && !tvValidation.valid
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-white/10 focus:border-purple-500'
                )}
              />
              {tvPattern && !tvValidation.valid && (
                <p className="text-[11px] text-red-400">{tvValidation.error}</p>
              )}
            </div>

            {/* Optional Submitter Info (Global mode) */}
            {mode === 'global' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/90">
                    Your Name or Handle <span className="text-white/40 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex or @alex_streams"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/90">
                    Notes / Provider URL <span className="text-white/40 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Multi-subtitles, ad-free player"
                    value={submitterNote}
                    onChange={(e) => setSubmitterNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* Live Interactive Embed Test Sandbox                       */}
            {/* ========================================================= */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Play className="size-3.5 text-purple-400 fill-purple-400" />
                    Live Embed Sandbox
                  </span>
                  <span className="text-[10px] text-white/50">Test before saving</span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  {/* Test Media Switcher */}
                  <div className="flex rounded-lg bg-white/10 p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setTestMediaType('movie')}
                      className={cn(
                        'px-2.5 py-1 sm:py-0.5 rounded-md transition-all cursor-pointer select-none',
                        testMediaType === 'movie'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      )}
                    >
                      <span className="sm:hidden">Movie</span>
                      <span className="hidden sm:inline">Movie (Fight Club)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestMediaType('tv')}
                      className={cn(
                        'px-2.5 py-1 sm:py-0.5 rounded-md transition-all cursor-pointer select-none',
                        testMediaType === 'tv'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      )}
                    >
                      <span className="sm:hidden">TV</span>
                      <span className="hidden sm:inline">TV (Breaking Bad)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSandboxIframeKey((k) => k + 1)}
                    className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    title="Reload Sandbox Frame"
                  >
                    <RefreshCw className="size-3" />
                  </button>
                </div>
              </div>

              {/* Evaluated URL Display Bar */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/60 border border-white/10 mb-3 font-mono text-[11px] text-white/80">
                <div className="truncate flex-1">
                  <span className="text-purple-400 mr-1.5">Evaluated:</span>
                  <span className={evaluatedTestUrl ? 'text-white' : 'text-white/30 italic'}>
                    {evaluatedTestUrl || 'Enter URL pattern above to see preview'}
                  </span>
                </div>

                {evaluatedTestUrl && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="p-1 rounded text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    </button>
                    <a
                      href={evaluatedTestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Open in new tab"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Iframe Preview Box */}
              <div className="relative aspect-video w-full rounded-2xl bg-black/80 border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center">
                {evaluatedTestUrl ? (
                  <iframe
                    key={sandboxIframeKey}
                    src={evaluatedTestUrl}
                    title="Embed Sandbox Preview"
                    className="size-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="text-center p-6 text-white/40 space-y-2">
                    <Server className="size-8 mx-auto opacity-30" />
                    <p className="text-xs font-medium">No preview available.</p>
                    <p className="text-[11px] text-white/30">
                      Fill out the Movie & TV patterns above to load the live video player preview.
                    </p>
                  </div>
                )}
              </div>

              {/* Troubleshooting hint */}
              <div className="mt-2 text-[10px] text-white/40 flex items-center gap-1.5">
                <HelpCircle className="size-3 shrink-0" />
                <span>
                  Tip: If the preview shows a gray screen or refused to connect, the server might block embedding via X-Frame-Options or require referrer headers.
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-t border-white/10 bg-[#101321] shrink-0 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="submit-server-form"
            disabled={!isFormValid || isSubmitting}
            className={cn(
              'h-10 flex items-center justify-center gap-2 px-5 sm:px-6 rounded-xl text-xs font-bold transition-all cursor-pointer border select-none',
              isFormValid && !isSubmitting
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : 'bg-white/10 text-white/35 border-white/10 cursor-not-allowed shadow-none'
            )}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : mode === 'global' ? (
              <>
                <Globe className="size-4 shrink-0" />
                <span>Submit to Community</span>
              </>
            ) : (
              <>
                <Laptop className="size-4 shrink-0" />
                <span>Save to My Browser</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
