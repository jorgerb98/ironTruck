// db.js - Base de datos predeterminada y capa de almacenamiento IndexedDB / LocalStorage

const DEFAULT_EXERCISES = [
  // Pecho
  { id: 'bench-press', name: 'Press de Banca Plano con Barra', category: 'Pecho', equipment: 'Barra', isCustom: false },
  { id: 'incline-db-press', name: 'Press Inclinado con Mancuernas', category: 'Pecho', equipment: 'Mancuernas', isCustom: false },
  { id: 'chest-fly-cable', name: 'Aperturas en Cruce de Poleas', category: 'Pecho', equipment: 'Polea / Cable', isCustom: false },
  { id: 'chest-fly-cable-machine', name: 'Mariposa maquina', category: 'Pecho', equipment: 'Máquina', isCustom: false },
  { id: 'dips-chest', name: 'Fondos en Paralelas (Pecho)', category: 'Pecho', equipment: 'Peso Corporal', isCustom: false },
  { id: 'machine-chest-press', name: 'Press en Máquina Sentado', category: 'Pecho', equipment: 'Máquina', isCustom: false },

  // Espalda
  { id: 'deadlift', name: 'Peso Muerto Convencional', category: 'Espalda', equipment: 'Barra', isCustom: false },
  { id: 'barbell-row', name: 'Remo con Barra Pendlay / 90°', category: 'Espalda', equipment: 'Barra', isCustom: false },
  { id: 'barbell-row-machine', name: 'Remo maquina / 90°', category: 'Espalda', equipment: 'Máquina', isCustom: false },
  { id: 'lat-pulldown', name: 'Jalón al Pecho en Polea', category: 'Espalda', equipment: 'Polea / Cable', isCustom: false },
  { id: 'lat-pulldown-neutr', name: 'Jalón al Pecho agarre Neutro', category: 'Espalda', equipment: 'Polea / Cable', isCustom: false },
  { id: 'pull-ups', name: 'Dominadas Pronas / Neutras', category: 'Espalda', equipment: 'Peso Corporal', isCustom: false },
  { id: 'seated-cable-row', name: 'Remo Gironda en Polea Baja', category: 'Espalda', equipment: 'Polea / Cable', isCustom: false },

  // Piernas
  { id: 'barbell-squat', name: 'Sentadilla Trasera con Barra', category: 'Piernas', equipment: 'Barra', isCustom: false },
  { id: 'leg-press', name: 'Prensa Inclinada a 45°', category: 'Piernas', equipment: 'Máquina', isCustom: false },
  { id: 'romanian-deadlift', name: 'Peso Muerto Rumano', category: 'Piernas', equipment: 'Barra', isCustom: false },
  { id: 'leg-extension', name: 'Extensión de Cuádriceps', category: 'Piernas', equipment: 'Máquina', isCustom: false },
  { id: 'leg-curl', name: 'Curl Femoral Tumbado/Sentado', category: 'Piernas', equipment: 'Máquina', isCustom: false },
  { id: 'calf-raise', name: 'Elevación de Gemelos de Pie', category: 'Piernas', equipment: 'Máquina', isCustom: false },
  { id: 'bulgarian', name: 'Sentadillas bulgaras', category: 'Piernas', equipment: 'Mancuernas', isCustom: false },
  { id: 'hipThrust', name: 'Hip Thrust', category: 'Piernas', equipment: 'Mancuernas', isCustom: false },
  { id: 'aductors', name: 'Aductores', category: 'Piernas', equipment: 'Máquina', isCustom: false },
  { id: 'abductors', name: 'Abductores', category: 'Piernas', equipment: 'Máquina', isCustom: false },

  // Hombros
  { id: 'overhead-press', name: 'Press Militar de Pie con Barra', category: 'Hombros', equipment: 'Barra', isCustom: false },
  { id: 'db-shoulder-press', name: 'Press de Hombro con Mancuernas', category: 'Hombros', equipment: 'Mancuernas', isCustom: false },
  { id: 'db-shoulder-press-machine', name: 'Press de Hombro', category: 'Hombros', equipment: 'Máquina', isCustom: false },
  { id: 'lateral-raises', name: 'Elevaciones Laterales', category: 'Hombros', equipment: 'Polea / Cable', isCustom: false },
  { id: 'face-pull', name: 'Face Pull en Polea con Cuerda', category: 'Hombros', equipment: 'Polea / Cable', isCustom: false },

  // Brazos
  { id: 'barbell-curl', name: 'Curl de Bíceps con Barra Z', category: 'Brazos', equipment: 'Barra', isCustom: false },
  { id: 'db-hammer-curl', name: 'Curl Martillo con Mancuernas', category: 'Brazos', equipment: 'Mancuernas', isCustom: false },
  { id: 'tricep-pushdown', name: 'Extensiones de Tríceps en Polea', category: 'Brazos', equipment: 'Polea / Cable', isCustom: false },
  { id: 'tricep-aboveHead', name: 'Extensiones de Tríceps encima cabeza', category: 'Brazos', equipment: 'Polea / Cable', isCustom: false },
  { id: 'skull-crushers', name: 'Press Francés / Skullcrushers', category: 'Brazos', equipment: 'Barra', isCustom: false },

  // Core
  { id: 'hanging-leg-raise', name: 'Elevaciones de Piernas Colgado', category: 'Core', equipment: 'Peso Corporal', isCustom: false },
  { id: 'ab-wheel', name: 'Rueda Abdominal (Ab Wheel)', category: 'Core', equipment: 'Otro', isCustom: false },
  { id: 'plank', name: 'Plancha Abdominal Isométrica', category: 'Core', equipment: 'Peso Corporal', isCustom: false }
];

