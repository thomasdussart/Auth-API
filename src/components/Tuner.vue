<template>
  <v-card color="surface" rounded="xl" class="pa-4">
    <v-card-title class="text-center text-h6 text-medium-emphasis mb-2">
      <v-icon start color="primary">mdi-guitar-acoustic</v-icon>
      Accordeur
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="error"
      />

      <div class="needle-container mb-4">
        <svg viewBox="0 0 300 160" class="needle-svg">
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f44336" />
              <stop offset="45%" stop-color="#4caf50" />
              <stop offset="55%" stop-color="#4caf50" />
              <stop offset="100%" stop-color="#f44336" />
            </linearGradient>
          </defs>
          <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="16" stroke-linecap="round"/>
          <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke="url(#arcGrad)" stroke-width="6" stroke-linecap="round"/>
          <line x1="150" y1="150" :x2="needleX" :y2="needleY"
            stroke="white" stroke-width="2.5" stroke-linecap="round"
            style="transition: x2 0.08s, y2 0.08s;"/>
          <circle cx="150" cy="150" r="6" fill="white"/>
          <text x="150" y="90" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="11">0</text>
          <text x="32" y="110" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="10">−50</text>
          <text x="268" y="110" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="10">+50</text>
        </svg>
      </div>

      <div class="text-center mb-4">
        <div class="detected-note" :style="{ color: noteColor }">
          {{ detectedNote || '—' }}
        </div>
        <div class="text-body-1 text-medium-emphasis">
          {{ detectedFreq ? `${detectedFreq.toFixed(1)} Hz` : 'Jouez une note…' }}
        </div>
        <div v-if="centsOff !== null" class="text-body-2 mt-1" :style="{ color: noteColor }">
          {{ centsLabel }}
        </div>
      </div>

      <div class="guitar-strings mb-6">
        <div class="text-caption text-medium-emphasis text-uppercase mb-2 tracking-wide">
          Cordes standard (E A D G B e)
        </div>
        <div class="d-flex justify-space-around">
          <div
            v-for="s in strings"
            :key="s.name"
            :class="['string-btn', { active: closestString && closestString.name === s.name }]"
          >
            <div class="string-label">{{ s.name }}</div>
            <div class="string-freq text-caption text-medium-emphasis">{{ Math.round(s.freq) }}Hz</div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-center">
        <v-btn
          :color="isListening ? 'error' : 'primary'"
          :prepend-icon="isListening ? 'mdi-microphone-off' : 'mdi-microphone'"
          size="large" rounded="pill" min-width="200"
          @click="toggleListen"
        >
          {{ isListening ? 'Arrêter' : 'Démarrer le micro' }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const isListening = ref(false)
const detectedFreq = ref(null)
const detectedNote = ref('')
const centsOff = ref(null)
const error = ref('')

let audioCtx = null
let analyser = null
let stream = null
let animFrame = null
const BUFFER_SIZE = 2048
// Plage utile pour une guitare (E2 grave ≈ 82 Hz, harmoniques aiguës comprises)
const MIN_FREQ = 50
const MAX_FREQ = 1200
// Buffers réutilisés d'une frame à l'autre pour éviter le GC en boucle rAF
const sampleBuf = new Float32Array(BUFFER_SIZE)
let corrBuf = null
let silentFrames = 0

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

const strings = [
  { name: 'E2', freq: 82.41 },
  { name: 'A2', freq: 110 },
  { name: 'D3', freq: 146.83 },
  { name: 'G3', freq: 196 },
  { name: 'B3', freq: 246.94 },
  { name: 'e4', freq: 329.63 },
]

const closestString = computed(() => {
  if (!detectedFreq.value) return null
  return strings.reduce((best, s) =>
    Math.abs(s.freq - detectedFreq.value) < Math.abs(best.freq - detectedFreq.value) ? s : best
  )
})

const needleAngle = computed(() => {
  if (centsOff.value === null) return 0
  return Math.max(-90, Math.min(90, (centsOff.value / 50) * 90))
})

const needleX = computed(() => {
  const rad = ((needleAngle.value - 90) * Math.PI) / 180
  return 150 + 110 * Math.cos(rad)
})
const needleY = computed(() => {
  const rad = ((needleAngle.value - 90) * Math.PI) / 180
  return 150 + 110 * Math.sin(rad)
})

const noteColor = computed(() => {
  if (centsOff.value === null) return 'rgba(255,255,255,0.5)'
  const abs = Math.abs(centsOff.value)
  if (abs < 5) return '#4caf50'
  if (abs < 15) return '#ff9800'
  return '#f44336'
})

const centsLabel = computed(() => {
  if (centsOff.value === null) return ''
  const v = Math.round(centsOff.value)
  if (Math.abs(v) < 3) return 'Accordé ✓'
  return v > 0 ? `+${v} cents (trop haut)` : `${v} cents (trop bas)`
})

function freqToNote(freq) {
  const midi = 12 * Math.log2(freq / 440) + 69
  const rounded = Math.round(midi)
  const note = NOTE_NAMES[((rounded % 12) + 12) % 12]
  const octave = Math.floor(rounded / 12) - 1
  const exactMidi = 12 * Math.log2(freq / 440) + 69
  const cents = (exactMidi - rounded) * 100
  return { name: `${note}${octave}`, cents }
}

// Autocorrélation restreinte aux périodes correspondant à [MIN_FREQ, MAX_FREQ] :
// on ne calcule que les lags utiles au lieu de la corrélation complète en O(n²).
function autocorrelate(buf, sampleRate) {
  const n = buf.length
  let rms = 0
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / n)
  if (rms < 0.01) return -1

  const minLag = Math.floor(sampleRate / MAX_FREQ)
  const maxLag = Math.min(n - 2, Math.ceil(sampleRate / MIN_FREQ))
  if (!corrBuf || corrBuf.length < maxLag + 2) corrBuf = new Float32Array(maxLag + 2)

  for (let lag = minLag - 1; lag <= maxLag + 1; lag++) {
    let sum = 0
    for (let i = 0; i < n - lag; i++) sum += buf[i] * buf[i + lag]
    corrBuf[lag] = sum / (n - lag)
  }

  let maxVal = -Infinity, maxPos = -1
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (corrBuf[lag] > maxVal) { maxVal = corrBuf[lag]; maxPos = lag }
  }
  if (maxPos <= 0 || maxVal <= 0) return -1

  // Interpolation parabolique autour du pic pour une précision sub-échantillon
  let T0 = maxPos
  const x1 = corrBuf[T0 - 1], x2 = corrBuf[T0], x3 = corrBuf[T0 + 1]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a) T0 -= b / (2 * a)
  return sampleRate / T0
}

