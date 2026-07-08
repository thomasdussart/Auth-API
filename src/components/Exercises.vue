<template>
  <v-card color="surface" rounded="xl" class="pa-4">
    <v-card-title class="text-center text-h6 text-medium-emphasis mb-2">
      <v-icon start color="primary">mdi-music-note-eighth</v-icon>
      Exercices
    </v-card-title>

    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" sm="6">
          <v-select
            v-model="selectedCategory"
            :items="categories"
            label="Catégorie"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-tag-outline"
            hide-details
            @update:model-value="selectedExercise = null"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="selectedDifficulty"
            :items="difficulties"
            label="Difficulté"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-signal"
            hide-details
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="5">
          <div class="text-caption text-medium-emphasis text-uppercase mb-2 tracking-wide">
            {{ filteredExercises.length }} exercice(s)
          </div>
          <v-list density="compact" nav class="exercise-list pa-0">
            <v-list-item
              v-for="ex in filteredExercises"
              :key="ex.id"
              :value="ex"
              :active="selectedExercise?.id === ex.id"
              active-color="primary"
              rounded="lg"
              class="mb-1"
              @click="selectExercise(ex)"
            >
              <template #prepend>
                <v-icon :color="difficultyColor(ex.difficulty)" size="small">
                  {{ difficultyIcon(ex.difficulty) }}
                </v-icon>
              </template>
              <v-list-item-title class="text-body-2">{{ ex.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ ex.category }}</v-list-item-subtitle>
              <template #append>
                <v-chip size="x-small" :color="difficultyColor(ex.difficulty)" variant="tonal">
                  {{ ex.difficulty }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12" md="7">
          <div v-if="selectedExercise" class="exercise-detail">
            <div class="d-flex align-center gap-2 mb-3">
              <h3 class="text-h6">{{ selectedExercise.name }}</h3>
              <v-chip size="small" :color="difficultyColor(selectedExercise.difficulty)" variant="tonal">
                {{ selectedExercise.difficulty }}
              </v-chip>
            </div>

            <v-chip-group class="mb-3">
              <v-chip v-for="tag in selectedExercise.tags" :key="tag" size="x-small" variant="outlined">
                {{ tag }}
              </v-chip>
            </v-chip-group>

            <ExerciseInfo :exercise="selectedExercise" class="mb-4" />

            <v-card variant="tonal" color="primary" rounded="lg" class="pa-3 mb-4">
              <v-row>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis">Durée conseillée</div>
                  <div class="text-h6 font-weight-bold">{{ selectedExercise.durationMin }} min</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis">BPM de départ</div>
                  <div class="text-h6 font-weight-bold">{{ selectedExercise.startBpm }}</div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis">Objectif</div>
                  <div class="text-h6 font-weight-bold">{{ selectedExercise.targetBpm }}</div>
                </v-col>
              </v-row>
            </v-card>

            <v-btn
              color="primary" variant="flat" prepend-icon="mdi-play"
              @click="$emit('start-exercise', selectedExercise)"
            >
              Lancer l'exercice
            </v-btn>
          </div>

          <div v-else class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-icon size="64" class="mb-4" color="surface-variant">mdi-guitar-acoustic</v-icon>
            <p class="text-body-2">Sélectionnez un exercice pour voir les détails</p>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import ExerciseInfo from './ExerciseInfo.vue'
import { exercises, categories, difficulties, difficultyColor, difficultyIcon } from '../data/exercises'

defineEmits(['start-exercise'])

const selectedCategory = ref('Tous')
const selectedDifficulty = ref('Tous')
const selectedExercise = ref(null)

const filteredExercises = computed(() => {
  return exercises.filter(ex => {
    const catOk = selectedCategory.value === 'Tous' || ex.category === selectedCategory.value
    const diffOk = selectedDifficulty.value === 'Tous' || ex.difficulty === selectedDifficulty.value
    return catOk && diffOk
  })
})

function selectExercise(ex) {
  selectedExercise.value = selectedExercise.value?.id === ex.id ? null : ex
}

</script>

<style scoped>
.exercise-list { background: transparent !important; }

.exercise-detail { height: 100%; }
</style>
