'use client'

/**
 * HandCanvas — loads MediaPipe Tasks Vision and runs real-time hand tracking.
 *
 * Uses the official @mediapipe/tasks-vision CDN bundle (no npm install needed).
 * Draws 21 hand landmarks + connections on a canvas overlay.
 */

import { useEffect, useRef, useCallback } from 'react'
import type { ClassificationResult } from '@/lib/classifier'
import { classifyASL, SignSmoother } from '@/lib/classifier'

interface Props {
  onReady: () => void
  onError: (msg: string) => void
  onHandDetected: (detected: boolean) => void
  onClassification: (result: ClassificationResult) => void
}

// MediaPipe landmarks connections (pairs of indices)
const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],        // thumb
  [0,5],[5,6],[6,7],[7,8],        // index
  [5,9],[9,10],[10,11],[11,12],   // middle
  [9,13],[13,14],[14,15],[15,16], // ring
  [13,17],[17,18],[18,19],[19,20],// pinky
  [0,17],                         // wrist–pinky
]

const ACCENT = '#39ff8a'
const ACCENT_DIM = 'rgba(57,255,138,0.4)'

function drawHand(ctx: CanvasRenderingContext2D, landmarks: { x: number; y: number }[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h)

  // Draw connections
  ctx.strokeStyle = ACCENT_DIM
  ctx.lineWidth = 2
  for (const [a, b] of CONNECTIONS) {
    const pa = landmarks[a]
    const pb = landmarks[b]
    ctx.beginPath()
    ctx.moveTo(pa.x * w, pa.y * h)
    ctx.lineTo(pb.x * w, pb.y * h)
    ctx.stroke()
  }

  // Draw landmark dots
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i]
    const isTip = [4, 8, 12, 16, 20].includes(i)
    ctx.beginPath()
    ctx.arc(lm.x * w, lm.y * h, isTip ? 6 : 4, 0, Math.PI * 2)
    ctx.fillStyle = isTip ? ACCENT : 'rgba(255,255,255,0.8)'
    ctx.fill()
    if (isTip) {
      ctx.strokeStyle = ACCENT
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }
}

const MEDIAPIPE_MJS = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'

export default function HandCanvas({ onReady, onError, onHandDetected, onClassification }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const handLandmarkerRef = useRef<any>(null)
  const smoother = useRef(new SignSmoother())
  const streamRef = useRef<MediaStream | null>(null)
  const lastHandState = useRef(false)

  const runDetection = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = handLandmarkerRef.current
    if (!video || !canvas || !landmarker || video.readyState < 2) {
      animRef.current = requestAnimationFrame(runDetection)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) { animRef.current = requestAnimationFrame(runDetection); return }

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const result = landmarker.detectForVideo(video, performance.now())
    const hasHand = result?.landmarks?.length > 0

    if (hasHand !== lastHandState.current) {
      lastHandState.current = hasHand
      onHandDetected(hasHand)
      if (!hasHand) smoother.current.clear()
    }

    if (hasHand) {
      const lm = result.landmarks[0]
      drawHand(ctx, lm, canvas.width, canvas.height)
      const raw = classifyASL(lm)
      const smoothed = smoother.current.push(raw)
      onClassification(smoothed)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    animRef.current = requestAnimationFrame(runDetection)
  }, [onHandDetected, onClassification])

  useEffect(() => {
    let cancelled = false

    async function init() {
      // Load MediaPipe Tasks Vision via ES module dynamic import
      let FilesetResolver: any, HandLandmarker: any
      try {
        const mp = await (Function('u', 'return import(u)')(MEDIAPIPE_MJS)) as any
        FilesetResolver = mp.FilesetResolver
        HandLandmarker = mp.HandLandmarker
      } catch {
        onError('Failed to load hand tracking AI. Check your internet and try again.')
        return
      }

      if (cancelled) return

      // Access camera
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
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

      // Initialize HandLandmarker
      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM)
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.5,
        })
      } catch (err) {
        onError('Failed to initialize hand tracking. Try refreshing or use Chrome / Edge.')
        return
      }

      if (cancelled) return
      onReady()
      animRef.current = requestAnimationFrame(runDetection)
    }

    init().catch(err => {
      if (!cancelled) onError(err.message ?? 'Initialization failed')
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(animRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      handLandmarkerRef.current?.close?.()
    }
  }, [onReady, onError, runDetection])

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }}   // mirror for natural feel
      />
      <canvas
        ref={canvasRef}
        className="hand-canvas"
        style={{ transform: 'scaleX(-1)' }}
      />
    </div>
  )
}
