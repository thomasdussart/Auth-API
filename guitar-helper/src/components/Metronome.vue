<template>
  <v-card color="surface" rounded="xl" class="pa-4">
    <v-card-title class="text-center text-h6 text-medium-emphasis mb-2">
      <v-icon start color="primary">mdi-metronome</v-icon>
      Métronome
    </v-card-title>

    <v-card-text>
      <div class="d-flex justify-center mb-4">
        <div class="beat-row d-flex gap-3">
          <div
            v-for="n in beatsPerBar"
            :key="n"
            :class="['beat-dot', { active: currentBeat === n - 1, accent: n === 1 && currentBeat === 0 }]"
          />
        </div>
      </div>

      <div class="text-center mb-1">
        <span class="text-h2 font-weight-black" style="font-variant-numeric: tabular-nums;">{{ bpm }}</span>
        <span class="text-h6 text-medium-emphasis ml-2">BPM</span>
      </div>
      <div class="text-center text-body-2 text-primary font-weight-medium mb-4" style="font-style:italic">
        {{ tempoName }}
      </div>

      <div class="d-flex align-center gap-3 mb-5">
        <v-btn variant="tonal" density="compact" @click="adjustBpm(-10)">−10</v-btn>
        <v-btn variant="tonal" density="compact" size="small" @click="adjustBpm(-1)">−1</v-btn>
        <v-slider
          v-model="bpm"
          min="30" max="250" step="1"
          color="primary"
          hide-details
          @update:model-value="restart"
        />
        <v-btn variant="tonal" density="compact" size="small" @click="adjustBpm(1)">+1</v-btn>
        <v-btn variant="tonal" density="compact" @click="adjustBpm(10)">+10</v-btn>
      </div>

      <v-row class="mb-4">
        <v-col cols="12" sm="6">
          <div class="text-caption text-medium-emphasis text-uppercase mb-2 tracking-wide">Temps par mesure</div>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              v-for="n in [2,3,4,5,6,7]" :key="n"
              :variant="beatsPerBar === n ? 'flat' : 'outlined'"
              :color="beatsPerBar === n ? 'primary' : undefined"
              size="small" rounded @click="setBeats(n)"
            >{{ n }}/4</v-btn>
          </div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-medium-emphasis text-uppercase mb-2 tracking-wide">Subdivision</div>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              v-for="s in subdivisions" :key="s.value"
              :variant="subdivision === s.value ? 'flat' : 'outlined'"
              :color="subdivision === s.value ? 'primary' : undefined"
              size="small" rounded @click="setSubdivision(s.value)"
            >{{ s.label }}</v-btn>
          </div>
        </v-col>
      </v-row>

      <div class="text-caption text-medium-emphasis text-uppercase mb-2 tracking-wide">Presets de tempo</div>
      <div class="d-flex flex-wrap gap-2 mb-5">
        <v-chip
          v-for="t in tempos" :key="t.name"
          @click="applyTempo(t)"
          variant="outlined" color="surface-variant"
          class="cursor-pointer tempo-chip"
        >
          <strong>{{ t.name }}</strong>&nbsp;
          <span class="text-medium-emphasis text-caption">{{ t.min }}–{{ t.max }}</span>
        </v-chip>
      </div>

      <div class="d-flex align-center gap-3 mb-5">
        <v-icon size="small">mdi-volume-low</v-icon>
        <v-slider v-model="volume" min="0" max="100" color="primary" hide-details />
        <v-icon size="small">mdi-volume-high</v-icon>
      </div>

      <div class="d-flex justify-center">
        <v-btn
          :color="isPlaying ? 'error' : 'primary'"
          :prepend-icon="isPlaying ? 'mdi-stop' : 'mdi-play'"
          size="large" rounded="pill" min-width="180"
          @click="toggle"
        >
          {{ isPlaying ? 'Stop' : 'Start' }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const bpm = ref(100)
const beatsPerBar = ref(4)
const subdivision = ref(1)
const volume = ref(70)
const isPlaying = ref(false)
const currentBeat = ref(-1)

let audioCtx = null
let nextNoteTime = 0
let scheduler = null
let beatQueue = []
let currentBeatCount = 0

const subdivisions = [
  { value: 1, label: '♩ Noires' },
  { value: 2, label: '♪ Croches' },
  { value: 4, label: '♬ Double' },
]

const tempos = [
  { name: 'Largo', min: 40, max: 60 },
  { name: 'Adagio', min: 60, max: 76 },
  { name: 'Andante', min: 76, max: 108 },
  { name: 'Moderato', min: 108, max: 120 },
  { name: 'Allegro', min: 120, max: 168 },
  { name: 'Presto', min: 168, max: 200 },
]

const tempoName = computed(() => {
  const t = tempos.find(t => bpm.value >= t.min && bpm.value <= t.max)
  return t ? t.name : bpm.value < 40 ? 'Grave' : 'Prestissimo'
})

function setBeats(n) {
  beatsPerBar.value = n; currentBeatCount = 0
  if (isPlaying.value) restart()
}
function setSubdivision(s) {
  subdivision.value = s
  if (isPlaying.value) restart()
}
function adjustBpm(delta) {
  bpm.value = Math.max(30, Math.min(250, bpm.value + delta))
  restart()
}
function applyTempo(t) {
  bpm.value = Math.round((t.min + t.max) / 2); restart()
}

function scheduleNote(time, isAccent, isSubdiv) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain); gain.connect(audioCtx.destination)
  if (isAccent) {
    osc.frequency.value = 1200
    gain.gain.setValueAtTime((volume.value / 100) * 0.6, time)
  } else if (isSubdiv) {
    osc.frequency.value = 600
    gain.gain.setValueAtTime((volume.value / 100) * 0.15, time)
  } else {
    osc.frequency.value = 900
    gain.gain.setValueAtTime((volume.value / 100) * 0.4, time)
  }
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)
  osc.start(time); osc.stop(time + 0.04)
}

