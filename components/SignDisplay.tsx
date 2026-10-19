'use client'

import { useState, useEffect, useRef } from 'react'
import { SIGNS } from '@/lib/asl'
import type { Locale } from '@/lib/asl'

interface Props {
  locale: Locale
}

function parseTextToTokens(text: string): string[] {
  const tokens: string[] = []
  const words = text.trim().toUpperCase().split(/\s+/)
  for (const word of words) {
    if (!word) continue
    if (SIGNS[word]) {
      tokens.push(word)
    } else {
      for (const ch of word) {
        if (/[A-Z0-9]/.test(ch)) tokens.push(ch)
      }
    }
  }
  return tokens
}

export default function SignDisplay({ locale }: Props) {
  const [inputText, setInputText] = useState('')
  const [tokens, setTokens]   = useState<string[]>([])
  const [idx, setIdx]         = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function convert() {
    const t = parseTextToTokens(inputText)
    if (!t.length) return
    setTokens(t)
    setIdx(0)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!isPlaying || !tokens.length) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setIdx(i => {
        if (i >= tokens.length - 1) { setIsPlaying(false); return i }
        return i + 1
      })
    }, 1600)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, tokens.length])

  const current = tokens[idx]
  const sign    = current ? SIGNS[current] : null

  function SignCard({ large = false }: { large?: boolean }) {
    if (!current) {
      return (
        <div className="flex flex-col items-center gap-3 text-center" style={{ color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px' }}>⌨️</div>
          <p className="text-sm">Type a message above and press Convert to Signs</p>
        </div>
      )
    }
    return (
      <div
        className="flex flex-col items-center gap-4 animate-fade-in"
        onClick={isPresenting ? () => setIdx(i => Math.min(tokens.length - 1, i + 1)) : undefined}
        style={isPresenting ? { cursor: 'pointer', userSelect: 'none' } : {}}
      >
        <div style={{ fontSize: large ? '120px' : '72px', lineHeight: 1 }}>
          {sign?.emoji ?? '✋'}
        </div>
        <div
          className="font-black leading-none tracking-tight"
          style={{ fontSize: large ? '96px' : '64px', color: 'var(--accent)' }}
        >
          {sign?.symbol ?? current}
        </div>
        <p style={{ color: 'var(--text-sub)', fontSize: large ? '1.4rem' : '1rem', textAlign: 'center' }}>
          {sign?.description[locale] ?? `Letter ${current}`}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: large ? '1rem' : '0.8rem', textAlign: 'center', maxWidth: '420px' }}>
          {sign?.handShape ?? 'Make the ASL fingerspelling shape for this letter'}
        </p>
        {sign?.category === 'word' && (
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(57,255,138,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,138,0.3)' }}
          >
            Two-hand word sign
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── Fullscreen presentation mode ──────────────────────── */}
      {isPresenting && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: '#000' }}
          onClick={() => setIdx(i => Math.min(tokens.length - 1, i + 1))}
        >
          {/* Progress dots */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {tokens.map((_, i) => (
              <div
                key={i}
                onClick={e => { e.stopPropagation(); setIdx(i) }}
                className="rounded-full transition-all cursor-pointer"
                style={{
                  width:  i === idx ? '20px' : '8px',
                  height: '8px',
                  background: i === idx ? 'var(--accent)' : i < idx ? 'rgba(57,255,138,0.3)' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>

          <SignCard large />

          {/* Bottom controls */}
          <div className="absolute bottom-8 flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {idx + 1} / {tokens.length} · tap anywhere to advance
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIdx(i => Math.max(0, i - 1))}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
              >
                ← Back
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--accent)', color: '#000' }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Auto'}
              </button>
              <button
                onClick={() => { setIsPresenting(false); setIsPlaying(false) }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
              >
                ✕ Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Normal mode ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4">

        {/* Explainer */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Show signs to a deaf person</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Type anything → the app shows each ASL sign one by one.
            Tap <strong style={{ color: 'var(--accent)' }}>Present</strong> for fullscreen mode — just hand them your phone.
          </p>
        </div>

        {/* Input */}
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <p className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--text-muted)' }}>
            Type your message
          </p>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) convert() }}
            placeholder="Hello, how are you today?"
            rows={3}
            className="w-full resize-none rounded-xl p-3 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              minHeight: '80px',
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={convert}
              disabled={!inputText.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              Convert to Signs ✋
            </button>
            {tokens.length > 0 && (
              <button
                onClick={() => { setIsPresenting(true); setIdx(0); setIsPlaying(false) }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: '1px solid var(--border-glow)', color: 'var(--accent)' }}
                title="Fullscreen — hand to deaf person"
              >
                📺 Present
              </button>
            )}
          </div>
        </div>

        {/* Sign display card */}
        <div
          className="rounded-2xl p-6 flex flex-col items-center justify-center"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', minHeight: '260px' }}
        >
          <SignCard />
        </div>

        {tokens.length > 0 && (
          <>
            {/* Playback controls */}
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => { setIdx(i => Math.max(0, i - 1)); setIsPlaying(false) }}
                disabled={idx === 0}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg disabled:opacity-30"
                style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
              >
                ←
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: isPlaying ? 'var(--bg)' : 'var(--accent)',
                  color: isPlaying ? 'var(--accent)' : '#000',
                  border: '1px solid var(--border-glow)',
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Auto-play'}
              </button>
              <button
                onClick={() => { setIdx(i => Math.min(tokens.length - 1, i + 1)); setIsPlaying(false) }}
                disabled={idx === tokens.length - 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg disabled:opacity-30"
                style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
              >
                →
              </button>
            </div>

            {/* Token bar */}
            <div
              className="rounded-2xl p-3 flex flex-wrap gap-1.5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              {tokens.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setIdx(i); setIsPlaying(false) }}
                  className="px-2.5 py-1 rounded-lg text-sm font-medium transition-all"
                  style={
                    i === idx
                      ? { background: 'var(--accent)', color: '#000' }
                      : i < idx
                        ? { background: 'rgba(57,255,138,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,138,0.25)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tip */}
            <div
              className="rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: 'rgba(57,255,138,0.05)', border: '1px solid rgba(57,255,138,0.15)' }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Hit <strong style={{ color: 'var(--accent)' }}>Present</strong> for fullscreen mode,
                then hand the phone to your deaf friend — they tap to advance through each sign.
                Works great propped up on a table too.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
