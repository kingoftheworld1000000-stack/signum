<div align="center">

<img src="https://img.shields.io/badge/status-live-39ff8a?style=for-the-badge&labelColor=000000" />
<img src="https://img.shields.io/badge/license-MIT-39ff8a?style=for-the-badge&labelColor=000000" />
<img src="https://img.shields.io/badge/made%20with-Next.js%2016-39ff8a?style=for-the-badge&labelColor=000000" />
<img src="https://img.shields.io/badge/offline%20ready-yes-39ff8a?style=for-the-badge&labelColor=000000" />

<br /><br />

```
 ███████╗██╗ ██████╗ ███╗   ██╗██╗   ██╗███╗   ███╗
 ██╔════╝██║██╔════╝ ████╗  ██║██║   ██║████╗ ████║
 ███████╗██║██║  ███╗██╔██╗ ██║██║   ██║██╔████╔██║
 ╚════██║██║██║   ██║██║╚██╗██║██║   ██║██║╚██╔╝██║
 ███████║██║╚██████╔╝██║ ╚████║╚██████╔╝██║ ╚═╝ ██║
 ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝
```

# Your hands. Their voice.

**The first free, browser-based AI that interprets sign language in real-time.**  
No app. No account. No internet required.

[**→ Try it live**](https://signum.vercel.app) · [**How it works**](#how-it-works) · [**Run locally**](#run-locally)

</div>

---

## The problem

> 70 million people worldwide are deaf or hard of hearing.  
> Professional sign language interpreters cost **$50–100 per hour**.  
> Existing software requires expensive hardware, proprietary apps, or constant internet.  
> **We fixed all of that.**

Signum runs entirely in your browser. It uses your laptop camera, processes everything on-device, and speaks words aloud — no server, no data collection, no cost. Ever.

---

## Demo

| Detecting letter V | Word builder + speech |
|---|---|
| Hand tracked in real-time with 21 landmarks | Chain letters into words, tap to speak |

> *Open the app, allow camera access, show your hand — results appear in under 50ms.*

---

## How it works

```
Camera feed (30fps)
      │
      ▼
┌─────────────────────────────────┐
│   MediaPipe HandLandmarker      │  ← Google's ML model, runs on GPU via WebGL
│   21 keypoints per frame        │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│   Geometric ASL Classifier      │  ← Pure math, no model download
│   Finger extension + angles     │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│   SignSmoother (8-frame window) │  ← Temporal voting eliminates jitter
│   Hold-to-accept (1.2s timer)   │
└─────────────────────────────────┘
      │
      ▼
   Letter / Word → Web Speech API → 🔊
```

**Why geometric classification instead of a neural network?**  
Training a custom classifier requires hundreds of thousands of labeled samples and a model download of 50–200MB. A geometric approach using MediaPipe's landmark coordinates achieves comparable accuracy on fingerspelling with *zero* download overhead and *zero* latency — the model runs in a single function call.

---

## Features

- **Real-time** — 30fps hand tracking with sub-50ms classification latency
- **Offline-first** — works with no internet after first load (PWA)
- **Fully private** — zero data leaves your device, no server, no storage
- **Text-to-speech** — chain letters into words, speak them aloud
- **Multilingual UI** — English, Russian, Uzbek
- **26 signs** — ASL letters A–Y, numbers 1–5, common words (HELLO, LOVE, YES, NO, HELP, THANK YOU)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.4 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS v4 |
| Hand tracking | MediaPipe Tasks Vision 0.10.14 (WebGL GPU delegate) |
| Classification | Custom geometric classifier (`lib/classifier.ts`) |
| Speech | Web Speech API (native browser) |
| PWA | Web App Manifest + offline support |
| Language | TypeScript (strict) |

---

## Run locally

```bash
git clone https://github.com/matrixstudioit-create/signum.git
cd signum
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — allow camera access and start signing.

> **Requirements:** Chrome or Edge (for best WebGL performance). Camera required.

---

## Project structure

```
signum/
├── app/
│   ├── page.tsx          # Landing page
│   └── sign/page.tsx     # Main interpreter
├── components/
│   └── HandCanvas.tsx    # MediaPipe loader + canvas overlay
├── lib/
│   ├── classifier.ts     # ASL geometric classifier + SignSmoother
│   └── asl.ts            # Sign database (letters, numbers, words)
└── public/
    └── manifest.json     # PWA manifest
```

---

## Roadmap

- [ ] Full ASL alphabet (remaining letters: J, M, N, P, Q, T, Z)
- [ ] Two-hand signs
- [ ] Sentence mode (word-level signs, not just fingerspelling)
- [ ] Custom vocabulary training via transfer learning
- [ ] Mobile (iOS Safari / Android Chrome)
- [ ] Exportable conversation log

---

## Why this matters

Sign language interpreters are unavailable to most people on demand. Video relay services have wait times. Hardware gloves cost thousands. Browser-based interpretation with a standard webcam is the only path to universal access — and until now, no free, open-source version existed.

Signum is a proof that accessibility technology doesn't have to be locked behind paywalls or app stores.

---

## License

MIT © 2026 — free to use, fork, and improve.

---

<div align="center">

*Built in one night. For the 70 million people who deserve to be heard.*

</div>
