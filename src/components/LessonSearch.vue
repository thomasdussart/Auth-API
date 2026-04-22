<template>
  <v-card color="surface" rounded="xl" class="pa-4">
    <v-card-title class="text-center text-h6 text-medium-emphasis mb-2">
      <v-icon start color="primary">mdi-magnify</v-icon>
      Recherche de leçons
    </v-card-title>

    <v-card-text>
      <!-- API Key setup -->
      <v-expand-transition>
        <v-alert
          v-if="!apiKey"
          type="info"
          variant="tonal"
          class="mb-4"
          icon="mdi-key-outline"
        >
          <p class="text-body-2 mb-2">
            Une clé API YouTube gratuite est requise.
            Obtenez-la en 2 minutes sur
            <a href="https://console.cloud.google.com" target="_blank" rel="noopener" class="text-primary">
              console.cloud.google.com
            </a>
            → <strong>APIs & Services → YouTube Data API v3 → Credentials</strong>.
          </p>
          <p class="text-caption text-medium-emphasis">Quota gratuit : ~100 recherches/jour.</p>
        </v-alert>
      </v-expand-transition>

      <v-row class="mb-4">
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="query"
            label="Rechercher une leçon de guitare…"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            @keyup.enter="search"
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn
            color="primary"
            block
            height="40"
            prepend-icon="mdi-youtube"
            :loading="loading"
            :disabled="!query.trim() || !apiKey"
            @click="search"
          >
            Rechercher
          </v-btn>
        </v-col>
      </v-row>

      <!-- API key field (collapsible) -->
      <v-expansion-panels v-model="keyPanel" class="mb-4">
        <v-expansion-panel value="key" rounded="lg" color="surface-variant" elevation="0">
          <v-expansion-panel-title density="compact" class="text-caption text-medium-emphasis">
            <v-icon size="small" class="mr-2">mdi-key-variant</v-icon>
            {{ apiKey ? 'Clé API configurée ✓' : 'Configurer la clé API YouTube' }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-text-field
              v-model="apiKeyInput"
              label="Clé API YouTube Data v3"
              variant="outlined"
              density="compact"
              type="password"
              prepend-inner-icon="mdi-lock-outline"
              placeholder="AIza..."
              hide-details
              class="mb-3"
            />
            <div class="d-flex gap-2">
              <v-btn color="primary" size="small" variant="flat" @click="saveKey">
                Enregistrer
              </v-btn>
              <v-btn v-if="apiKey" color="error" size="small" variant="text" @click="clearKey">
                Supprimer
              </v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Quick tags -->
      <div class="d-flex flex-wrap gap-2 mb-5">
        <v-chip
          v-for="tag in quickTags"
          :key="tag"
          size="small"
          variant="outlined"
          color="primary"
          class="cursor-pointer"
          @click="applyTag(tag)"
        >{{ tag }}</v-chip>
      </div>

      <!-- Error -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="error"
        closable
        @click:close="error = ''"
      />

      <!-- Player -->
      <v-dialog v-model="playerOpen" max-width="800">
        <v-card color="surface" rounded="xl">
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            <span class="text-body-1 font-weight-medium" style="max-width:600px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ activeVideo?.title }}
            </span>
            <v-btn icon="mdi-close" variant="text" @click="closePlayer" />
          </v-card-title>
          <div class="player-wrapper">
            <iframe
              v-if="activeVideo"
              :src="`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <v-card-actions class="pa-4">
            <v-chip size="small" color="surface-variant" variant="flat" prepend-icon="mdi-account">
              {{ activeVideo?.channel }}
            </v-chip>
            <v-spacer />
            <v-btn
              variant="text"
              size="small"
              color="primary"
              prepend-icon="mdi-open-in-new"
              :href="`https://www.youtube.com/watch?v=${activeVideo?.videoId}`"
              target="_blank"
              rel="noopener"
            >Ouvrir sur YouTube</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Results -->
      <div v-if="results.length">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="text-caption text-medium-emphasis">
            {{ results.length }} résultat(s) pour <strong>« {{ lastQuery }} »</strong>
          </div>
          <v-btn
            variant="text"
            size="small"
            color="medium-emphasis"
            prepend-icon="mdi-refresh"
            @click="results = []; lastQuery = ''"
          >Effacer</v-btn>
        </div>

        <v-row dense>
          <v-col
            v-for="video in results"
            :key="video.videoId"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              color="surface-variant"
              rounded="lg"
              class="video-card cursor-pointer"
              hover
              @click="openPlayer(video)"
            >
              <div class="thumb-wrap">
                <v-img
                  :src="video.thumb"
                  :alt="video.title"
                  aspect-ratio="16/9"
                  cover
                  class="rounded-t-lg"
                >
                  <template #error>
                    <div class="d-flex align-center justify-center" style="height:100%;background:#1a1a24">
                      <v-icon size="48" color="surface-variant">mdi-youtube</v-icon>
                    </div>
                  </template>
                </v-img>
                <div class="play-overlay">
                  <v-icon size="48" color="white">mdi-play-circle</v-icon>
                </div>
                <v-chip
                  v-if="video.duration"
                  size="x-small"
                  class="duration-chip"
                  color="black"
                  variant="flat"
                >{{ video.duration }}</v-chip>
              </div>
              <v-card-text class="pa-3">
                <div class="text-body-2 font-weight-medium video-title mb-1">{{ video.title }}</div>
                <div class="text-caption text-medium-emphasis d-flex align-center gap-1">
                  <v-icon size="12">mdi-account-circle-outline</v-icon>
                  {{ video.channel }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- No results -->
      <div
        v-else-if="searched && !loading"
        class="d-flex flex-column align-center justify-center pa-10 text-medium-emphasis"
      >
        <v-icon size="64" class="mb-4" color="surface-variant">mdi-youtube-off</v-icon>
        <p class="text-body-1 font-weight-medium mb-1">Aucune leçon trouvée</p>
        <p class="text-body-2 text-center">
          Essayez avec d'autres mots-clés — par exemple
          <em>« guitar beginner lesson »</em> ou <em>« fingerpicking tutorial »</em>.
        </p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!loading && !results.length && apiKey"
        class="d-flex flex-column align-center justify-center pa-10 text-medium-emphasis"
      >
        <v-icon size="64" class="mb-4" color="surface-variant">mdi-magnify</v-icon>
        <p class="text-body-2">Tapez votre recherche et appuyez sur Entrée</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const query = ref('')
const lastQuery = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)
const error = ref('')
const activeVideo = ref(null)
const playerOpen = ref(false)
const keyPanel = ref(null)

const apiKey = ref('')
const apiKeyInput = ref('')

const quickTags = [
  'guitare débutant', 'pentatonique', 'fingerpicking', 'barre chord',
  'blues guitar', 'alternate picking', 'guitar solo', 'jazz guitar',
  'fingerstyle', 'guitare classique',
]

onMounted(() => {
  const saved = localStorage.getItem('yt-api-key')
  if (saved) apiKey.value = saved
  else keyPanel.value = 'key'
})

function saveKey() {
  const k = apiKeyInput.value.trim()
  if (!k) return
  apiKey.value = k
  localStorage.setItem('yt-api-key', k)
  keyPanel.value = null
  apiKeyInput.value = ''
}

function clearKey() {
  apiKey.value = ''
  apiKeyInput.value = ''
  localStorage.removeItem('yt-api-key')
  keyPanel.value = 'key'
}

function applyTag(tag) {
  query.value = tag
  search()
}

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return ''
  const h = parseInt(m[1] || 0)
  const min = parseInt(m[2] || 0)
  const s = parseInt(m[3] || 0)
  const pad = v => String(v).padStart(2, '0')
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`
}

async function search() {
  if (!query.value.trim() || !apiKey.value) return
  loading.value = true
  searched.value = false
  error.value = ''
  results.value = []
  lastQuery.value = query.value.trim()

  try {
    const searchTerm = encodeURIComponent(`${lastQuery.value} guitar`)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&type=video&maxResults=12&relevanceLanguage=fr&key=${apiKey.value}`
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    if (searchData.error) {
      error.value = `Erreur API : ${searchData.error.message}`
      return
    }

    const items = searchData.items || []
    if (!items.length) { searched.value = true; return }

    // Fetch durations via videos endpoint
    const ids = items.map(i => i.id.videoId).join(',')
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${apiKey.value}`
    const detailRes = await fetch(detailUrl)
    const detailData = await detailRes.json()
    const durationMap = {}
    for (const v of (detailData.items || [])) {
      durationMap[v.id] = parseDuration(v.contentDetails.duration)
    }

    results.value = items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      duration: durationMap[item.id.videoId] || '',
    }))
  } catch (e) {
    error.value = `Erreur réseau : ${e.message}`
  } finally {
    loading.value = false
    searched.value = true
  }
}

function openPlayer(video) {
  activeVideo.value = video
  playerOpen.value = true
}

function closePlayer() {
  playerOpen.value = false
  setTimeout(() => { activeVideo.value = null }, 300)
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.gap-2 { gap: 8px; }

.thumb-wrap {
  position: relative;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  transition: background 0.2s;
  border-radius: 8px 8px 0 0;
}

.video-card:hover .play-overlay {
  background: rgba(0, 0, 0, 0.45);
}

.play-overlay .v-icon {
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.2s, transform 0.2s;
}

.video-card:hover .play-overlay .v-icon {
  opacity: 1;
  transform: scale(1);
}

.duration-chip {
  position: absolute;
  bottom: 6px;
  right: 6px;
  opacity: 0.9;
}

.video-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.player-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}

.player-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
