// db.js - Base de datos predeterminada y capa de almacenamiento IndexedDB / LocalStorage

const DEFAULT_EXERCISES = [
  // Pecho
  { id: 'bench-press', name: 'Press de Banca Plano con Barra', category: 'Pecho', equipment: 'Barra', isCustom: false, targetReps: '6-10' },
  { id: 'incline-db-press', name: 'Press Inclinado con Mancuernas', category: 'Pecho', equipment: 'Mancuernas', isCustom: false, targetReps: '6-10' },
  { id: 'chest-fly-cable', name: 'Aperturas en Cruce de Poleas', category: 'Pecho', equipment: 'Polea / Cable', isCustom: false, targetReps: '10-15' },
  { id: 'chest-fly-cable-machine', name: 'Mariposa maquina', category: 'Pecho', equipment: 'Máquina', isCustom: false, targetReps: '10-15' },
  { id: 'dips-chest', name: 'Fondos en Paralelas (Pecho)', category: 'Pecho', equipment: 'Peso Corporal', isCustom: false, targetReps: '8-12' },
  { id: 'machine-chest-press', name: 'Press en Máquina Sentado', category: 'Pecho', equipment: 'Máquina', isCustom: false, targetReps: '6-10' },

  // Espalda
  { id: 'deadlift', name: 'Peso Muerto Convencional', category: 'Espalda', equipment: 'Barra', isCustom: false, targetReps: '6-10' },
  { id: 'barbell-row', name: 'Remo con Barra Pendlay / 90°', category: 'Espalda', equipment: 'Barra', isCustom: false, targetReps: '6-10' },
  { id: 'barbell-row-machine', name: 'Remo maquina / 90°', category: 'Espalda', equipment: 'Máquina', isCustom: false, targetReps: '8-12' },
  { id: 'lat-pulldown', name: 'Jalón al Pecho en Polea', category: 'Espalda', equipment: 'Polea / Cable', isCustom: false, targetReps: '6-10' },
  { id: 'lat-pulldown-neutr', name: 'Jalón al Pecho agarre Neutro', category: 'Espalda', equipment: 'Polea / Cable', isCustom: false, targetReps: '8-12' },
  { id: 'pull-ups', name: 'Dominadas Pronas / Neutras', category: 'Espalda', equipment: 'Peso Corporal', isCustom: false, targetReps: '6-10' },
  { id: 'seated-cable-row', name: 'Remo Gironda en Polea Baja', category: 'Espalda', equipment: 'Polea / Cable', isCustom: false, targetReps: '8-12' },

  // Piernas
  { id: 'barbell-squat', name: 'Sentadilla Trasera con Barra', category: 'Piernas', equipment: 'Barra', isCustom: false, targetReps: '6-10' },
  { id: 'leg-press', name: 'Prensa Inclinada a 45°', category: 'Piernas', equipment: 'Máquina', isCustom: false, targetReps: '8-12' },
  { id: 'romanian-deadlift', name: 'Peso Muerto Rumano', category: 'Piernas', equipment: 'Barra', isCustom: false, targetReps: '6-10' },
  { id: 'leg-extension', name: 'Extensión de Cuádriceps', category: 'Piernas', equipment: 'Máquina', isCustom: false, targetReps: '10-15' },
  { id: 'leg-curl', name: 'Curl Femoral Tumbado/Sentado', category: 'Piernas', equipment: 'Máquina', isCustom: false, targetReps: '10-15' },
  { id: 'calf-raise', name: 'Elevación de Gemelos de Pie', category: 'Piernas', equipment: 'Máquina', isCustom: false, targetReps: '8-15' },
  { id: 'bulgarian', name: 'Sentadillas bulgaras', category: 'Piernas', equipment: 'Mancuernas', isCustom: false, targetReps: '8-12' },
  { id: 'hipThrust', name: 'Hip Thrust', category: 'Piernas', equipment: 'Mancuernas', isCustom: false, targetReps: '6-10' },
  { id: 'aductors', name: 'Aductores', category: 'Piernas', equipment: 'Máquina', isCustom: false, targetReps: '12-20' },
  { id: 'abductors', name: 'Abductores', category: 'Piernas', equipment: 'Máquina', isCustom: false, targetReps: '12-20' },

  // Hombros
  { id: 'overhead-press', name: 'Press Militar de Pie con Barra', category: 'Hombros', equipment: 'Barra', isCustom: false, targetReps: '6-10' },
  { id: 'db-shoulder-press', name: 'Press de Hombro con Mancuernas', category: 'Hombros', equipment: 'Mancuernas', isCustom: false, targetReps: '6-10' },
  { id: 'db-shoulder-press-machine', name: 'Press de Hombro', category: 'Hombros', equipment: 'Máquina', isCustom: false, targetReps: '6-10' },
  { id: 'lateral-raises', name: 'Elevaciones Laterales', category: 'Hombros', equipment: 'Polea / Cable', isCustom: false, targetReps: '12-20' },
  { id: 'face-pull', name: 'Face Pull en Polea con Cuerda', category: 'Hombros', equipment: 'Polea / Cable', isCustom: false, targetReps: '12-20' },

  // Brazos
  { id: 'barbell-curl', name: 'Curl de Bíceps con Barra Z', category: 'Brazos', equipment: 'Barra', isCustom: false, targetReps: '8-12' },
  { id: 'bicep-curl-unilateral', name: 'Curl de Bíceps Unilateral', category: 'Brazos', equipment: 'Mancuernas', isCustom: false, targetReps: '10-15' },
  { id: 'db-hammer-curl', name: 'Curl Martillo con Mancuernas', category: 'Brazos', equipment: 'Mancuernas', isCustom: false, targetReps: '8-12' },
  { id: 'tricep-pushdown', name: 'Extensiones de Tríceps en Polea', category: 'Brazos', equipment: 'Polea / Cable', isCustom: false, targetReps: '8-12' },
  { id: 'tricep-aboveHead', name: 'Extensiones de Tríceps encima cabeza', category: 'Brazos', equipment: 'Polea / Cable', isCustom: false, targetReps: '10-15' },
  { id: 'skull-crushers', name: 'Press Francés / Skullcrushers', category: 'Brazos', equipment: 'Barra', isCustom: false, targetReps: '8-12' },

  // Core
  { id: 'hanging-leg-raise', name: 'Elevaciones de Piernas Colgado', category: 'Core', equipment: 'Peso Corporal', isCustom: false, targetReps: '10-15' },
  { id: 'ab-wheel', name: 'Rueda Abdominal (Ab Wheel)', category: 'Core', equipment: 'Otro', isCustom: false, targetReps: '8-12' },
  { id: 'plank', name: 'Plancha Abdominal Isométrica', category: 'Core', equipment: 'Peso Corporal', isCustom: false, targetReps: '30-60s' }
];

