# 🎸 Guitar Helper

Application de pratique guitare — Vue.js 3 + Vuetify 3 + Vite.

## Fonctionnalités

- **Exercices** — 10 exercices curatés (gammes, arpèges, légato, picking, bending…) avec tablatures et instructions pas-à-pas
- **Métronome** — BPM 30–250, signatures rythmiques, subdivisions, presets Largo→Presto
- **Accordeur** — détection de pitch en temps réel via microphone (Web Audio API)
- **Timer** — compte à rebours / chronomètre, s'auto-configure sur la durée de l'exercice
- **Leçons YouTube** — recherche de tutoriels via YouTube Data API v3, player intégré

## Installation

```bash
npm install
npm run dev
```

## Configuration

Pour la recherche de leçons YouTube, une clé API YouTube Data v3 est nécessaire (gratuite, ~100 recherches/jour).  
Obtenez-la sur [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → YouTube Data API v3 → Credentials.  
La clé se saisit directement dans l'interface et est stockée en `localStorage`.
