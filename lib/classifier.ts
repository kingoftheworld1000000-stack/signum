// Real-time ASL classification from MediaPipe hand landmarks
// Uses geometric rules on 21 hand keypoints — no model download needed

export interface Landmark {
  x: number   // 0–1 normalized
  y: number   // 0–1 normalized (0 = top)
  z: number   // depth (relative)
}

export interface ClassificationResult {
  symbol: string
  confidence: number
  fingerStates: FingerState
}

export interface FingerState {
  thumb: boolean
  index: boolean
  middle: boolean
  ring: boolean
  pinky: boolean
}

// MediaPipe hand landmark indices
const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
}

function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function isFingerExtended(lm: Landmark[], tipIdx: number, mcpIdx: number, pipIdx: number): boolean {
  const tip = lm[tipIdx]
  const pip = lm[pipIdx]
  const mcp = lm[mcpIdx]
  // Extended = tip is significantly above PIP which is above MCP (in Y axis, up = lower value)
  const extended = tip.y < pip.y - 0.02 && pip.y < mcp.y + 0.03
  return extended
}

function isThumbExtended(lm: Landmark[]): boolean {
  const tip = lm[LANDMARKS.THUMB_TIP]
  const ip = lm[LANDMARKS.THUMB_IP]
  const mcp = lm[LANDMARKS.THUMB_MCP]
  const index_mcp = lm[LANDMARKS.INDEX_MCP]
  // Thumb extended = tip is far from index MCP
  const tipToIndexMCP = dist(tip, index_mcp)
  const wristToIndexMCP = dist(lm[LANDMARKS.WRIST], index_mcp)
  return tipToIndexMCP > wristToIndexMCP * 0.5
}

function fingersCurled(lm: Landmark[]): boolean {
  // All non-thumb fingers curled
  return (
    !isFingerExtended(lm, 8, 5, 6) &&
    !isFingerExtended(lm, 12, 9, 10) &&
    !isFingerExtended(lm, 16, 13, 14) &&
    !isFingerExtended(lm, 20, 17, 18)
  )
}

function getFingerStates(lm: Landmark[]): FingerState {
  return {
    thumb: isThumbExtended(lm),
    index: isFingerExtended(lm, 8, 5, 6),
    middle: isFingerExtended(lm, 12, 9, 10),
    ring: isFingerExtended(lm, 16, 13, 14),
    pinky: isFingerExtended(lm, 20, 17, 18),
  }
}

function fingersClose(lm: Landmark[], a: number, b: number): boolean {
  return dist(lm[a], lm[b]) < 0.05
}

function isOShape(lm: Landmark[]): boolean {
  // All fingertips close to thumb tip
  const thumb = lm[LANDMARKS.THUMB_TIP]
  return (
    dist(lm[8], thumb) < 0.08 &&
    dist(lm[12], thumb) < 0.10 &&
    dist(lm[16], thumb) < 0.12 &&
    dist(lm[20], thumb) < 0.14
  )
}

function isCShape(lm: Landmark[]): boolean {
  // Fingers slightly curved (neither fully extended nor fully closed)
  const indexMidExtended = isFingerExtended(lm, 8, 5, 6)
  const middleExt = isFingerExtended(lm, 12, 9, 10)
  const indexPIP = lm[6]
  const indexTIP = lm[8]
  const wrist = lm[LANDMARKS.WRIST]
  // C shape: index tip is to the side relative to wrist
  const horizontal = Math.abs(indexTIP.x - wrist.x) > 0.15
  return !indexMidExtended && !middleExt && horizontal
}

function isVSeparated(lm: Landmark[]): boolean {
  // V = index + middle extended AND separated
  const indexTip = lm[8]
  const middleTip = lm[12]
  return isFingerExtended(lm, 8, 5, 6) &&
         isFingerExtended(lm, 12, 9, 10) &&
         dist(indexTip, middleTip) > 0.06
}

function isUNotSeparated(lm: Landmark[]): boolean {
  const indexTip = lm[8]
  const middleTip = lm[12]
  return isFingerExtended(lm, 8, 5, 6) &&
         isFingerExtended(lm, 12, 9, 10) &&
         dist(indexTip, middleTip) < 0.05
}

function isIndexPointingRight(lm: Landmark[]): boolean {
  const tip = lm[8]
  const mcp = lm[5]
  return tip.x > mcp.x + 0.1 // pointing right (mirrored camera = left from user's view)
}