// Base de datos de alimentos precargados
const DEFAULT_FOODS = [
  { id: 'food-chicken', name: 'Pechuga de Pollo a la plancha', calories: 165, protein: 31, carbs: 0, fat: 3.6, portionUnit: 'g' },
  { id: 'food-egg', name: 'Huevo entero (1 ud ~ 55g)', calories: 78, protein: 6.5, carbs: 0.6, fat: 5.3, portionUnit: 'ud' },
  { id: 'food-egg-white', name: 'Claras de huevo (100g)', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, portionUnit: 'g' },
  { id: 'food-tuna', name: 'Atún al natural en lata', calories: 116, protein: 26, carbs: 0, fat: 1, portionUnit: 'g' },
  { id: 'food-beef', name: 'Ternera magra / Picada 5%', calories: 137, protein: 21, carbs: 0, fat: 5, portionUnit: 'g' },
  { id: 'food-salmon', name: 'Salmón fresco', calories: 208, protein: 20, carbs: 0, fat: 13, portionUnit: 'g' },
  { id: 'food-protein-whey', name: 'Proteína Whey en Polvo (1 cacito ~30g)', calories: 115, protein: 24, carbs: 2, fat: 1.5, portionUnit: 'scoop' },
  { id: 'food-greek-yogurt', name: 'Yogur Griego 0% natural', calories: 59, protein: 10, carbs: 3.6, fat: 0.2, portionUnit: 'g' },

  { id: 'food-rice', name: 'Arroz Blanco (pesado en seco)', calories: 360, protein: 7, carbs: 80, fat: 0.6, portionUnit: 'g' },
  { id: 'food-oats', name: 'Copos de Avena', calories: 375, protein: 13.5, carbs: 60, fat: 7, portionUnit: 'g' },
  { id: 'food-potato', name: 'Patata cocida / asada', calories: 77, protein: 2, carbs: 17, fat: 0.1, portionUnit: 'g' },
  { id: 'food-sweet-potato', name: 'Boniato / Batata', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, portionUnit: 'g' },
  { id: 'food-pasta', name: 'Pasta de trigo (en seco)', calories: 355, protein: 12, carbs: 72, fat: 1.5, portionUnit: 'g' },
  { id: 'food-bread', name: 'Pan Integral (1 rebanada ~40g)', calories: 95, protein: 3.5, carbs: 18, fat: 1, portionUnit: 'rebanada' },
  { id: 'food-banana', name: 'Plátano mediano (~100g)', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, portionUnit: 'ud' },
  { id: 'food-apple', name: 'Manzana fresca', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, portionUnit: 'ud' },

  { id: 'food-olive-oil', name: 'Aceite de Oliva Virgen Extra (1 cda ~ 10g)', calories: 90, protein: 0, carbs: 0, fat: 10, portionUnit: 'cda' },
  { id: 'food-peanut-butter', name: 'Crema de Cacahuete 100% (1 cda ~ 20g)', calories: 125, protein: 5.5, carbs: 2.5, fat: 10, portionUnit: 'cda' },
  { id: 'food-nuts', name: 'Frutos secos variados / Nueces (puñado 30g)', calories: 195, protein: 4.5, carbs: 4, fat: 19, portionUnit: 'g' },
  { id: 'food-avocado', name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fat: 15, portionUnit: 'g' },
  { id: 'food-whole-milk', name: 'Leche entera (vaso 250ml)', calories: 150, protein: 8, carbs: 12, fat: 8, portionUnit: 'vaso' }
];

