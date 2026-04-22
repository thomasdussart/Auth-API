<template>
  <v-card color="surface" rounded="xl" class="pa-4">
    <v-card-title class="text-center text-h6 text-medium-emphasis mb-2">
      <v-icon start color="primary">mdi-timer-outline</v-icon>
      Timer
    </v-card-title>

    <v-card-text>
      <div class="d-flex justify-center mb-6">
        <v-progress-circular
          :model-value="progressPercent"
          :color="isDone ? 'success' : isRunning ? 'primary' : 'surface-variant'"
          size="180"
          width="8"
          bg-color="surface-variant"
        >
          <div class="text-center">
            <div class="text-h3 font-weight-bold" style="font-variant-numeric: tabular-nums;">
              {{ display }}
            </div>
            <div v-if="isDone" class="text-caption text-success font-weight-bold">Terminé !</div>
            <div v-else class="text-caption text-medium-emphasis">{{ tempoLabel }}</div>
          </div>
        </v-progress-circular>
      </div>

      <v-btn-toggle v-model="mode" mandatory color="primary" density="comfortable" class="mb-5 d-flex justify-center" rounded="lg">
        <v-btn value="countdown" prepend-icon="mdi-timer-sand">Compte à rebours</v-btn>
        <v-btn value="stopwatch" prepend-icon="mdi-timer">Chronomètre</v-btn>
      </v-btn-toggle>

      <div v-if="mode === 'countdown'">
        <div class="d-flex align-center justify-center gap-4 mb-4">
          <div class="text-center">
            <div class="text-caption text-medium-emphasis mb-2">MINUTES</div>
            <div class="d-flex align-center gap-2">
              <v-btn icon="mdi-minus" variant="tonal" size="small" @click="adjustTime('min', -1)" />
              <span class="text-h5 font-weight-bold" style="min-width:40px;text-align:center">
                {{ String(targetMin).padStart(2,'0') }}
              </span>
              <v-btn icon="mdi-plus" variant="tonal" size="small" @click="adjustTime('min', 1)" />
            </div>
          </div>
          <div class="text-h4 text-medium-emphasis mt-4">:</div>
          <div class="text-center">
            <div class="text-caption text-medium-emphasis mb-2">SECONDES</div>
            <div class="d-flex align-center gap-2">
              <v-btn icon="mdi-minus" variant="tonal" size="small" @click="adjustTime('sec', -10)" />
              <span class="text-h5 font-weight-bold" style="min-width:40px;text-align:center">
                {{ String(targetSec).padStart(2,'0') }}
              </span>
              <v-btn icon="mdi-plus" variant="tonal" size="small" @click="adjustTime('sec', 10)" />
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap justify-center gap-2 mb-4">
          <v-chip
            v-for="p in presets"
            :key="p.label"
            @click="applyPreset(p)"
            variant="outlined"
            color="primary"
            size="small"
            class="cursor-pointer"
          >{{ p.label }}</v-chip>
        </div>
      </div>

      <div class="d-flex justify-center align-center gap-4">
        <v-btn
          icon="mdi-restore"
          variant="tonal"
          size="large"
          @click="reset"
        />
        <v-btn
          :icon="isRunning ? 'mdi-pause' : 'mdi-play'"
          color="primary"
          size="x-large"
          @click="toggle"
          rounded="circle"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const mode = ref('countdown')
const targetMin = ref(5)
const targetSec = ref(0)
const elapsed = ref(0)
const isRunning = ref(false)
const isDone = ref(false)
let interval = null

const presets = [
  { label: '1 min', min: 1, sec: 0 },
  { label: '5 min', min: 5, sec: 0 },
  { label: '10 min', min: 10, sec: 0 },
  { label: '15 min', min: 15, sec: 0 },
  { label: '30 min', min: 30, sec: 0 },
]

const totalTarget = computed(() => targetMin.value * 60 + targetSec.value)

const display = computed(() => {
  let secs = mode.value === 'stopwatch'
    ? elapsed.value
    : Math.max(0, totalTarget.value - elapsed.value)
  return `${String(Math.floor(secs / 60)).padStart(2,'0')}:${String(secs % 60).padStart(2,'0')}`
})

const progressPercent = computed(() => {
  if (mode.value === 'stopwatch') return 100
  if (totalTarget.value === 0) return 0
  return Math.max(0, 100 - (elapsed.value / totalTarget.value) * 100)
})

const tempoLabel = computed(() => {
  if (mode.value === 'stopwatch') return 'en cours'
  const rem = totalTarget.value - elapsed.value
  if (rem <= 0) return ''
  return `${Math.ceil(rem / 60)} min restantes`
})

function setMode(m) { mode.value = m; reset() }
function adjustTime(unit, delta) {
  if (isRunning.value) return
  if (unit === 'min') targetMin.value = Math.max(0, Math.min(99, targetMin.value + delta))
  else targetSec.value = Math.max(0, Math.min(50, targetSec.value + delta))
  elapsed.value = 0; isDone.value = false
}
function applyPreset(p) {
  if (isRunning.value) return
  targetMin.value = p.min; targetSec.value = p.sec
  elapsed.value = 0; isDone.value = false
}
function toggle() {
  if (isDone.value) { reset(); return }
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    interval = setInterval(() => {
      elapsed.value++
      if (mode.value === 'countdown' && elapsed.value >= totalTarget.value) {
        isRunning.value = false; isDone.value = true
        clearInterval(interval); playDone()
      }
    }, 1000)
  } else clearInterval(interval)
}
function reset() {
  clearInterval(interval); isRunning.value = false; isDone.value = false; elapsed.value = 0
}
function playDone() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start(); osc.stop(ctx.currentTime + 0.8)
  } catch {}
}
onUnmounted(() => clearInterval(interval))
</script>
