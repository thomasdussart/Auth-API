import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './assets/main.css'
import App from './App.vue'

// Pas d'import global des composants : vite-plugin-vuetify (autoImport)
// n'inclut dans le bundle que ceux réellement utilisés.
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#0f0f14',
          surface: '#1a1a24',
          'surface-variant': '#242433',
          primary: '#e8a820',
          secondary: '#c4721a',
          accent: '#e8a820',
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          info: '#2196f3',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
})

createApp(App).use(vuetify).mount('#app')
