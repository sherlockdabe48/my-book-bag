// Web Audio API sound synthesiser for book interactions
let audioCtx: AudioContext | null = null

// ── Page-turn sample cache ────────────────────────────────────────────────
let pageTurnBuffer: AudioBuffer | null = null
let pageTurnLoading = false

async function loadPageTurnBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (pageTurnBuffer) return pageTurnBuffer
  if (pageTurnLoading) return null
  try {
    pageTurnLoading = true
    const response = await fetch("/sounds/167046__drminky__page-turn-2.wav")
    const arrayBuffer = await response.arrayBuffer()
    pageTurnBuffer = await ctx.decodeAudioData(arrayBuffer)
    return pageTurnBuffer
  } catch {
    return null
  } finally {
    pageTurnLoading = false
  }
}

// ── Bird flap (shelf remove / toss) sample cache ─────────────────────────
const BIRD_FLAP_OFFSET = 4.84  // start at 4.84s
const BIRD_FLAP_END    = 7.20  // stop at 7.20s
let birdFlapBuffer: AudioBuffer | null = null
let birdFlapLoading = false

async function loadBirdFlapBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (birdFlapBuffer) return birdFlapBuffer
  if (birdFlapLoading) return null
  try {
    birdFlapLoading = true
    const response = await fetch("/sounds/60143__promete__wing-flaps.wav")
    const arrayBuffer = await response.arrayBuffer()
    birdFlapBuffer = await ctx.decodeAudioData(arrayBuffer)
    return birdFlapBuffer
  } catch {
    return null
  } finally {
    birdFlapLoading = false
  }
}

// ── "I read today" sample cache ──────────────────────────────────────────
let readTodayBuffer: AudioBuffer | null = null
let readTodayLoading = false

async function loadReadTodayBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (readTodayBuffer) return readTodayBuffer
  if (readTodayLoading) return null
  try {
    readTodayLoading = true
    const response = await fetch("/sounds/783010__iceofdoom__thats-fine-tomorrow-todayall-just-days.wav")
    const arrayBuffer = await response.arrayBuffer()
    readTodayBuffer = await ctx.decodeAudioData(arrayBuffer)
    return readTodayBuffer
  } catch {
    return null
  } finally {
    readTodayLoading = false
  }
}

// ── Book-close sample cache ───────────────────────────────────────────────
const BOOK_CLOSE_OFFSET = 1.0 // skip the first second of the recording
let bookCloseBuffer: AudioBuffer | null = null
let bookCloseLoading = false

async function loadBookCloseBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
  if (bookCloseBuffer) return bookCloseBuffer
  if (bookCloseLoading) return null
  try {
    bookCloseLoading = true
    const response = await fetch("/sounds/399669__soundsforhim__close-book.mp3")
    const arrayBuffer = await response.arrayBuffer()
    bookCloseBuffer = await ctx.decodeAudioData(arrayBuffer)
    return bookCloseBuffer
  } catch {
    return null
  } finally {
    bookCloseLoading = false
  }
}

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

/**
 * Plays the real recorded page-turn sample.
 * The decoded AudioBuffer is fetched and cached on first call; subsequent
 * calls replay it instantly from memory with zero re-fetch cost.
 * Falls back silently if the file is missing or the browser blocks audio.
 */
export function playPageTurnSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (pageTurnBuffer) {
      // Buffer already loaded — play immediately
      const source = ctx.createBufferSource()
      source.buffer = pageTurnBuffer
      source.connect(ctx.destination)
      source.start()
      return
    }

    // Buffer not yet loaded — fetch, cache, then play
    loadPageTurnBuffer(ctx).then((buffer) => {
      if (!buffer) return
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start()
    })
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays the recorded book-closing sound, trimming the first second of the
 * file (pre-roll silence/noise) by starting playback at BOOK_CLOSE_OFFSET.
 * The decoded buffer is cached after the first load.
 */
export function playBookCloseSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const play = (buffer: AudioBuffer) => {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0, BOOK_CLOSE_OFFSET) // skip first second
    }

    if (bookCloseBuffer) {
      play(bookCloseBuffer)
      return
    }

    loadBookCloseBuffer(ctx).then((buffer) => {
      if (!buffer) return
      play(buffer)
    })
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays the "I read today" sample, then the book-close sound immediately
 * after it finishes — scheduled precisely on the Web Audio timeline.
 */
export function playReadTodaySound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const play = (readTodayBuf: AudioBuffer, closeBuf: AudioBuffer | null) => {
      const now = ctx.currentTime

      // 1. "I read today" — plays from now
      const readSource = ctx.createBufferSource()
      readSource.buffer = readTodayBuf
      readSource.connect(ctx.destination)
      readSource.start(now)

      // 2. Book-close — scheduled to start exactly when the first sample ends
      if (closeBuf) {
        const closeSource = ctx.createBufferSource()
        closeSource.buffer = closeBuf
        closeSource.connect(ctx.destination)
        closeSource.start(now + readTodayBuf.duration, BOOK_CLOSE_OFFSET)
      }
    }

    // Ensure both buffers are loaded before scheduling
    Promise.all([
      readTodayBuffer  ? Promise.resolve(readTodayBuffer)  : loadReadTodayBuffer(ctx),
      bookCloseBuffer  ? Promise.resolve(bookCloseBuffer)  : loadBookCloseBuffer(ctx),
    ]).then(([readTodayBuf, closeBuf]) => {
      if (!readTodayBuf) return
      play(readTodayBuf, closeBuf)
    })
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays the bird-flap recording from 4.84s to 7.20s.
 * The duration is enforced by stopping the source after (BIRD_FLAP_END - BIRD_FLAP_OFFSET) seconds.
 */
export function playBirdFlapSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const play = (buffer: AudioBuffer) => {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0, BIRD_FLAP_OFFSET, BIRD_FLAP_END - BIRD_FLAP_OFFSET)
    }

    if (birdFlapBuffer) {
      play(birdFlapBuffer)
      return
    }

    loadBirdFlapBuffer(ctx).then((buffer) => {
      if (!buffer) return
      play(buffer)
    })
  } catch {
    // Graceful fallback
  }
}
