<template>
  <div>
    <v-row>
      <!-- Timer column -->
      <v-col cols="12" :md="exercise ? 5 : 12">
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
              <v-btn icon="mdi-restore" variant="tonal" size="large" @click="reset" />
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
      </v-col>

      <!-- Exercise context column -->
      <v-col v-if="exercise" cols="12" md="7">
        <v-card color="surface" rounded="xl" class="pa-4 h-100">
          <v-card-title class="d-flex align-center justify-space-between mb-1">
            <div class="d-flex align-center gap-2">
              <v-icon color="primary" size="small">mdi-music-note-eighth</v-icon>
              <span class="text-body-1 font-weight-bold">{{ exercise.name }}</span>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              density="compact"
              @click="$emit('clear-exercise')"
            />
          </v-card-title>

          <v-card-text class="pa-0 pt-2">
            <div class="d-flex gap-3 mb-4">
              <v-chip size="small" :color="difficultyColor(exercise.difficulty)" variant="tonal" prepend-icon="mdi-signal">
                {{ exercise.difficulty }}
              </v-chip>
              <v-chip size="small" color="surface-variant" variant="flat" prepend-icon="mdi-timer-outline">
                {{ exercise.durationMin }} min
              </v-chip>
              <v-chip size="small" color="surface-variant" variant="flat" prepend-icon="mdi-metronome">
                {{ exercise.startBpm }} → {{ exercise.targetBpm }} BPM
              </v-chip>
            </div>

            <ExerciseInfo :exercise="exercise" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import ExerciseInfo from './ExerciseInfo.vue'
import { difficultyColor } from '../data/exercises'

const props = defineProps({
  exercise: { type: Object, default: null },
})

defineEmits(['clear-exercise'])

const mode = ref('countdown')
const targetMin = ref(5)
const targetSec = ref(0)
const elapsed = ref(0)
const isRunning = ref(false)
const isDone = ref(false)

// Chronométrage basé sur l'horloge (performance.now) plutôt qu'un compteur
// setInterval : pas de dérive, et le temps reste juste même si le navigateur
// throttle les timers en arrière-plan.
let interval = null
let startStamp = 0
let accumulatedMs = 0

const presets = [
  { label: '1 min', min: 1, sec: 0 },
  { label: '5 min', min: 5, sec: 0 },
  { label: '10 min', min: 10, sec: 0 },
  { label: '15 min', min: 15, sec: 0 },
  { label: '30 min', min: 30, sec: 0 },
]

// Auto-configure timer when an exercise is passed
watch(() => props.exercise, (ex) => {
  if (!ex) return
  reset()
  mode.value = 'countdown'
  targetMin.value = ex.durationMin
  targetSec.value = 0
}, { immediate: true })

watch(mode, reset)

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

function adjustTime(unit, delta) {
  if (isRunning.value) return
  if (unit === 'min') targetMin.value = Math.max(0, Math.min(99, targetMin.value + delta))
  else targetSec.value = Math.max(0, Math.min(50, targetSec.value + delta))
  accumulatedMs = 0; elapsed.value = 0; isDone.value = false
}
function applyPreset(p) {
  if (isRunning.value) return
  targetMin.value = p.min; targetSec.value = p.sec
  accumulatedMs = 0; elapsed.value = 0; isDone.value = false
}

function tick() {
  const ms = accumulatedMs + (performance.now() - startStamp)
  elapsed.value = Math.floor(ms / 1000)
  if (mode.value === 'countdown' && elapsed.value >= totalTarget.value) {
    elapsed.value = totalTarget.value
    pause()
    isDone.value = true
    playDone()
  }
}

function toggle() {
  if (isDone.value) { reset(); return }
  if (isRunning.value) pause()
  else {
    startStamp = performance.now()
    interval = setInterval(tick, 250)
    isRunning.value = true
  }
}
function pause() {
  if (isRunning.value) accumulatedMs += performance.now() - startStamp
  clearInterval(interval)
  isRunning.value = false
}
function reset() {
  clearInterval(interval)
  isRunning.value = false; isDone.value = false
  accumulatedMs = 0; elapsed.value = 0
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
    osc.onended = () => ctx.close()
    osc.start(); osc.stop(ctx.currentTime + 0.8)
  } catch {}
}

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.h-100 { height: 100%; }
</style>
