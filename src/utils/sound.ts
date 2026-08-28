// Web Audio API sound synthesiser for book interactions
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null

  if (!audioCtx) {
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Plays a warm, tactile "thump" sound of a hardcover book being set onto a wooden bookshelf.
 * Uses a low resonant pitch sweep + a bandpassed noise transient.
 */
export function playShelfPlaceSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // ── 1. Low wood shelf resonance thump ───────────────────
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(115, now)
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12)

    oscGain.gain.setValueAtTime(0.32, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.14)

    // ── 2. Hardcover contact friction / tap ─────────────────
    const bufferSize = Math.floor(ctx.sampleRate * 0.025) // 25ms noise buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(750, now)
    filter.Q.setValueAtTime(1.8, now)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.18, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + 0.04)
  } catch {
    // Graceful fallback for environments with blocked audio or no AudioContext
  }
}

/**
 * Plays a softer, muted "cushioned drop" sound of a book sliding into a fabric tote bag.
 * Uses a deeper muffled tone with lower resonance and a gentler cloth rustle transient.
 */
export function playBagPlaceSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // ── 1. Soft, cushioned low-frequency drop (muffled thud) ──
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.14)

    oscGain.gain.setValueAtTime(0.20, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.16)

    // ── 2. Soft cloth / canvas fabric rustle ──
    const bufferSize = Math.floor(ctx.sampleRate * 0.04) // 40ms soft fabric noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    // Lowpass filter removes sharp clicks, giving a dull, muffled cloth texture
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(450, now)
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.04)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.12, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + 0.05)
  } catch {
    // Graceful fallback
  }
}