function isHandHorizontal(lm: Landmark[]): boolean {
  // Check if the overall hand axis is more horizontal than vertical
  const wrist = lm[LANDMARKS.WRIST]
  const middleMCP = lm[9]
  return Math.abs(middleMCP.x - wrist.x) > Math.abs(middleMCP.y - wrist.y)
}

export function classifyASL(lm: Landmark[]): ClassificationResult {
  if (!lm || lm.length < 21) return { symbol: '?', confidence: 0, fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false } }

  const fs = getFingerStates(lm)
  const { thumb, index, middle, ring, pinky } = fs

  // Count extended fingers (excluding thumb)
  const extCount = [index, middle, ring, pinky].filter(Boolean).length

  // ── LETTERS ──────────────────────────────────────────────────────────────

  // Y: Thumb + pinky only (ILY hang loose)
  if (thumb && !index && !middle && !ring && pinky) {
    return { symbol: 'Y', confidence: 0.92, fingerStates: fs }
  }

  // LOVE (ILY): Thumb + index + pinky
  if (thumb && index && !middle && !ring && pinky) {
    return { symbol: 'LOVE', confidence: 0.90, fingerStates: fs }
  }

  // L: Thumb out + index only
  if (thumb && index && !middle && !ring && !pinky) {
    return { symbol: 'L', confidence: 0.91, fingerStates: fs }
  }

  // I: Pinky only extended
  if (!thumb && !index && !middle && !ring && pinky) {
    return { symbol: 'I', confidence: 0.90, fingerStates: fs }
  }

  // 1 / D: Index only extended (without thumb)
  if (!thumb && index && !middle && !ring && !pinky) {
    return { symbol: '1', confidence: 0.88, fingerStates: fs }
  }

  // V / 2: Index + middle extended, spread or together
  if (!thumb && index && middle && !ring && !pinky) {
    if (isVSeparated(lm)) {
      return { symbol: 'V', confidence: 0.87, fingerStates: fs }
    }
    return { symbol: 'U', confidence: 0.82, fingerStates: fs }
  }

  // W / 3: Index + middle + ring
  if (!thumb && index && middle && ring && !pinky) {
    return { symbol: 'W', confidence: 0.86, fingerStates: fs }
  }

  // 4: All 4 fingers without thumb
  if (!thumb && index && middle && ring && pinky) {
    return { symbol: '4', confidence: 0.88, fingerStates: fs }
  }

  // B: All 4 + thumb folded
  if (!thumb && index && middle && ring && pinky) {
    return { symbol: 'B', confidence: 0.84, fingerStates: fs }
  }

  // 5: All 5 fingers spread
  if (thumb && index && middle && ring && pinky) {
    return { symbol: '5', confidence: 0.88, fingerStates: fs }
  }

  // 3: Thumb + index + middle
  if (thumb && index && middle && !ring && !pinky) {
    return { symbol: '3', confidence: 0.85, fingerStates: fs }
  }

  // O: All curled into O
  if (isOShape(lm)) {
    return { symbol: 'O', confidence: 0.88, fingerStates: fs }
  }

  // A / S / E: All fingers curled
  if (fingersCurled(lm)) {
    if (thumb) {
      return { symbol: 'A', confidence: 0.82, fingerStates: fs }
    }
    return { symbol: 'S', confidence: 0.78, fingerStates: fs }
  }

  // C: Curved C shape
  if (isCShape(lm)) {
    return { symbol: 'C', confidence: 0.78, fingerStates: fs }
  }

  return { symbol: '?', confidence: 0, fingerStates: fs }
}

// Smooth classification over recent frames to reduce jitter
export class SignSmoother {
  private history: ClassificationResult[] = []
  private readonly windowSize = 8
  private readonly minConfidence = 0.5

  push(result: ClassificationResult): ClassificationResult {
    this.history.push(result)
    if (this.history.length > this.windowSize) this.history.shift()

    // Vote: take the most common symbol in recent frames
    const counts: Record<string, { count: number; totalConf: number }> = {}
    for (const r of this.history) {
      if (r.confidence >= this.minConfidence) {
        counts[r.symbol] = counts[r.symbol] ?? { count: 0, totalConf: 0 }
        counts[r.symbol].count++
        counts[r.symbol].totalConf += r.confidence
      }
    }

    let best = result
    let bestCount = 0
    for (const [symbol, { count, totalConf }] of Object.entries(counts)) {
      if (count > bestCount) {
        bestCount = count
        best = { symbol, confidence: totalConf / count, fingerStates: result.fingerStates }
      }
    }

    return best
  }

  clear() { this.history = [] }
}