const DB = {
  init() {
    if (!localStorage.getItem('it_exercises')) {
      localStorage.setItem('it_exercises', JSON.stringify(DEFAULT_EXERCISES));
    }
    if (!localStorage.getItem('it_foods')) {
      localStorage.setItem('it_foods', JSON.stringify(DEFAULT_FOODS));
    }
    if (!localStorage.getItem('it_routines')) {
      // Rutinas plantilla de ejemplo sin pesos prefijados (esqueletos)
      const sampleRoutines = [
        {
          id: 'rot-push',
          name: 'Empuje (Pecho, Hombro, Tríceps)',
          description: 'Enfocada en press y tríceps',
          exercises: [
            { exerciseId: 'bench-press', exerciseName: 'Press de Banca Plano con Barra', targetSets: 4 },
            { exerciseId: 'incline-db-press', exerciseName: 'Press Inclinado con Mancuernas', targetSets: 3 },
            { exerciseId: 'db-shoulder-press', exerciseName: 'Press de Hombro con Mancuernas', targetSets: 3 },
            { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales con Mancuerna', targetSets: 4 },
            { exerciseId: 'tricep-pushdown', exerciseName: 'Extensiones de Tríceps en Polea', targetSets: 3 }
          ]
        },
        {
          id: 'rot-pull',
          name: 'Tirón (Espalda y Bíceps)',
          description: 'Remos, dominadas y flexión de codo',
          exercises: [
            { exerciseId: 'deadlift', exerciseName: 'Peso Muerto Convencional', targetSets: 3 },
            { exerciseId: 'lat-pulldown', exerciseName: 'Jalón al Pecho en Polea', targetSets: 4 },
            { exerciseId: 'barbell-row', exerciseName: 'Remo con Barra Pendlay / 90°', targetSets: 3 },
            { exerciseId: 'face-pull', exerciseName: 'Face Pull en Polea con Cuerda', targetSets: 3 },
            { exerciseId: 'barbell-curl', exerciseName: 'Curl de Bíceps con Barra Z', targetSets: 4 }
          ]
        },
        {
          id: 'rot-leg',
          name: 'Pierna Completa',
          description: 'Cuádriceps, femoral y gemelo',
          exercises: [
            { exerciseId: 'barbell-squat', exerciseName: 'Sentadilla Trasera con Barra', targetSets: 4 },
            { exerciseId: 'romanian-deadlift', exerciseName: 'Peso Muerto Rumano', targetSets: 3 },
            { exerciseId: 'leg-press', exerciseName: 'Prensa Inclinada a 45°', targetSets: 3 },
            { exerciseId: 'leg-curl', exerciseName: 'Curl Femoral Tumbado/Sentado', targetSets: 3 },
            { exerciseId: 'calf-raise', exerciseName: 'Elevación de Gemelos de Pie', targetSets: 4 }
          ]
        }
      ];
      localStorage.setItem('it_routines', JSON.stringify(sampleRoutines));
    }
    if (!localStorage.getItem('it_meals')) {
      localStorage.setItem('it_meals', JSON.stringify([]));
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

  // COMIDAS
  getFoods() {
    return JSON.parse(localStorage.getItem('it_foods') || '[]');
  },

  saveFood(food) {
    const list = this.getFoods();
    list.unshift(food);
    localStorage.setItem('it_foods', JSON.stringify(list));
    return food;
  },

  getMeals() {
    return JSON.parse(localStorage.getItem('it_meals') || '[]');
  },

  saveMeal(meal) {
    const list = this.getMeals();
    list.unshift(meal);
    localStorage.setItem('it_meals', JSON.stringify(list));
    return meal;
  },

  deleteMeal(id) {
    let list = this.getMeals();
    list = list.filter(m => m.id !== id);
    localStorage.setItem('it_meals', JSON.stringify(list));
  },

  // Exportar todo como JSON
  exportAll() {
    return JSON.stringify({
      version: 3,
      onboardingDone: this.hasCompletedOnboarding(),
      profile: this.getProfile(),
      routines: this.getRoutines(),
      exercises: this.getExercises(),
      workouts: this.getWorkouts(),
      weights: this.getWeights(),
      foods: this.getFoods(),
      meals: this.getMeals()
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
      if (data.foods) localStorage.setItem('it_foods', JSON.stringify(data.foods));
      if (data.meals) localStorage.setItem('it_meals', JSON.stringify(data.meals));
      localStorage.setItem('it_onboarding_done', 'true');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};

DB.init();
