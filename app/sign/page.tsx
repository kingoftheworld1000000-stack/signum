'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import HandCanvas from '@/components/HandCanvas'
import SignDisplay from '@/components/SignDisplay'
import type { Locale } from '@/lib/asl'
import { SIGNS, UI_STRINGS } from '@/lib/asl'
import type { ClassificationResult } from '@/lib/classifier'

type Mode        = 'sign-to-text' | 'text-to-sign'
type Phase       = 'idle' | 'loading' | 'ready' | 'detecting'
type FacingMode  = 'user' | 'environment'

const LOCALE_FLAGS: Record<Locale, string> = { en: '🇬🇧', ru: '🇷🇺', uz: '🇺🇿' }

function t(locale: Locale, key: string): string {
  return UI_STRINGS[key]?.[locale] ?? key
}

const HOLD_DURATION = 1200

export default function SignPage() {
  const [locale,      setLocale]      = useState<Locale>('en')
  const [mode,        setMode]        = useState<Mode>('sign-to-text')
  const [facingMode,  setFacingMode]  = useState<FacingMode>('user')
  const [phase,       setPhase]       = useState<Phase>('idle')
  const [currentSign, setCurrentSign] = useState<ClassificationResult | null>(null)
  const [word,        setWord]        = useState<string[]>([])
  const [sentences,   setSentences]   = useState<string[]>([])
  const [lastAccepted,setLastAccepted]= useState<string>('')
  const [holdProgress,setHoldProgress]= useState(0)
  const [handVisible, setHandVisible] = useState(false)
  const [loadError,   setLoadError]   = useState<string | null>(null)
  const [isMobile,    setIsMobile]    = useState(false)

  const holdTimerRef       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdStartRef       = useRef<number>(0)
  const holdSymbolRef      = useRef<string>('')
  const progressIntervalRef= useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
  }, [])

  const onReady   = useCallback(() => setPhase('ready'), [])
  const onError   = useCallback((msg: string) => { setLoadError(msg); setPhase('idle') }, [])

  const onHandDetected = useCallback((detected: boolean) => {
    setHandVisible(detected)
    if (!detected) {
      setPhase(p => p === 'detecting' ? 'ready' : p)
      clearTimers()
    } else {
      setPhase(p => p === 'ready' ? 'detecting' : p)
    }
  }, [])

  const clearTimers = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    setHoldProgress(0)
    holdSymbolRef.current = ''
  }

  const onClassification = useCallback((result: ClassificationResult) => {
    if (result.confidence < 0.7 || result.symbol === '?') {
      setCurrentSign(null)
      clearTimers()
      return
    }

    setCurrentSign(result)

    if (holdSymbolRef.current !== result.symbol) {
      clearTimers()
      holdSymbolRef.current = result.symbol
      holdStartRef.current  = Date.now()

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - holdStartRef.current
        setHoldProgress(Math.min(elapsed / HOLD_DURATION * 100, 100))
      }, 30)

      holdTimerRef.current = setTimeout(() => {
        const sym = holdSymbolRef.current
        if (sym && sym !== '?' && sym !== lastAccepted) {
          setLastAccepted(sym)
          if (['HELLO', 'THANK_YOU', 'YES', 'NO', 'HELP', 'LOVE'].includes(sym)) {
            const wordStr = SIGNS[sym]?.description[locale] ?? sym
            setSentences(prev => [...prev.slice(-4), wordStr])
          } else {
            setWord(prev => [...prev, sym])
          }
        }
        clearTimers()
      }, HOLD_DURATION)
    }
  }, [lastAccepted, locale])

  useEffect(() => () => clearTimers(), [])

  const speakWord = () => {
    if (!word.length) return
    const text = word.join('')
    try {
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang  = locale === 'ru' ? 'ru-RU' : locale === 'uz' ? 'uz-UZ' : 'en-US'
      speechSynthesis.speak(utt)
    } catch { }
  }

  const saveWord = () => {
    if (!word.length) return
    setSentences(prev => [...prev.slice(-4), word.join('')])
    setWord([])
  }

  const clearAll = () => { setWord([]); setSentences([]) }

  const flipCamera = () => {
    setFacingMode(f => f === 'user' ? 'environment' : 'user')
    setPhase('loading')
    setHandVisible(false)
    setCurrentSign(null)
    clearTimers()
  }

  const startCamera = () => { setLoadError(null); setPhase('loading') }

  const sign    = currentSign && SIGNS[currentSign.symbol]
  const confPct = currentSign ? Math.round(currentSign.confidence * 100) : 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-3 gap-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            S
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-sub)' }}>
            Signum
          </span>
        </Link>

        {/* Mode tabs */}
        <div className="flex items-center gap-0.5 rounded-full p-1" style={{ background: 'var(--bg-elevated)' }}>
          <button
            onClick={() => setMode('sign-to-text')}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
            style={mode === 'sign-to-text'
              ? { background: 'var(--accent)', color: '#000' }
              : { color: 'var(--text-sub)' }}
          >
            ✋ Interpret
          </button>
          <button
            onClick={() => setMode('text-to-sign')}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
            style={mode === 'text-to-sign'
              ? { background: 'var(--accent)', color: '#000' }
              : { color: 'var(--text-sub)' }}
          >
            ⌨️ Translate
          </button>
        </div>

        {/* Locale switcher */}
        <div className="flex items-center gap-0.5 rounded-full p-1" style={{ background: 'var(--bg-elevated)' }}>
          {(Object.keys(LOCALE_FLAGS) as Locale[]).map(l => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={locale === l
                ? { background: 'rgba(57,255,138,0.2)', color: 'var(--accent)' }
                : { color: 'var(--text-sub)' }}
            >
              {LOCALE_FLAGS[l]}
            </button>
          ))}
        </div>
      </header>

      {/* ── Sign → Text mode ───────────────────────────────────── */}
      {mode === 'sign-to-text' && (
        <main className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-6 gap-6">

          {/* Left: Camera */}
          <div className="flex-1 flex flex-col gap-4">
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:flex-1 min-h-[300px]"
              style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${handVisible ? 'var(--border-glow)' : 'var(--border)'}`,
                transition: 'border-color 0.3s',
              }}
            >
              {phase !== 'idle' && (
                <HandCanvas
                  key={facingMode}
                  facingMode={facingMode}
                  onReady={onReady}
                  onError={onError}
                  onHandDetected={onHandDetected}
                  onClassification={onClassification}
                />
              )}

              {/* Camera flip */}
              {phase !== 'idle' && (
                <button
                  onClick={flipCamera}
                  className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center z-10 text-lg"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-sub)', backdropFilter: 'blur(8px)' }}
                  title="Flip camera"
                >
                  🔄
                </button>
              )}

              {/* Idle overlay */}
              {phase === 'idle' && !loadError && (
                <button
                  onClick={startCamera}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-fade-in w-full cursor-pointer"
                >
                  <div className="text-6xl">✋</div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    {t(locale, 'startInterpreting')}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Click to allow camera access
                  </p>
                </button>
              )}

              {/* Loading */}
              {phase === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full dot-1" style={{ background: 'var(--accent)' }} />
                    <div className="w-2.5 h-2.5 rounded-full dot-2" style={{ background: 'var(--accent)' }} />
                    <div className="w-2.5 h-2.5 rounded-full dot-3" style={{ background: 'var(--accent)' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-sub)' }}>{t(locale, 'modelLoading')}</p>
                </div>
              )}

              {/* Error */}
              {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <div className="text-4xl">⚠️</div>
                  <p className="text-sm" style={{ color: 'var(--text-sub)' }}>{loadError}</p>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--accent)', color: '#000' }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Status pills */}
              {phase === 'ready' && !handVisible && (
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--text-sub)', backdropFilter: 'blur(8px)' }}
                >
                  {t(locale, 'waitingForHand')}
                </div>
              )}

              {phase === 'detecting' && (
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm animate-pulse-glow"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--accent)', backdropFilter: 'blur(8px)' }}
                >
                  {t(locale, 'detecting')}
                </div>
              )}
            </div>

            {/* Hold progress */}
            {holdProgress > 0 && (
              <div className="rounded-full overflow-hidden h-1.5" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${holdProgress}%`, background: 'var(--accent)', transition: 'width 30ms linear' }}
                />
              </div>
            )}

            {/* Mobile two-hand tip */}
            {isMobile && (phase === 'ready' || phase === 'detecting') && (
              <div
                className="rounded-xl px-4 py-3 flex items-start gap-3"
                style={{ background: 'rgba(57,255,138,0.05)', border: '1px solid rgba(57,255,138,0.15)' }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>📱</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--accent)' }}>Two-hand tip:</strong>{' '}
                  Prop your phone against a book or wall, then sign freely with both hands.
                  Tap 🔄 to switch to the rear camera for a better angle.
                </p>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:w-80 flex flex-col gap-4">

            {/* Current sign */}
            <div
              className="rounded-2xl p-5 flex flex-col items-center gap-3 min-h-[160px] justify-center"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              {sign ? (
                <>
                  <div
                    className="text-8xl font-bold leading-none animate-letter-pop"
                    style={{ color: 'var(--accent)', fontFeatureSettings: '"tnum"' }}
                  >
                    {sign.symbol}
                  </div>
                  <p className="text-sm text-center" style={{ color: 'var(--text-sub)' }}>
                    {sign.description[locale]}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 rounded-full overflow-hidden w-24" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${confPct}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{confPct}%</span>
                  </div>
                  {holdProgress > 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hold still to accept…</p>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-3 opacity-20">✋</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {phase === 'ready' || phase === 'detecting' ? 'Make a sign' : 'Launch camera first'}
                  </p>
                </div>
              )}
            </div>

            {/* Word builder */}
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>
                Spelling
              </p>
              <div className="min-h-12 flex flex-wrap gap-1.5 items-center">
                {word.length === 0 ? (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>—</span>
                ) : (
                  word.map((ch, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold animate-letter-pop"
                      style={{ background: 'rgba(57,255,138,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,138,0.3)' }}
                    >
                      {ch}
                    </span>
                  ))
                )}
              </div>
              {word.length > 0 && (
                <div className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  {word.join('')}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveWord}
                  disabled={!word.length}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
                  style={{ background: 'var(--accent)', color: '#000' }}
                >
                  ✓ Save
                </button>
                <button
                  onClick={speakWord}
                  disabled={!word.length}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
                >
                  🔊 {t(locale, 'speakWord')}
                </button>
                <button
                  onClick={() => setWord(prev => prev.slice(0, -1))}
                  disabled={!word.length}
                  className="w-10 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Log */}
            {sentences.length > 0 && (
              <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>Log</p>
                  <button onClick={clearAll} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t(locale, 'clearWord')}
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {sentences.map((s, i) => (
                    <div key={i} className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supported signs */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                Supported signs
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['A','B','C','I','L','O','S','U','V','W','Y','1','2','3','4','5','HELLO','LOVE','YES','NO'].map(sym => (
                  <span
                    key={sym}
                    className="px-2 py-0.5 rounded-md text-xs"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-sub)', border: '1px solid var(--border)' }}
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── Text → Sign mode ───────────────────────────────────── */}
      {mode === 'text-to-sign' && (
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          <SignDisplay locale={locale} />
        </main>
      )}
    </div>
  )
}