function detect() {
  if (!analyser) return
  analyser.getFloatTimeDomainData(sampleBuf)
  const freq = autocorrelate(sampleBuf, audioCtx.sampleRate)
  if (freq > MIN_FREQ && freq < MAX_FREQ) {
    silentFrames = 0
    detectedFreq.value = freq
    const { name, cents } = freqToNote(freq)
    detectedNote.value = name
    centsOff.value = cents
  } else if (++silentFrames > 45) {
    // ~0,75 s sans signal : on efface l'affichage au lieu de figer la dernière note
    detectedFreq.value = null; detectedNote.value = ''; centsOff.value = null
  }
  animFrame = requestAnimationFrame(detect)
}

function stopListening() {
  isListening.value = false
  cancelAnimationFrame(animFrame)
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  audioCtx?.close()
  audioCtx = null
  analyser = null
  detectedFreq.value = null; detectedNote.value = ''; centsOff.value = null
}

async function toggleListen() {
  if (isListening.value) {
    stopListening()
    return
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    audioCtx = new AudioContext()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = BUFFER_SIZE
    audioCtx.createMediaStreamSource(stream).connect(analyser)
    isListening.value = true
    error.value = ''
    silentFrames = 0
    detect()
  } catch (e) {
    error.value = e.name === 'NotAllowedError'
      ? 'Accès micro refusé. Autorisez le microphone dans les réglages du navigateur.'
      : `Impossible d'accéder au micro : ${e.message}`
  }
}

onUnmounted(stopListening)
</script>

<style scoped>
.needle-container { position: relative; }
.needle-svg { width: 100%; max-width: 300px; display: block; margin: 0 auto; }
.detected-note {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 2px;
  transition: color 0.15s;
}
.string-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  min-width: 40px;
  transition: all 0.15s;
}
.string-btn.active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(232,168,32,0.12);
}
.string-label {
  font-size: 1rem;
  font-weight: 700;
}
.string-freq { font-size: 0.65rem; }
</style>
