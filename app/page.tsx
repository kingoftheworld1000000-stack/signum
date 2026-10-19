import Link from 'next/link'

const stats = [
  { value: '70M+', label: 'Deaf people worldwide' },
  { value: '$0', label: 'Cost. Forever.' },
  { value: '21', label: 'Hand landmarks tracked' },
  { value: 'Offline', label: 'No internet needed' },
]

const features = [
  {
    icon: '🧠',
    title: 'Neural hand tracking',
    desc: 'MediaPipe detects 21 precise hand keypoints at 30 fps — in real-time, right in your browser.',
  },
  {
    icon: '🔒',
    title: 'Fully private',
    desc: 'Zero data leaves your device. No server, no storage, no account. Just your hands and the AI.',
  },
  {
    icon: '🌍',
    title: 'Works everywhere',
    desc: 'Any phone, any browser. Install as an app. Use it offline. Built for people with no infrastructure.',
  },
  {
    icon: '⚡',
    title: 'Real-time, < 50ms',
    desc: 'Edge-computed classification runs locally at camera speed. No latency, no cloud dependency.',
  },
]

const steps = [
  { n: '01', title: 'Open your camera', desc: 'Allow camera access. No photos are stored — ever.' },
  { n: '02', title: 'Show a hand sign', desc: 'The AI tracks your 21 hand keypoints in real-time.' },
  { n: '03', title: 'See instant results', desc: 'The recognized sign appears immediately with confidence.' },
  { n: '04', title: 'Spell words', desc: 'Chain multiple letters into words. Tap to speak them aloud.' },
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold" style={{ background: 'var(--accent)', color: '#000' }}>
            S
          </div>
          <span className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Signum</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign" className="hidden sm:block text-sm transition-colors" style={{ color: 'var(--text-sub)' }}>
            Try it
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hidden sm:block text-sm transition-colors" style={{ color: 'var(--text-sub)' }}>
            GitHub
          </a>
          <Link
            href="/sign"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Launch app →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-medium animate-fade-up" style={{ border: '1px solid var(--border-glow)', color: 'var(--accent)', background: 'var(--accent-dim)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          Open-source · Free · Works offline
        </div>

        <h1 className="text-6xl sm:text-7xl font-bold leading-none tracking-tight mb-8 animate-fade-up-1">
          <span style={{ color: 'var(--text)' }}>Your hands.</span>
          <br />
          <span style={{ color: 'var(--accent)' }}>Their voice.</span>
        </h1>

        <p className="text-xl max-w-2xl mx-auto mb-4 leading-relaxed animate-fade-up-2" style={{ color: 'var(--text-sub)' }}>
          The first free, browser-based AI that interprets sign language in real-time.
          No app download. No account. No internet required.
        </p>

        <p className="text-base max-w-xl mx-auto mb-12 animate-fade-up-2" style={{ color: 'var(--text-muted)' }}>
          For 70 million deaf people — and anyone who needs to be heard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-3">
          <Link
            href="/sign"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#000', boxShadow: '0 0 40px rgba(57,255,138,0.3)' }}
          >
            ✋ Start interpreting
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
          >
            ⭐ Star on GitHub
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-6" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10">
          {stats.map(s => (
            <div key={s.value} className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{s.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem statement */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <p className="text-2xl sm:text-3xl font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>
          70 million deaf people need to communicate with the hearing world every day.
          <br />
          <span style={{ color: 'var(--text-sub)' }}>
            Professional interpreters cost $50–100/hour. Apps need internet. Hardware costs thousands.
          </span>
          <br />
          <span style={{ color: 'var(--accent)' }}>We fixed all of that.</span>
        </p>
      </section>

      {/* How it works */}
      <section className="px-6 py-20" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16" style={{ color: 'var(--text)' }}>How it works</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {steps.map(s => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm mx-auto mb-4" style={{ border: '1px solid var(--border-glow)', color: 'var(--accent)', background: 'var(--accent-dim)' }}>
                  {s.n}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16" style={{ color: 'var(--text)' }}>Built differently</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map(f => (
            <div key={f.title} className="p-6 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 sm:mx-auto max-w-4xl mb-20 rounded-3xl p-12 text-center" style={{ background: 'linear-gradient(135deg, #0f2016, #0a1a0f)', border: '1px solid var(--border-glow)' }}>
        <p className="text-xs uppercase tracking-widest mb-4 font-medium" style={{ color: 'var(--accent)' }}>
          Open source · MIT license
        </p>
        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          Ready to break the silence?
        </h2>
        <p className="text-lg mb-10" style={{ color: 'var(--text-sub)' }}>
          No account. No install. No barriers.
        </p>
        <Link
          href="/sign"
          className="inline-block px-10 py-4 rounded-2xl text-xl font-bold hover:opacity-90 transition-all hover:scale-105"
          style={{ background: 'var(--accent)', color: '#000', boxShadow: '0 0 60px rgba(57,255,138,0.4)' }}
        >
          ✋ Try Signum now
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center px-6 py-8 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <p>Signum — Open-source sign language AI for everyone</p>
        <p className="mt-1">MediaPipe hand tracking · Geometric ASL classifier · PWA · Offline-first</p>
      </footer>
    </div>
  )
}