function scheduleBeat() {
  const spb = 60 / bpm.value
  const sps = spb / subdivision.value
  while (nextNoteTime < audioCtx.currentTime + 0.1) {
    const beatIndex = Math.floor(currentBeatCount / subdivision.value) % beatsPerBar.value
    const subdivIndex = currentBeatCount % subdivision.value
    beatQueue.push({ time: nextNoteTime, beat: beatIndex })
    scheduleNote(nextNoteTime, beatIndex === 0 && subdivIndex === 0, subdivIndex !== 0)
    currentBeatCount++
    nextNoteTime += sps
  }
}

function processBeatQueue() {
  const now = audioCtx ? audioCtx.currentTime : 0
  while (beatQueue.length && beatQueue[0].time < now + 0.015) {
    currentBeat.value = beatQueue.shift().beat
  }
}

function start() {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  currentBeatCount = 0; nextNoteTime = audioCtx.currentTime + 0.05; beatQueue = []
  scheduler = setInterval(() => { scheduleBeat(); processBeatQueue() }, 25)
  isPlaying.value = true
}
function stop() {
  clearInterval(scheduler); isPlaying.value = false; currentBeat.value = -1; beatQueue = []
}
function restart() { if (isPlaying.value) { stop(); start() } }
function toggle() { isPlaying.value ? stop() : start() }
onUnmounted(stop)
</script>

<style scoped>
.beat-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface-variant));
  border: 2px solid rgba(255,255,255,0.08);
  transition: background 0.05s, box-shadow 0.05s;
}
.beat-dot.active {
  background: rgb(var(--v-theme-info));
  box-shadow: 0 0 14px rgba(33,150,243,0.7);
}
.beat-dot.accent {
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 18px rgba(232,168,32,0.8);
}
.tracking-wide { letter-spacing: 0.08em; }
.tempo-chip { font-size: 0.78rem; }
.cursor-pointer { cursor: pointer; }
</style>
