<template>
  <div>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ exercise.description }}</p>

    <div class="instructions-card pa-3 rounded-lg mb-4">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-3 tracking-wide">
        <v-icon size="x-small" class="mr-1">mdi-format-list-numbered</v-icon>Instructions
      </div>
      <ol class="pl-4">
        <li
          v-for="(step, i) in exercise.steps"
          :key="i"
          class="text-body-2 text-white mb-2"
        >{{ step }}</li>
      </ol>
    </div>

    <div v-if="exercise.tab" class="tab-card pa-3 rounded-lg">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2 tracking-wide">
        <v-icon size="x-small" class="mr-1">mdi-music</v-icon>Tablature
      </div>
      <pre class="tab-display">{{ exercise.tab }}</pre>
    </div>
  </div>
</template>

<script setup>
defineProps({
  exercise: { type: Object, required: true },
})
</script>

<style scoped>
.instructions-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(232, 168, 32, 0.25);
}

.tab-card {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(232, 168, 32, 0.3);
}

.tab-display {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #e8c870;
  white-space: pre;
  overflow-x: auto;
  line-height: 1.8;
}
</style>
