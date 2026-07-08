/**
 * Realistic ambient sound generators using Web Audio API.
 * Uses noise buffers, LFOs, filters, and envelopes to simulate real environments.
 */

let noiseBuffer: AudioBuffer | null = null

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer
  const length = ctx.sampleRate * 4
  noiseBuffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = noiseBuffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return noiseBuffer
}

function createNoise(ctx: AudioContext, loop = true): AudioBufferSourceNode {
  const src = ctx.createBufferSource()
  src.buffer = getNoiseBuffer(ctx)
  src.loop = loop
  return src
}

// ─── RAIN ──────────────────────────────────────────────
export function createRain(ctx: AudioContext, volume: number) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(volume * 0.6, ctx.currentTime + 1)
  master.connect(ctx.destination)

  // Base rain: filtered noise
  const noise = createNoise(ctx)
  const hp = ctx.createBiquadFilter()
  hp.type = "highpass"
  hp.frequency.value = 4000
  const lp = ctx.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 8000
  const rainGain = ctx.createGain()
  rainGain.gain.value = 0.3
  noise.connect(hp).connect(lp).connect(rainGain).connect(master)
  noise.start()

  // Mid rumble: low filtered noise
  const rumble = createNoise(ctx)
  const lpR = ctx.createBiquadFilter()
  lpR.type = "lowpass"
  lpR.frequency.value = 400
  const rumbleGain = ctx.createGain()
  rumbleGain.gain.value = 0.12
  rumble.connect(lpR).connect(rumbleGain).connect(master)
  rumble.start()

  // Random droplet clicks
  const dropletGain = ctx.createGain()
  dropletGain.gain.value = 0.08
  dropletGain.connect(master)

  let dropletTimer: ReturnType<typeof setInterval>
  function startDroplets() {
    dropletTimer = setInterval(() => {
      const click = ctx.createOscillator()
      const clickGain = ctx.createGain()
      const freq = 2000 + Math.random() * 4000
      click.frequency.value = freq
      click.type = "sine"
      const now = ctx.currentTime
      clickGain.gain.setValueAtTime(0.06 + Math.random() * 0.04, now)
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03 + Math.random() * 0.02)
      click.connect(clickGain).connect(dropletGain)
      click.start(now)
      click.stop(now + 0.05)
    }, 80 + Math.random() * 120)
  }
  startDroplets()

  return {
    setVolume(v: number) {
      master.gain.linearRampToValueAtTime(v * 0.6, ctx.currentTime + 0.1)
    },
    stop() {
      clearInterval(dropletTimer)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      setTimeout(() => { try { noise.disconnect(); rumble.disconnect() } catch {} }, 600)
    },
  }
}

// ─── OCEAN ─────────────────────────────────────────────
export function createOcean(ctx: AudioContext, volume: number) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + 1.5)
  master.connect(ctx.destination)

  // Wave noise
  const noise = createNoise(ctx)
  const bp = ctx.createBiquadFilter()
  bp.type = "lowpass"
  bp.frequency.value = 600
  bp.Q.value = 0.5
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.4

  // LFO for wave amplitude (slow, organic)
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = "sine"
  lfo.frequency.value = 0.08
  lfoGain.gain.value = 0.3

  lfo.connect(lfoGain)
  lfoGain.connect(noiseGain.gain)
  lfo.start()

  // Second LFO for filter sweep
  const lfo2 = ctx.createOscillator()
  const lfo2Gain = ctx.createGain()
  lfo2.type = "sine"
  lfo2.frequency.value = 0.12
  lfo2Gain.gain.value = 200
  lfo2.connect(lfo2Gain)
  lfo2Gain.connect(bp.frequency)
  lfo2.start()

  // Deep bass
  const bass = ctx.createOscillator()
  const bassGain = ctx.createGain()
  bass.type = "sine"
  bass.frequency.value = 60
  bassGain.gain.value = 0.08
  const bassLfo = ctx.createOscillator()
  const bassLfoGain = ctx.createGain()
  bassLfo.type = "sine"
  bassLfo.frequency.value = 0.05
  bassLfoGain.gain.value = 0.04
  bassLfo.connect(bassLfoGain)
  bassLfoGain.connect(bassGain.gain)
  bass.connect(bassGain).connect(master)
  bass.start()
  bassLfo.start()

  noise.connect(bp).connect(noiseGain).connect(master)
  noise.start()

  return {
    setVolume(v: number) {
      master.gain.linearRampToValueAtTime(v * 0.7, ctx.currentTime + 0.1)
    },
    stop() {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
      setTimeout(() => {
        try { noise.disconnect(); lfo.disconnect(); lfo2.disconnect(); bass.disconnect() } catch {}
      }, 1200)
    },
  }
}

