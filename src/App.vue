<template>
  <v-app theme="dark">
    <v-app-bar elevation="0" color="surface" border="b">
      <template #prepend>
        <v-app-bar-title>
          <span class="text-h6 font-weight-bold">🎸 Guitar Helper</span>
        </v-app-bar-title>
      </template>
      <template #append>
        <v-chip color="primary" variant="tonal" size="small" prepend-icon="mdi-guitar-acoustic" class="mr-2">
          Pratique quotidienne
        </v-chip>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      :rail="rail"
      permanent
      color="surface"
      border="e"
    >
      <v-list density="compact" nav class="mt-2">
        <v-list-item
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :prepend-icon="tab.icon"
          :title="tab.label"
          :active="activeTab === tab.value"
          active-color="primary"
          rounded="lg"
          class="mb-1"
          @click="activeTab = tab.value"
        />
      </v-list>

      <template #append>
        <v-list density="compact" nav>
          <v-list-item
            :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            :title="rail ? '' : 'Réduire'"
            @click="rail = !rail"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-6" style="max-width: 1100px;">
        <v-row>
          <v-col cols="12">
            <div class="d-flex align-center gap-3 mb-6">
              <v-icon size="28" color="primary">{{ currentTab.icon }}</v-icon>
              <div>
                <h1 class="text-h5 font-weight-bold">{{ currentTab.label }}</h1>
                <p class="text-body-2 text-medium-emphasis">{{ currentTab.subtitle }}</p>
              </div>
            </div>

            <Transition name="fade" mode="out-in">
              <component
                :is="currentComponent"
                :key="activeTab"
                v-bind="activeTab === 'timer' ? { exercise: activeExercise } : {}"
                @start-exercise="handleStartExercise"
                @clear-exercise="activeExercise = null"
              />
            </Transition>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import Timer from './components/Timer.vue'
import Metronome from './components/Metronome.vue'
import Tuner from './components/Tuner.vue'
import Exercises from './components/Exercises.vue'
import LessonSearch from './components/LessonSearch.vue'

const activeTab = ref('exercises')
const rail = ref(false)
const activeExercise = ref(null)

const snackbar = ref({ show: false, text: '', color: 'primary' })

const tabs = [
  {
    value: 'exercises',
    label: 'Exercices',
    icon: 'mdi-music-note-eighth',
    subtitle: 'Choisissez et pratiquez vos exercices de guitare',
    component: markRaw(Exercises),
  },
  {
    value: 'metronome',
    label: 'Métronome',
    icon: 'mdi-metronome',
    subtitle: 'Gardez le rythme et travaillez votre timing',
    component: markRaw(Metronome),
  },
  {
    value: 'tuner',
    label: 'Accordeur',
    icon: 'mdi-guitar-acoustic',
    subtitle: 'Accordez votre guitare en temps réel',
    component: markRaw(Tuner),
  },
  {
    value: 'timer',
    label: 'Timer',
    icon: 'mdi-timer-outline',
    subtitle: 'Planifiez et chronométrez vos sessions de pratique',
    component: markRaw(Timer),
  },
  {
    value: 'lessons',
    label: 'Leçons YouTube',
    icon: 'mdi-youtube',
    subtitle: 'Recherchez des tutoriels de guitare sur YouTube',
    component: markRaw(LessonSearch),
  },
]

const currentTab = computed(() => tabs.find(t => t.value === activeTab.value))
const currentComponent = computed(() => currentTab.value?.component)

function handleStartExercise(exercise) {
  activeExercise.value = exercise
  activeTab.value = 'timer'
  snackbar.value = {
    show: true,
    text: `Exercice lancé : ${exercise.name} — ${exercise.durationMin} min`,
    color: 'primary',
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.v-application { background: #0f0f14 !important; }
</style>
