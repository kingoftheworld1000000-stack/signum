'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { ClassificationResult } from '@/lib/classifier'
import { classifyASL, SignSmoother } from '@/lib/classifier'

interface Props {
  onReady: () => void
  onError: (msg: string) => void
  onHandDetected: (detected: boolean) => void
  onClassification: (result: ClassificationResult) => void
  facingMode?: 'user' | 'environment'
}

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
]

const HAND_COLORS = [
  { accent: '#39ff8a', accentDim: 'rgba(57,255,138,0.4)' },   // first hand: neon green
  { accent: '#a78bfa', accentDim: 'rgba(167,139,250,0.4)' },  // second hand: purple
]

function drawHand(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
  w: number,
  h: number,
  colorIdx: number,
) {
  const { accent, accentDim } = HAND_COLORS[colorIdx] ?? HAND_COLORS[0]

  ctx.strokeStyle = accentDim
  ctx.lineWidth = 2
  for (const [a, b] of CONNECTIONS) {
    const pa = landmarks[a]; const pb = landmarks[b]
    ctx.beginPath()
    ctx.moveTo(pa.x * w, pa.y * h)
    ctx.lineTo(pb.x * w, pb.y * h)
    ctx.stroke()
  }

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i]
    const isTip = [4, 8, 12, 16, 20].includes(i)
    ctx.beginPath()
    ctx.arc(lm.x * w, lm.y * h, isTip ? 6 : 4, 0, Math.PI * 2)
    ctx.fillStyle = isTip ? accent : 'rgba(255,255,255,0.8)'
    ctx.fill()
    if (isTip) {
      ctx.strokeStyle = accent
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }
}

const MEDIAPIPE_MJS  = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'

export default function HandCanvas({
  onReady, onError, onHandDetected, onClassification, facingMode = 'user',
}: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const landmarkerRef  = useRef<any>(null)
  const smoother  = useRef(new SignSmoother())
  const streamRef = useRef<MediaStream | null>(null)
  const lastHandState = useRef(false)

  const mirror = facingMode === 'user'

  const runDetection = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    const lmkr   = landmarkerRef.current
    if (!video || !canvas || !lmkr || video.readyState < 2) {
      animRef.current = requestAnimationFrame(runDetection)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) { animRef.current = requestAnimationFrame(runDetection); return }

    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const result  = lmkr.detectForVideo(video, performance.now())
    const hasHand = result?.landmarks?.length > 0

    if (hasHand !== lastHandState.current) {
      lastHandState.current = hasHand
      onHandDetected(hasHand)
      if (!hasHand) smoother.current.clear()
    }

    if (hasHand) {
      // Draw all detected hands
      for (let i = 0; i < result.landmarks.length; i++) {
        drawHand(ctx, result.landmarks[i], canvas.width, canvas.height, i)
      }

      // Classify each hand, keep the highest-confidence result
      let best: ClassificationResult | null = null
      for (const lm of result.landmarks) {
        const raw = classifyASL(lm)
        if (!best || raw.confidence > best.confidence) best = raw
      }
      if (best) {
        const smoothed = smoother.current.push(best)
        onClassification(smoothed)
      }
    }

    animRef.current = requestAnimationFrame(runDetection)
  }, [onHandDetected, onClassification])

  useEffect(() => {
    let cancelled = false

    async function init() {
      let FilesetResolver: any, HandLandmarker: any
      try {
        const mp = await (Function('u', 'return import(u)')(MEDIAPIPE_MJS)) as any
        FilesetResolver = mp.FilesetResolver
        HandLandmarker  = mp.HandLandmarker
      } catch {
        onError('Failed to load hand tracking AI. Check your internet and try again.')
        return
      }
      if (cancelled) return

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width:  { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
      } catch {
        onError('Camera access denied. Please allow camera permissions and try again.')
        return
      }
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream

      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()

      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM)
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.5,
        })
      } catch {
        onError('Failed to initialize hand tracking. Try refreshing or use Chrome / Edge.')
        return
      }

      if (cancelled) return
      onReady()
      animRef.current = requestAnimationFrame(runDetection)
    }

    init().catch(err => {
      if (!cancelled) onError(err?.message ?? 'Initialization failed')
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(animRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      landmarkerRef.current?.close?.()
    }
  }, [onReady, onError, runDetection, facingMode])

  const mirrorStyle = mirror ? 'scaleX(-1)' : 'none'

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        style={{ transform: mirrorStyle }}
      />
      <canvas
        ref={canvasRef}
        className="hand-canvas"
        style={{ transform: mirrorStyle }}
      />
    </div>
  )
}