// ─── FOREST ────────────────────────────────────────────
export function createForest(ctx: AudioContext, volume: number) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 1)
  master.connect(ctx.destination)

  // Wind in leaves: filtered noise
  const noise = createNoise(ctx)
  const bp = ctx.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = 2000
  bp.Q.value = 0.3
  const leafGain = ctx.createGain()
  leafGain.gain.value = 0.15

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = "sine"
  lfo.frequency.value = 0.15
  lfoGain.gain.value = 0.08
  lfo.connect(lfoGain)
  lfoGain.connect(leafGain.gain)
  lfo.start()
  noise.connect(bp).connect(leafGain).connect(master)
  noise.start()

  // Bird chirps: periodic high-frequency oscillator bursts
  const birdGain = ctx.createGain()
  birdGain.gain.value = 0.04
  birdGain.connect(master)

  let birdTimer: ReturnType<typeof setInterval>
  function startBirds() {
    function chirp() {
      const now = ctx.currentTime
      const baseFreq = 3000 + Math.random() * 2000
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, now + 0.05)
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, now + 0.1)
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(0.1, now + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.connect(g).connect(birdGain)
      osc.start(now)
      osc.stop(now + 0.2)
    }
    birdTimer = setInterval(() => {
      if (Math.random() < 0.4) chirp()
    }, 800 + Math.random() * 1500)
  }
  startBirds()

  // Occasional deeper bird call
  let deepBirdTimer: ReturnType<typeof setInterval>
  function startDeepBirds() {
    deepBirdTimer = setInterval(() => {
      if (Math.random() < 0.25) {
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(800 + Math.random() * 400, now)
        osc.frequency.linearRampToValueAtTime(600 + Math.random() * 200, now + 0.2)
        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(0.03, now + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
        osc.connect(g).connect(master)
        osc.start(now)
        osc.stop(now + 0.35)
      }
    }, 2000 + Math.random() * 3000)
  }
  startDeepBirds()

  return {
    setVolume(v: number) {
      master.gain.linearRampToValueAtTime(v * 0.5, ctx.currentTime + 0.1)
    },
    stop() {
      clearInterval(birdTimer)
      clearInterval(deepBirdTimer)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      setTimeout(() => { try { noise.disconnect(); lfo.disconnect() } catch {} }, 600)
    },
  }
}

