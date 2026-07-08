export const categories = ['Tous', 'Gammes', 'Arpèges', 'Accords', 'Légato', 'Picking', 'Rythme', 'Bending']
export const difficulties = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé']

export function difficultyColor(d) {
  return d === 'Débutant' ? 'success' : d === 'Intermédiaire' ? 'warning' : 'error'
}

export function difficultyIcon(d) {
  return d === 'Débutant' ? 'mdi-signal-cellular-1' : d === 'Intermédiaire' ? 'mdi-signal-cellular-2' : 'mdi-signal-cellular-3'
}

export const exercises = [
  {
    id: 1, name: 'Gamme pentatonique mineure (position 1)', category: 'Gammes',
    difficulty: 'Débutant', durationMin: 10, startBpm: 60, targetBpm: 120,
    tags: ['pentatonique', 'position 1', 'Am'],
    description: 'La gamme pentatonique mineure est la base du blues, du rock et de la soul. Maîtrisez cette position fondamentale à mi-manche.',
    steps: [
      'Placez votre index sur le 5e frette de la corde E grave',
      'Jouez la gamme en montant : E-A-D-G-B-e',
      'Redescendez en gardant les mêmes doigtés',
      'Commencez lentement avec le métronome',
      'Augmentez le tempo progressivement (+5 BPM dès que c\'est fluide)',
    ],
    tab: `e|--5-8------|\nB|--5-8------|\nG|--5-7------|\nD|--5-7------|\nA|--5-7------|\nE|--5-8------|`,
  },
  {
    id: 2, name: 'Gamme majeure (do majeur)', category: 'Gammes',
    difficulty: 'Débutant', durationMin: 10, startBpm: 60, targetBpm: 100,
    tags: ['do majeur', 'gamme majeure', 'CAGED'],
    description: 'La gamme majeure de do est le point de départ de la théorie musicale. Jouez-la en position ouverte sur le manche.',
    steps: [
      'Partez de la corde A à vide (do sur case 3)',
      'Suivez le schéma de doigtés indiqué',
      'Articulez chaque note clairement',
      'Travaillez lentement puis montez en tempo',
    ],
    tab: `e|--------0-1-3-|\nB|------0-1-3---|\nG|----0-2-------|\nD|--0-2-3-------|\nA|--3-----------|\nE|--------------|`,
  },
  {
    id: 3, name: 'Exercice chromatique 1-2-3-4', category: 'Légato',
    difficulty: 'Débutant', durationMin: 5, startBpm: 50, targetBpm: 120,
    tags: ['chromatique', 'technique', 'doigtés'],
    description: 'Exercice fondamental pour développer l\'indépendance des doigts et la coordination main gauche/droite.',
    steps: [
      'Posez chaque doigt sur des frettes consécutives (index=1, majeur=2, annulaire=3, auriculaire=4)',
      'Jouez 1-2-3-4 sur chaque corde',
      'Descendez de la corde e vers la corde E',
      'Gardez tous les doigts posés (ne levez pas le doigt précédent)',
      'Veillez à alterner le médiator : bas/haut/bas/haut',
    ],
    tab: `e|--1-2-3-4----------|\nB|----------1-2-3-4--|\nG|...                |\nD|...                |`,
  },
  {
    id: 4, name: 'Arpège Am - Em - F - C', category: 'Arpèges',
    difficulty: 'Intermédiaire', durationMin: 15, startBpm: 60, targetBpm: 100,
    tags: ['arpège', 'fingerpicking', 'accords ouverts'],
    description: 'Progression classique en arpège. Travaillez la fluidité du picking main droite sur des accords fondamentaux.',
    steps: [
      'Apprenez les positions d\'accord Am, Em, F, C',
      'Jouez les notes une par une avec les doigts : pouce (graves), index (G), majeur (B), annulaire (e)',
      'Enchaînez les accords sans décoller les doigts de gauche trop tôt',
      'Travaillez d\'abord chaque accord séparément',
    ],
    tab: `Am:\ne|--0--------|\nB|----1------|\nG|------2----|\nD|--------2--|\nA|--0--------|\nE|-----------|`,
  },
  {
    id: 5, name: 'Palm muting + power chords', category: 'Rythme',
    difficulty: 'Débutant', durationMin: 10, startBpm: 80, targetBpm: 160,
    tags: ['power chord', 'palm mute', 'rock', 'médiator'],
    description: 'Technique de base du rock et du metal. Le palm muting donne un son percussif et agressif idéal pour les riffs.',
    steps: [
      'Posez le tranchant de la main sur le chevalet',
      'Jouez un power chord E5 (frettes 0 et 2 sur E et A)',
      'Variez la pression de la main pour obtenir différentes quantités de mute',
      'Alternez notes mutées et non mutées selon le riff',
    ],
    tab: `E|--0-0-0-0-0-0-3-3-|\nA|--2-2-2-2-2-2-5-5-|\nD|--2-2-2-2-2-2-5-5-|\n   PM PM PM PM`,
  },
  {
    id: 6, name: 'Legato : hammer-on & pull-off', category: 'Légato',
    difficulty: 'Intermédiaire', durationMin: 10, startBpm: 60, targetBpm: 120,
    tags: ['hammer-on', 'pull-off', 'légato', 'fluidité'],
    description: 'Le légato permet de jouer des phrases rapides et fluides sans utiliser le médiator sur chaque note.',
    steps: [
      'Jouez une note avec le médiator (ex: 5e case)',
      'Sans toucher au médiator, frappez la 7e case avec l\'annulaire (hammer-on)',
      'Retirez l\'annulaire vers le bas pour sonner la 5e case (pull-off)',
      'Commencez sur une corde, puis traversez tout le manche',
    ],
    tab: `e|--5h7p5---------|\nB|--------5h7p5---|\nG|...              |`,
  },
  {
    id: 7, name: 'Alternate picking (gamme pentatonique)', category: 'Picking',
    difficulty: 'Intermédiaire', durationMin: 15, startBpm: 70, targetBpm: 150,
    tags: ['alternate picking', 'picking', 'technique', 'pentatonique'],
    description: 'Développez la vitesse et la précision du médiator avec l\'alternate picking appliqué à la gamme pentatonique.',
    steps: [
      'Maintenez un mouvement de médiator strict : bas/haut/bas/haut',
      'Ne brisez jamais l\'alternance, même en changeant de corde',
      'Commencez très lentement pour que la mémoire musculaire s\'installe',
      'Augmentez de 5 BPM par session',
      'Vérifiez régulièrement avec un miroir que votre poignet est détendu',
    ],
    tab: `e|--5↓8↑-----------|\nB|-----↓5↑8↓------|\nG|---------↑5↓7↑--|\nD|...               |`,
  },
  {
    id: 8, name: 'Bending (demi-ton et ton)', category: 'Bending',
    difficulty: 'Intermédiaire', durationMin: 10, startBpm: 50, targetBpm: 80,
    tags: ['bending', 'expressivité', 'blues', 'rock'],
    description: 'Le bending est l\'une des techniques les plus expressives de la guitare. Faites chanter vos notes.',
    steps: [
      'Posez l\'annulaire sur la 7e case de la corde B, avec index et majeur en soutien',
      'Poussez la corde vers le haut avec les 3 doigts pour monter d\'un ton (vers la 9e case)',
      'Revenez en position initiale (release)',
      'Vérifiez l\'intonation avec l\'accordeur ou en comparant à la note cible',
      'Travaillez les bends d\'un demi-ton et d\'un ton complet',
    ],
    tab: `B|--7b9--7b9r7--7b(9)--|\n     ↑          ↑`,
  },
  {
    id: 9, name: 'Sweep picking 3 cordes', category: 'Picking',
    difficulty: 'Avancé', durationMin: 20, startBpm: 40, targetBpm: 100,
    tags: ['sweep picking', 'arpège', 'technique avancée', 'métal'],
    description: 'Le sweep picking est une technique avancée pour jouer des arpèges à très haute vitesse d\'un seul mouvement de médiator.',
    steps: [
      'Apprenez d\'abord la position Am arpège sur 3 cordes (D-G-B)',
      'Balayez le médiator vers le bas en un seul mouvement fluide',
      'Chaque doigt gauche se pose et se lève immédiatement (pas de barré)',
      'Remontez avec un seul mouvement vers le haut',
      'Commencez à 40 BPM — la précision prime sur la vitesse',
    ],
    tab: `B|----5-----------|\nG|------6---------|\nD|--------7-------|\nB|----5-----------|\n   ↓  ↓  ↓  ↑  ↑`,
  },
  {
    id: 10, name: 'Gamme blues (6 notes)', category: 'Gammes',
    difficulty: 'Intermédiaire', durationMin: 10, startBpm: 60, targetBpm: 120,
    tags: ['blues', 'gamme blues', 'improvisation'],
    description: 'La gamme blues ajoute une note ♭5 à la pentatonique mineure pour donner ce son bluesy caractéristique.',
    steps: [
      'Partez de la gamme pentatonique mineure (position 1)',
      'Ajoutez la note ♭5 entre le 4 et le 5 de la gamme',
      'Utilisez cette note de passage pour créer des bends et glissements',
      'Improvisez sur un backing track en Am ou E7',
    ],
    tab: `e|--5-8-----------|\nB|--5-6-8---------|\nG|--5-6-7---------|\nD|--5-7-----------|\nA|--5-7-----------|\nE|--5-8-----------|`,
  },
]