const DB = {
  init() {
    if (!localStorage.getItem('it_exercises')) {
      localStorage.setItem('it_exercises', JSON.stringify(DEFAULT_EXERCISES));
    }
    if (!localStorage.getItem('it_routines')) {
      // Rutinas plantilla de ejemplo de 4 días (Hipertrofia - 2 estímulos por semana)
      const sampleRoutines = [
        {
          id: 'rot-dia-1',
          name: 'Día 1 - Upper A',
          description: 'Torso: Pecho, Espalda, Hombro, Brazos',
          exercises: [
            { exerciseId: 'machine-chest-press', exerciseName: 'Press en Máquina Sentado', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'lat-pulldown', exerciseName: 'Jalón al Pecho en Polea', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'db-shoulder-press-machine', exerciseName: 'Press de Hombro', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'barbell-row-machine', exerciseName: 'Remo maquina / 90°', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'chest-fly-cable-machine', exerciseName: 'Mariposa maquina', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales', targetSets: 3, targetReps: '12-20' },
            { exerciseId: 'barbell-curl', exerciseName: 'Curl de Bíceps con Barra Z', targetSets: 2, targetReps: '8-12' },
            { exerciseId: 'tricep-pushdown', exerciseName: 'Extensiones de Tríceps en Polea', targetSets: 2, targetReps: '8-12' }
          ]
        },
        {
          id: 'rot-dia-2',
          name: 'Día 2 - Lower A',
          description: 'Pierna: Sentadilla, Cuádriceps, Femoral, Gemelo, Aductores',
          exercises: [
            { exerciseId: 'barbell-squat', exerciseName: 'Sentadilla Trasera con Barra', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'romanian-deadlift', exerciseName: 'Peso Muerto Rumano', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'leg-press', exerciseName: 'Prensa Inclinada a 45°', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'leg-curl', exerciseName: 'Curl Femoral Tumbado/Sentado', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'leg-extension', exerciseName: 'Extensión de Cuádriceps', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'calf-raise', exerciseName: 'Elevación de Gemelos de Pie', targetSets: 3, targetReps: '8-15' },
            { exerciseId: 'aductors', exerciseName: 'Aductores', targetSets: 2, targetReps: '12-20' }
          ]
        },
        {
          id: 'rot-dia-3',
          name: 'Día 3 - Upper B',
          description: 'Torso: Pecho Inclinado, Remo, Hombro, Face Pull, Brazos',
          exercises: [
            { exerciseId: 'incline-db-press', exerciseName: 'Press Inclinado con Mancuernas', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'barbell-row-machine', exerciseName: 'Remo maquina / 90°', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'lat-pulldown-neutr', exerciseName: 'Jalón al Pecho agarre Neutro', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'db-shoulder-press-machine', exerciseName: 'Press de Hombro', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'face-pull', exerciseName: 'Face Pull en Polea con Cuerda', targetSets: 3, targetReps: '12-20' },
            { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales', targetSets: 3, targetReps: '12-20' },
            { exerciseId: 'bicep-curl-unilateral', exerciseName: 'Curl de Bíceps Unilateral', targetSets: 3, targetReps: '10-15' },
            { exerciseId: 'tricep-aboveHead', exerciseName: 'Extensiones de Tríceps encima cabeza', targetSets: 3, targetReps: '10-15' }
          ]
        },
        {
          id: 'rot-dia-4',
          name: 'Día 4 - Lower B',
          description: 'Pierna: Prensa, Hip Thrust, Búlgara, Femoral, Cuádriceps, Gemelo, Abductores',
          exercises: [
            { exerciseId: 'leg-press', exerciseName: 'Prensa Inclinada a 45°', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'hipThrust', exerciseName: 'Hip Thrust', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'bulgarian', exerciseName: 'Sentadillas bulgaras', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'leg-curl', exerciseName: 'Curl Femoral Tumbado/Sentado', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'leg-extension', exerciseName: 'Extensión de Cuádriceps', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'calf-raise', exerciseName: 'Elevación de Gemelos de Pie', targetSets: 3, targetReps: '10-15' },
            { exerciseId: 'abductors', exerciseName: 'Abductores', targetSets: 2, targetReps: '12-20' }
          ]
        }
      ];
      localStorage.setItem('it_routines', JSON.stringify(sampleRoutines));
    }
    // Actualización de versión de rutinas de ejemplo predeterminadas (versión 4 días hipertrofia con rangos de repeticiones)
    if (localStorage.getItem('it_routines_version') !== 'v4_hypertrophy_reps') {
      const sampleRoutines = [
        {
          id: 'rot-dia-1',
          name: 'Día 1 - Upper A',
          description: 'Torso: Pecho, Espalda, Hombro, Brazos',
          exercises: [
            { exerciseId: 'machine-chest-press', exerciseName: 'Press en Máquina Sentado', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'lat-pulldown', exerciseName: 'Jalón al Pecho en Polea', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'db-shoulder-press-machine', exerciseName: 'Press de Hombro', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'barbell-row-machine', exerciseName: 'Remo maquina / 90°', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'chest-fly-cable-machine', exerciseName: 'Mariposa maquina', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales', targetSets: 3, targetReps: '12-20' },
            { exerciseId: 'barbell-curl', exerciseName: 'Curl de Bíceps con Barra Z', targetSets: 2, targetReps: '8-12' },
            { exerciseId: 'tricep-pushdown', exerciseName: 'Extensiones de Tríceps en Polea', targetSets: 2, targetReps: '8-12' }
          ]
        },
        {
          id: 'rot-dia-2',
          name: 'Día 2 - Lower A',
          description: 'Pierna: Sentadilla, Cuádriceps, Femoral, Gemelo, Aductores',
          exercises: [
            { exerciseId: 'barbell-squat', exerciseName: 'Sentadilla Trasera con Barra', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'romanian-deadlift', exerciseName: 'Peso Muerto Rumano', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'leg-press', exerciseName: 'Prensa Inclinada a 45°', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'leg-curl', exerciseName: 'Curl Femoral Tumbado/Sentado', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'leg-extension', exerciseName: 'Extensión de Cuádriceps', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'calf-raise', exerciseName: 'Elevación de Gemelos de Pie', targetSets: 3, targetReps: '8-15' },
            { exerciseId: 'aductors', exerciseName: 'Aductores', targetSets: 2, targetReps: '12-20' }
          ]
        },
        {
          id: 'rot-dia-3',
          name: 'Día 3 - Upper B',
          description: 'Torso: Pecho Inclinado, Remo, Hombro, Face Pull, Brazos',
          exercises: [
            { exerciseId: 'incline-db-press', exerciseName: 'Press Inclinado con Mancuernas', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'barbell-row-machine', exerciseName: 'Remo maquina / 90°', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'lat-pulldown-neutr', exerciseName: 'Jalón al Pecho agarre Neutro', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'db-shoulder-press-machine', exerciseName: 'Press de Hombro', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'face-pull', exerciseName: 'Face Pull en Polea con Cuerda', targetSets: 3, targetReps: '12-20' },
            { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales', targetSets: 3, targetReps: '12-20' },
            { exerciseId: 'bicep-curl-unilateral', exerciseName: 'Curl de Bíceps Unilateral', targetSets: 3, targetReps: '10-15' },
            { exerciseId: 'tricep-aboveHead', exerciseName: 'Extensiones de Tríceps encima cabeza', targetSets: 3, targetReps: '10-15' }
          ]
        },
        {
          id: 'rot-dia-4',
          name: 'Día 4 - Lower B',
          description: 'Pierna: Prensa, Hip Thrust, Búlgara, Femoral, Cuádriceps, Gemelo, Abductores',
          exercises: [
            { exerciseId: 'leg-press', exerciseName: 'Prensa Inclinada a 45°', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'hipThrust', exerciseName: 'Hip Thrust', targetSets: 3, targetReps: '6-10' },
            { exerciseId: 'bulgarian', exerciseName: 'Sentadillas bulgaras', targetSets: 3, targetReps: '8-12' },
            { exerciseId: 'leg-curl', exerciseName: 'Curl Femoral Tumbado/Sentado', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'leg-extension', exerciseName: 'Extensión de Cuádriceps', targetSets: 2, targetReps: '10-15' },
            { exerciseId: 'calf-raise', exerciseName: 'Elevación de Gemelos de Pie', targetSets: 3, targetReps: '10-15' },
            { exerciseId: 'abductors', exerciseName: 'Abductores', targetSets: 2, targetReps: '12-20' }
          ]
        }
      ];
      localStorage.setItem('it_routines', JSON.stringify(sampleRoutines));
      localStorage.setItem('it_routines_version', 'v4_hypertrophy_reps');
    }
    if (!localStorage.getItem('it_workouts')) {
      localStorage.setItem('it_workouts', JSON.stringify([]));
    }
    if (!localStorage.getItem('it_weights')) {
      localStorage.setItem('it_weights', JSON.stringify([]));
    }
  },

  hasCompletedOnboarding() {
    return localStorage.getItem('it_onboarding_done') === 'true';
  },

  setOnboardingDone() {
    localStorage.setItem('it_onboarding_done', 'true');
  },

  getExercises() {
    return JSON.parse(localStorage.getItem('it_exercises') || '[]');
  },

  saveExercise(exercise) {
    const list = this.getExercises();
    list.unshift(exercise);
    localStorage.setItem('it_exercises', JSON.stringify(list));
    return exercise;
  },

  deleteCustomExercise(id) {
    let list = this.getExercises();
    list = list.filter(e => e.id !== id);
    localStorage.setItem('it_exercises', JSON.stringify(list));
  },

  // RUTINAS PLANTILLA
  getRoutines() {
    return JSON.parse(localStorage.getItem('it_routines') || '[]');
  },

  saveRoutine(routine) {
    const list = this.getRoutines();
    list.unshift(routine);
    localStorage.setItem('it_routines', JSON.stringify(list));
    return routine;
  },

  deleteRoutine(id) {
    let list = this.getRoutines();
    list = list.filter(r => r.id !== id);
    localStorage.setItem('it_routines', JSON.stringify(list));
  },

  // ENTRENAMIENTOS
  getWorkouts() {
    return JSON.parse(localStorage.getItem('it_workouts') || '[]');
  },

  saveWorkout(workout) {
    const list = this.getWorkouts();
    list.unshift(workout);
    localStorage.setItem('it_workouts', JSON.stringify(list));
    return workout;
  },

  deleteWorkout(id) {
    let list = this.getWorkouts();
    list = list.filter(w => w.id !== id);
    localStorage.setItem('it_workouts', JSON.stringify(list));
  },

  // PERFIL
  getProfile() {
    return JSON.parse(localStorage.getItem('it_profile') || '{}');
  },

  saveProfile(profile) {
    localStorage.setItem('it_profile', JSON.stringify(profile));
  },

  // PESOS
  getWeights() {
    return JSON.parse(localStorage.getItem('it_weights') || '[]');
  },

  addWeight(entry) {
    const list = this.getWeights();
    list.push(entry);
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('it_weights', JSON.stringify(list));
  },

  deleteWeight(index) {
    const list = this.getWeights();
    list.splice(index, 1);
    localStorage.setItem('it_weights', JSON.stringify(list));
  },

  // Exportar todo como JSON
  exportAll() {
    return JSON.stringify({
      version: 4,
      onboardingDone: this.hasCompletedOnboarding(),
      profile: this.getProfile(),
      routines: this.getRoutines(),
      exercises: this.getExercises(),
      workouts: this.getWorkouts(),
      weights: this.getWeights()
    }, null, 2);
  },

  // Importar desde JSON
  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) localStorage.setItem('it_profile', JSON.stringify(data.profile));
      if (data.routines) localStorage.setItem('it_routines', JSON.stringify(data.routines));
      if (data.exercises) localStorage.setItem('it_exercises', JSON.stringify(data.exercises));
      if (data.workouts) localStorage.setItem('it_workouts', JSON.stringify(data.workouts));
      if (data.weights) localStorage.setItem('it_weights', JSON.stringify(data.weights));
      localStorage.setItem('it_onboarding_done', 'true');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};

DB.init();