// ─── WIND ──────────────────────────────────────────────
export function createWind(ctx: AudioContext, volume: number) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 2)
  master.connect(ctx.destination)

  // Brown noise approximation: multiple lowpass filters in series
  const noise = createNoise(ctx)
  const lp1 = ctx.createBiquadFilter()
  lp1.type = "lowpass"
  lp1.frequency.value = 300
  const lp2 = ctx.createBiquadFilter()
  lp2.type = "lowpass"
  lp2.frequency.value = 200
  const windGain = ctx.createGain()
  windGain.gain.value = 0.5

  // Slow volume LFO (gusts)
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = "sine"
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 0.2
  lfo.connect(lfoGain)
  lfoGain.connect(windGain.gain)
  lfo.start()

  // Filter sweep LFO
  const lfo2 = ctx.createOscillator()
  const lfo2Gain = ctx.createGain()
  lfo2.type = "sine"
  lfo2.frequency.value = 0.04
  lfo2Gain.gain.value = 100
  lfo2.connect(lfo2Gain)
  lfo2Gain.connect(lp1.frequency)
  lfo2.start()

  // Occasional whistling
  const whistleGain = ctx.createGain()
  whistleGain.gain.value = 0.015
  whistleGain.connect(master)

  let whistleTimer: ReturnType<typeof setInterval>
  function startWhistle() {
    whistleTimer = setInterval(() => {
      if (Math.random() < 0.3) {
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(400 + Math.random() * 300, now)
        osc.frequency.linearRampToValueAtTime(600 + Math.random() * 200, now + 0.5)
        osc.frequency.linearRampToValueAtTime(350 + Math.random() * 200, now + 1.5)
        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(0.02, now + 0.3)
        g.gain.linearRampToValueAtTime(0, now + 1.5)
        osc.connect(g).connect(whistleGain)
        osc.start(now)
        osc.stop(now + 1.6)
      }
    }, 2000 + Math.random() * 3000)
  }
  startWhistle()

  noise.connect(lp1).connect(lp2).connect(windGain).connect(master)
  noise.start()

  return {
    setVolume(v: number) {
      master.gain.linearRampToValueAtTime(v * 0.5, ctx.currentTime + 0.1)
    },
    stop() {
      clearInterval(whistleTimer)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
      setTimeout(() => { try { noise.disconnect(); lfo.disconnect(); lfo2.disconnect() } catch {} }, 1200)
    },
  }
}

// ─── NIGHT ─────────────────────────────────────────────
export function createNight(ctx: AudioContext, volume: number) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(volume * 0.45, ctx.currentTime + 1.5)
  master.connect(ctx.destination)

  // Cricket rhythm: high-freq pulse train
  const cricketGain = ctx.createGain()
  cricketGain.gain.value = 0.06
  cricketGain.connect(master)

  let cricketTimer: ReturnType<typeof setInterval>
  function startCrickets() {
    cricketTimer = setInterval(() => {
      const now = ctx.currentTime
      const baseFreq = 5000 + Math.random() * 1000
      // Crickets: rapid pulse
      for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = baseFreq + Math.random() * 200
        const t = now + i * 0.06
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.08, t + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
        osc.connect(g).connect(cricketGain)
        osc.start(t)
        osc.stop(t + 0.04)
      }
    }, 400 + Math.random() * 800)
  }
  startCrickets()

  // Background ambient hum
  const hum = ctx.createOscillator()
  const humGain = ctx.createGain()
  hum.type = "sine"
  hum.frequency.value = 180
  humGain.gain.value = 0.02

  const humLfo = ctx.createOscillator()
  const humLfoGain = ctx.createGain()
  humLfo.type = "sine"
  humLfo.frequency.value = 0.03
  humLfoGain.gain.value = 0.01
  humLfo.connect(humLfoGain)
  humLfoGain.connect(humGain.gain)
  humLfo.start()
  hum.connect(humGain).connect(master)
  hum.start()

  // Occasional frog/toad
  let frogTimer: ReturnType<typeof setInterval>
  function startFrogs() {
    frogTimer = setInterval(() => {
      if (Math.random() < 0.2) {
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(200 + Math.random() * 100, now)
        osc.frequency.linearRampToValueAtTime(150 + Math.random() * 50, now + 0.3)
        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(0.04, now + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
        osc.connect(g).connect(master)
        osc.start(now)
        osc.stop(now + 0.45)
      }
    }, 3000 + Math.random() * 4000)
  }
  startFrogs()

  return {
    setVolume(v: number) {
      master.gain.linearRampToValueAtTime(v * 0.45, ctx.currentTime + 0.1)
    },
    stop() {
      clearInterval(cricketTimer)
      clearInterval(frogTimer)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
      setTimeout(() => { try { hum.disconnect(); humLfo.disconnect() } catch {} }, 1200)
    },
  }
}

export type SoundController = {
  setVolume: (v: number) => void
  stop: () => void
}

export type SoundFactory = (ctx: AudioContext, volume: number) => SoundController
