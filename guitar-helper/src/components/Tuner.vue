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
            <div class="string-freq text-caption text-medium-emphasis">{{ s.freq }}Hz</div>
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

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

const strings = [
  { name: 'E2', freq: 82 },
  { name: 'A2', freq: 110 },
  { name: 'D3', freq: 147 },
  { name: 'G3', freq: 196 },
  { name: 'B3', freq: 247 },
  { name: 'e4', freq: 330 },
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

function autocorrelate(buf, sampleRate) {
  let rms = 0
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / buf.length)
  if (rms < 0.01) return -1

  let r1 = 0, r2 = buf.length - 1
  const thresh = 0.2
  for (let i = 0; i < buf.length / 2; i++) {
    if (Math.abs(buf[i]) < thresh) { r1 = i; break }
  }
  for (let i = 1; i < buf.length / 2; i++) {
    if (Math.abs(buf[buf.length - i]) < thresh) { r2 = buf.length - i; break }
  }
  const sliced = buf.slice(r1, r2)
  const c = new Float32Array(sliced.length * 2)
  for (let i = 0; i < sliced.length; i++) {
    for (let j = 0; j < sliced.length; j++) c[i + j] += sliced[i] * sliced[j]
  }
  const corr = c.slice(sliced.length)
  let d = 0
  while (corr[d] > corr[d + 1]) d++
  let maxVal = -1, maxPos = -1
  for (let i = d; i < corr.length; i++) {
    if (corr[i] > maxVal) { maxVal = corr[i]; maxPos = i }
  }
  let T0 = maxPos
  const x1 = corr[T0 - 1], x2 = corr[T0], x3 = corr[T0 + 1]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a) T0 -= b / (2 * a)
  return sampleRate / T0
}

function detect() {
  const buf = new Float32Array(BUFFER_SIZE)
  analyser.getFloatTimeDomainData(buf)
  const freq = autocorrelate(buf, audioCtx.sampleRate)
  if (freq > 50 && freq < 2000) {
    detectedFreq.value = freq
    const { name, cents } = freqToNote(freq)
    detectedNote.value = name
    centsOff.value = cents
  }
  animFrame = requestAnimationFrame(detect)
}

async function toggleListen() {
  if (isListening.value) {
    isListening.value = false
    cancelAnimationFrame(animFrame)
    stream?.getTracks().forEach(t => t.stop())
    audioCtx?.close(); audioCtx = null
    detectedFreq.value = null; detectedNote.value = ''; centsOff.value = null
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
    detect()
  } catch (e) {
    error.value = `Accès micro refusé : ${e.message}`
  }
}

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
  stream?.getTracks().forEach(t => t.stop())
  audioCtx?.close()
})
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
.guitar-strings {}
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
.tracking-wide { letter-spacing: 0.08em; }
</style>
