// app.js - Lógica principal de IronTrack (Tema Negro & Morado Neón + Calendario + Nutrición Kcal + Onboarding Simplificado y Asistente de Rutinas por Días)

// Estado local de la sesión en curso
let currentSession = {
  date: new Date().toISOString().split('T')[0],
  tag: '',
  exercises: []
};

// -------------------------------------------------------------
// AUTOGUARDADO DE SESIÓN EN CURSO
// -------------------------------------------------------------
const SESSION_DRAFT_KEY = 'it_session_draft';

function autosaveSession() {
  localStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(currentSession));
}

function clearSessionDraft() {
  localStorage.removeItem(SESSION_DRAFT_KEY);
}

function restoreSessionDraft() {
  const saved = localStorage.getItem(SESSION_DRAFT_KEY);
  if (!saved) return false;
  try {
    const draft = JSON.parse(saved);
    if (draft && draft.exercises && draft.exercises.length > 0) {
      currentSession = draft;
      return true;
    }
  } catch (e) {}
  return false;
}

// Estado del Calendario
let calendarCurrentDate = new Date();
let calendarSelectedDate = new Date().toISOString().split('T')[0];

// Estado de Nutrición
let currentNutritionDate = new Date().toISOString().split('T')[0];

// Variable para el gráfico de Chart.js
let mainChartInstance = null;

// Cronómetro de descanso
let restTimerSeconds = 0;
let restTimerInterval = null;

// Estado del Asistente de Rutinas por Días
let wizardRoutineState = {
  totalDays: 4,
  planName: 'Rutina Hipertrofia 4 Días',
  currentDayIndex: 0,
  days: [
    {
      title: 'Día 1 - Upper A',
      exercises: [
        { exerciseId: 'machine-chest-press', exerciseName: 'Press en Máquina Sentado', targetSets: 3, targetReps: '6-10' },
        { exerciseId: 'lat-pulldown', exerciseName: 'Jalón al Pecho en Polea', targetSets: 3, targetReps: '6-10' },
        { exerciseId: 'overhead-press', exerciseName: 'Press Militar de Pie con Barra', targetSets: 3, targetReps: '6-10' },
        { exerciseId: 'barbell-row-machine', exerciseName: 'Remo maquina / 90°', targetSets: 3, targetReps: '8-12' },
        { exerciseId: 'chest-fly-cable-machine', exerciseName: 'Mariposa maquina', targetSets: 2, targetReps: '10-15' },
        { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales', targetSets: 3, targetReps: '12-20' },
        { exerciseId: 'barbell-curl', exerciseName: 'Curl de Bíceps con Barra Z', targetSets: 2, targetReps: '8-12' },
        { exerciseId: 'tricep-pushdown', exerciseName: 'Extensiones de Tríceps en Polea', targetSets: 2, targetReps: '8-12' }
      ]
    },
    {
      title: 'Día 2 - Lower A',
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
      title: 'Día 3 - Upper B',
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
      title: 'Día 4 - Lower B',
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
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const workoutDateInput = document.getElementById('workout-date');
  if (workoutDateInput) workoutDateInput.value = currentSession.date;

  const weightDateInput = document.getElementById('weight-entry-date');
  if (weightDateInput) weightDateInput.value = new Date().toISOString().split('T')[0];

  setupTabs();
  loadProfile();
  checkFirstTimeUser();
  initCalendar();
  renderExercisesLibrary();
  renderRoutinesList();
  populateRoutinePresetsDropdown();

  // Recuperar sesión en curso si la app se cerró a medias
  const hadDraft = restoreSessionDraft();
  if (hadDraft) {
    if (currentSession.tag) {
      const tagInput = document.getElementById('workout-tag');
      if (tagInput) tagInput.value = currentSession.tag;
    }
    if (currentSession.date) {
      const dateInput = document.getElementById('workout-date');
      if (dateInput) dateInput.value = currentSession.date;
    }
    updateEditWorkoutBanner();
    renderSessionExercises();
    showToast('✅ Sesión recuperada automáticamente');
  }

  renderHistory();
  renderPRs();
  renderWeightHistory();
  setupChartControls();
  setupHomeProgressChart();
  setupEventListeners();
  setupOnboardingAndRoutineWizard();
  setupEditRoutineModal();
  setupEditExerciseModal();
});

// -------------------------------------------------------------
// ONBOARDING INICIAL: DATOS PERSONALES BÁSICOS
// -------------------------------------------------------------
function checkFirstTimeUser() {
  if (!DB.hasCompletedOnboarding()) {
    openOnboardingModal();
  }
}

function openOnboardingModal() {
  const modal = document.getElementById('modal-onboarding');
  if (!modal) return;

  const prof = DB.getProfile();
  if (prof.name) document.getElementById('ob-name').value = prof.name;
  if (prof.age) document.getElementById('ob-age').value = prof.age;
  if (prof.height) document.getElementById('ob-height').value = prof.height;
  if (prof.weight) document.getElementById('ob-current-weight').value = prof.weight;
  if (prof.gender) document.getElementById('ob-gender').value = prof.gender;

  modal.classList.remove('hidden');
}

function setupOnboardingAndRoutineWizard() {
  // Finalizar Onboarding — guardar datos básicos y cerrar
  document.getElementById('btn-ob-finish-simple').addEventListener('click', () => {
    const name   = document.getElementById('ob-name').value.trim() || 'Atleta';
    const gender = document.getElementById('ob-gender').value;
    const age    = parseInt(document.getElementById('ob-age').value) || 25;
    const height = parseFloat(document.getElementById('ob-height').value) || 175;
    const weight = parseFloat(document.getElementById('ob-current-weight').value) || 75;

    if (!document.getElementById('ob-name').value.trim() || !document.getElementById('ob-age').value || !document.getElementById('ob-height').value || !document.getElementById('ob-current-weight').value) {
      alert('Por favor completa todos los campos para continuar.');
      return;
    }

    const newProfile = { name, gender, age, height, weight };

    DB.saveProfile(newProfile);
    DB.addWeight({ date: new Date().toISOString().split('T')[0], weight });
    DB.setOnboardingDone();

    document.getElementById('modal-onboarding').classList.add('hidden');
    loadProfile();
    showToast(`¡Bienvenido, ${name}! Ya puedes crear tu rutina.`);
  });

  const btnReopen = document.getElementById('btn-reopen-onboarding');
  if (btnReopen) btnReopen.addEventListener('click', openOnboardingModal);

  // -----------------------------------------------------------
  // ASISTENTE DE CREACIÓN DE RUTINA POR DÍAS
  // -----------------------------------------------------------
  const wizardModal = document.getElementById('modal-wizard-routine');
  const btnOpenWizard = document.getElementById('btn-open-create-routine-modal');
  const btnOpenWizardTab = document.getElementById('btn-create-routine-tab');

  const openWizard = () => {
    document.getElementById('routine-wizard-step-1').classList.remove('hidden');
    document.getElementById('routine-wizard-step-2').classList.add('hidden');
    wizardModal.classList.remove('hidden');
  };

  if (btnOpenWizard) btnOpenWizard.addEventListener('click', openWizard);
  if (btnOpenWizardTab) btnOpenWizardTab.addEventListener('click', openWizard);

  document.getElementById('btn-close-wizard-routine').addEventListener('click', () => {
    wizardModal.classList.add('hidden');
  });

  // Selector de número de días en paso 1
  document.querySelectorAll('.btn-select-days').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-select-days').forEach(b => {
        b.classList.remove('border-purple-500', 'bg-purple-950/40', 'active');
        b.classList.add('border-[#2f184e]', 'bg-[#170e28]');
      });
      btn.classList.remove('border-[#2f184e]', 'bg-[#170e28]');
      btn.classList.add('border-purple-500', 'bg-purple-950/40', 'active');

      const count = parseInt(btn.dataset.days) || 4;
      wizardRoutineState.totalDays = count;
    });
  });

  // Paso 1 -> Paso 2 (Crear Días de la rutina)
  document.getElementById('btn-routine-wizard-to-step2').addEventListener('click', () => {
    wizardRoutineState.planName = document.getElementById('wizard-plan-name').value.trim() || 'Mi Rutina de Gimnasio';
    
    // Generar estructura de días si cambia la cantidad
    const newDays = [];
    for (let i = 1; i <= wizardRoutineState.totalDays; i++) {
      const existing = wizardRoutineState.days[i - 1];
      newDays.push({
        title: existing ? existing.title : `Día ${i} - Rutina`,
        exercises: existing ? existing.exercises : []
      });
    }
    wizardRoutineState.days = newDays;
    wizardRoutineState.currentDayIndex = 0;

    document.getElementById('routine-wizard-step-1').classList.add('hidden');
    document.getElementById('routine-wizard-step-2').classList.remove('hidden');

    renderWizardDaysNav();
    renderCurrentWizardDay();
  });

  document.getElementById('btn-routine-wizard-back-1').addEventListener('click', () => {
    document.getElementById('routine-wizard-step-2').classList.add('hidden');
    document.getElementById('routine-wizard-step-1').classList.remove('hidden');
  });

  // Añadir ejercicio al día actual del asistente
  document.getElementById('btn-wizard-add-exercise-to-day').addEventListener('click', () => {
    openExercisePickerForRoutine((selectedEx) => {
      const currentDay = wizardRoutineState.days[wizardRoutineState.currentDayIndex];
      currentDay.exercises.push({
        exerciseId: selectedEx.id,
        exerciseName: selectedEx.name,
        targetSets: 3
      });
      renderCurrentWizardDay();
    });
  });

  // Título del día editable en vivo
  document.getElementById('wizard-day-title').addEventListener('input', (e) => {
    const currentDay = wizardRoutineState.days[wizardRoutineState.currentDayIndex];
    if (currentDay) {
      currentDay.title = e.target.value;
      renderWizardDaysNav();
    }
  });

  // Guardar todas las plantillas de días
  document.getElementById('btn-save-all-wizard-routines').addEventListener('click', () => {
    const planName = wizardRoutineState.planName;

    wizardRoutineState.days.forEach((day, index) => {
      if (day.exercises.length > 0) {
        const fullRoutineName = `${planName} (${day.title})`;
        const newRoutine = {
          id: 'rot_' + Date.now() + '_' + index,
          name: fullRoutineName,
          description: `Día ${index + 1} de ${wizardRoutineState.totalDays}`,
          exercises: JSON.parse(JSON.stringify(day.exercises))
        };
        DB.saveRoutine(newRoutine);
      }
    });

    wizardModal.classList.add('hidden');
    renderRoutinesList();
    populateRoutinePresetsDropdown();

    // Cargar el Día 1 en la sesión activa si existe
    const firstRoutine = DB.getRoutines()[0];
    if (firstRoutine) {
      document.querySelector('.nav-item[data-target="tab-workout"]').click();
      loadRoutineIntoSession(firstRoutine);
    }

    showToast(`¡Plan de ${wizardRoutineState.totalDays} días creado con éxito!`);
  });

  // Cargar rutina seleccionada en entreno
  document.getElementById('btn-load-routine-preset').addEventListener('click', () => {
    const routineId = document.getElementById('workout-routine-preset').value;
    if (!routineId) {
      alert('Selecciona una rutina de la lista para cargarla.');
      return;
    }
    const routines = DB.getRoutines();
    const rot = routines.find(r => r.id === routineId);
    if (rot) {
      loadRoutineIntoSession(rot);
    }
  });
}

function renderWizardDaysNav() {
  const container = document.getElementById('wizard-days-nav');
  if (!container) return;

  container.innerHTML = wizardRoutineState.days.map((day, idx) => {
    const isActive = idx === wizardRoutineState.currentDayIndex;
    const activeClass = isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-900' : 'bg-[#170e28] text-purple-300 hover:bg-[#251545] border border-[#2f184e]';
    return `
      <button type="button" onclick="switchWizardDay(${idx})" class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${activeClass}">
        Día ${idx + 1} (${day.exercises.length})
      </button>
    `;
  }).join('');
}

function switchWizardDay(index) {
  wizardRoutineState.currentDayIndex = index;
  renderWizardDaysNav();
  renderCurrentWizardDay();
}

function renderCurrentWizardDay() {
  const currentDay = wizardRoutineState.days[wizardRoutineState.currentDayIndex];
  if (!currentDay) return;

  const titleInput = document.getElementById('wizard-day-title');
  if (titleInput) titleInput.value = currentDay.title;

  const container = document.getElementById('wizard-day-exercises-container');
  if (!container) return;

  if (currentDay.exercises.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 bg-[#160c2b]/60 border border-dashed border-[#2f184e] rounded-2xl">
        <i data-lucide="dumbbell" class="w-6 h-6 text-purple-500/50 mx-auto mb-1"></i>
        <p class="text-xs font-semibold text-purple-300">Sin ejercicios en este día</p>
        <p class="text-[10px] text-purple-400/60 mt-0.5">Pulsa en "Añadir Ejercicio a este Día" abajo.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Build body map for this wizard day
  const allExData = DB.getExercises();
  const dayCategories = [...new Set(currentDay.exercises.map(item => {
    const ex = allExData.find(e => e.id === item.exerciseId);
    return ex ? ex.category : null;
  }).filter(Boolean))];
  const bodyMapHtml = generateBodyMuscleMap(dayCategories);

  const exerciseListHtml = currentDay.exercises.map((item, idx) => {
    const exData = allExData.find(e => e.id === item.exerciseId);
    const category = exData ? exData.category : '';
    const muscleIcon = getMuscleIcon(category);
    return `
    <div class="bg-[#170e28] border border-[#2e184c] rounded-2xl p-2.5 flex items-center justify-between text-xs">
      <div class="flex items-center space-x-2">
        <div class="flex-shrink-0">${muscleIcon}</div>
        <div>
          <p class="text-xs font-bold text-white">${item.exerciseName}</p>
          <span class="text-[10px] text-purple-400">Empezará con 1 repetición base</span>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <label class="text-[10px] text-purple-300">Series:</label>
        <input type="number" min="1" max="10" value="${item.targetSets || 3}" 
          onchange="wizardRoutineState.days[${wizardRoutineState.currentDayIndex}].exercises[${idx}].targetSets = parseInt(this.value) || 3; renderWizardDaysNav();"
          class="w-10 bg-[#0d071a] border border-[#37195c] rounded-lg py-0.5 text-center text-xs text-white font-bold">
        <button type="button" onclick="wizardRoutineState.days[${wizardRoutineState.currentDayIndex}].exercises.splice(${idx}, 1); renderCurrentWizardDay(); renderWizardDaysNav();" class="text-purple-400/60 hover:text-rose-400 p-1">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `}).join('');

  container.innerHTML = `
    <div class="mb-2">${bodyMapHtml}</div>
    ${exerciseListHtml}
  `;

  lucide.createIcons();
}

function openExercisePickerForRoutine(onSelectCallback) {
  const modal = document.getElementById('modal-exercise-picker');
  const listContainer = document.getElementById('picker-exercise-list');
  const searchInput = document.getElementById('picker-search-input');
  searchInput.value = '';

  const renderPickerList = (term = '') => {
    const exercises = DB.getExercises().filter(e => e.name.toLowerCase().includes(term.toLowerCase()));
    listContainer.innerHTML = exercises.map(e => `
      <div onclick="selectPickerExForRoutine('${e.id}')" class="p-3 bg-[#170e28] hover:bg-[#23143d] rounded-xl cursor-pointer border border-[#2e184c] flex items-center justify-between transition">
        <div class="flex items-center space-x-2">
          <div class="flex-shrink-0">${getMuscleIcon(e.category)}</div>
          <div>
            <p class="text-xs font-bold text-white">${e.name}</p>
            <span class="text-[10px] text-purple-300/70">${e.category} • ${e.equipment}</span>
          </div>
        </div>
        <i data-lucide="plus" class="w-4 h-4 text-fuchsia-400"></i>
      </div>
    `).join('');
    lucide.createIcons();
  };

  window._currentRoutineCallback = onSelectCallback;
  renderPickerList();
  searchInput.oninput = (ev) => renderPickerList(ev.target.value);
  modal.classList.remove('hidden');
}

function selectPickerExForRoutine(id) {
  const allExercises = DB.getExercises();
  const found = allExercises.find(e => e.id === id);
  if (found && window._currentRoutineCallback) {
    window._currentRoutineCallback(found);
  }
  document.getElementById('modal-exercise-picker').classList.add('hidden');
}

// Cargar la rutina seleccionada en la sesión activa: coge pesos y reps de la última sesión de la misma rutina
function loadRoutineIntoSession(routine) {
  if (!routine || !routine.exercises) return;

  currentSession.tag = routine.name;
  const tagInput = document.getElementById('workout-tag');
  if (tagInput) tagInput.value = routine.name;

  const allEx = DB.getExercises();
  const exMap = {};
  allEx.forEach(e => exMap[e.id] = e);

  // Buscar la última sesión realizada de ESTA MISMA RUTINA para replicar sus pesos y repeticiones
  const allWorkouts = DB.getWorkouts().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastSameRoutineWorkout = allWorkouts.find(w => (w.tag || '').trim().toLowerCase() === routine.name.trim().toLowerCase());

  currentSession.exercises = routine.exercises.map(re => {
    let numSets = parseInt(re.targetSets, 10);
    if (isNaN(numSets) || numSets <= 0) {
      numSets = 3;
    }

    // Buscar si en la última sesión de esta misma rutina se hizo este ejercicio
    let prevSets = null;
    if (lastSameRoutineWorkout && lastSameRoutineWorkout.exercises) {
      const matchedEx = lastSameRoutineWorkout.exercises.find(e => e.exerciseId === re.exerciseId);
      if (matchedEx && matchedEx.sets && matchedEx.sets.length > 0) {
        prevSets = matchedEx.sets;
      }
    }

    // Si no se encontró en la misma rutina, buscar la última vez que se hizo en cualquier rutina
    const lastPerf = findLastPerformance(re.exerciseId);

    const sets = [];
    for (let i = 0; i < numSets; i++) {
      if (prevSets && prevSets[i]) {
        // Coger exactamente peso, reps y rir de esa serie en la misma rutina
        sets.push({
          weight: parseFloat(prevSets[i].weight) || 0,
          reps: parseInt(prevSets[i].reps, 10) || 1,
          rir: prevSets[i].rir !== undefined ? prevSets[i].rir : 2
        });
      } else if (prevSets && prevSets.length > 0) {
        // Si hay más series objetivo que las previas, repetir los datos de la última serie de esa rutina
        const lastInRoutine = prevSets[prevSets.length - 1];
        sets.push({
          weight: parseFloat(lastInRoutine.weight) || 0,
          reps: parseInt(lastInRoutine.reps, 10) || 1,
          rir: lastInRoutine.rir !== undefined ? lastInRoutine.rir : 2
        });
      } else if (lastPerf) {
        // Fallback al último rendimiento global
        sets.push({
          weight: parseFloat(lastPerf.weight) || 0,
          reps: parseInt(lastPerf.reps, 10) || 1,
          rir: lastPerf.rir !== undefined ? lastPerf.rir : 2
        });
      } else {
        // Primeriza sin registros previos
        sets.push({
          weight: 0,
          reps: 1,
          rir: 2
        });
      }
    }

    // Buscar rango de reps recomendado si no lo tiene explícito
    let targetReps = re.targetReps;
    if (!targetReps && exMap[re.exerciseId] && exMap[re.exerciseId].targetReps) {
      targetReps = exMap[re.exerciseId].targetReps;
    }

    return {
      exerciseId: re.exerciseId,
      exerciseName: re.exerciseName,
      targetReps: targetReps || null,
      sets
    };
  });

  openExerciseIndices.clear(); // Empiezan contraídos para ver la rutina limpia
  autosaveSession();
  renderSessionExercises();
  showToast(lastSameRoutineWorkout 
    ? `Rutina "${routine.name}" cargada con pesos y reps anteriores.`
    : `Rutina "${routine.name}" cargada.`
  );
}

function renderRoutinesList() {
  const container = document.getElementById('routines-list-container');
  const badge = document.getElementById('routines-count-badge');
  const routines = DB.getRoutines();
  const allExData = DB.getExercises();

  if (badge) badge.innerText = `${routines.length} plantilla${routines.length === 1 ? '' : 's'}`;
  if (!container) return;

  if (routines.length === 0) {
    container.innerHTML = `<p class="text-xs text-purple-400/50 text-center py-2">Sin plantillas de rutina creadas. Pulsa "Crear Rutina".</p>`;
    return;
  }

  container.innerHTML = routines.map(r => {
    // Gather unique categories for this routine's exercises
    const routineCategories = [...new Set(r.exercises.map(re => {
      const ex = allExData.find(e => e.id === re.exerciseId);
      return ex ? ex.category : null;
    }).filter(Boolean))];
    const bodyMapHtml = generateBodyMuscleMap(routineCategories);

    return `
    <div class="bg-[#170e28] border border-[#2e184c] rounded-2xl p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-xs font-bold text-white">${r.name}</h4>
          <p class="text-[10px] text-purple-400 mt-0.5">${r.exercises.length} ejercicios • ${r.description || 'Plantilla de día'}</p>
        </div>
        <div class="flex items-center space-x-1.5">
          <button onclick="startWorkoutFromRoutine('${r.id}')" class="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow flex items-center space-x-1">
            <i data-lucide="play" class="w-3 h-3"></i>
            <span>Entrenar</span>
          </button>
          <button onclick="openEditRoutineModal('${r.id}')" class="p-1 text-purple-400/70 hover:text-fuchsia-300 transition" title="Editar rutina">
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteRoutineItem('${r.id}')" class="p-1 text-purple-400/50 hover:text-rose-400">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
      ${bodyMapHtml}
    </div>
  `}).join('');

  lucide.createIcons();
}

function startWorkoutFromRoutine(routineId) {
  const routines = DB.getRoutines();
  const rot = routines.find(r => r.id === routineId);
  if (rot) {
    document.querySelector('.nav-item[data-target="tab-workout"]').click();
    loadRoutineIntoSession(rot);
  }
}

function deleteRoutineItem(routineId) {
  if (confirm('¿Eliminar esta plantilla de rutina?')) {
    DB.deleteRoutine(routineId);
    renderRoutinesList();
    populateRoutinePresetsDropdown();
    showToast('Rutina eliminada');
  }
}

function populateRoutinePresetsDropdown() {
  const select = document.getElementById('workout-routine-preset');
  if (!select) return;

  const routines = DB.getRoutines();
  let html = `<option value="">-- Elige una rutina para cargar sus ejercicios --</option>`;
  routines.forEach(r => {
    html += `<option value="${r.id}">${r.name} (${r.exercises.length} ejercicios)</option>`;
  });
  select.innerHTML = html;
}

// -------------------------------------------------------------
// NAVEGACIÓN ENTRE TABS
// -------------------------------------------------------------
function setupTabs() {
  const navButtons = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');

  const switchTab = (targetId) => {
    navButtons.forEach(b => {
      if (b.dataset.target === targetId) {
        b.classList.remove('text-purple-300/50');
        b.classList.add('text-purple-400', 'active');
      } else {
        b.classList.remove('text-purple-400', 'active');
        b.classList.add('text-purple-300/50');
      }
    });

    tabs.forEach(tab => {
      if (tab.id === targetId) {
        tab.classList.remove('hidden');
      } else {
        tab.classList.add('hidden');
      }
    });

    if (targetId === 'tab-calendar') {
      renderCalendar();
      updateHomeProgressChart();
    }
    if (targetId === 'tab-charts') updateChart();
    if (targetId === 'tab-history') {
      renderHistory();
      renderPRs();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  const btnOpenProfile = document.getElementById('btn-open-profile-quick');
  if (btnOpenProfile) {
    btnOpenProfile.addEventListener('click', () => switchTab('tab-profile'));
  }

  const btnRecalc = document.getElementById('btn-recalc-target-modal');
  if (btnRecalc) {
    btnRecalc.addEventListener('click', () => switchTab('tab-profile'));
  }
}

// -------------------------------------------------------------
// CALENDARIO DE ENTRENAMIENTOS
// -------------------------------------------------------------
function initCalendar() {
  renderCalendar();

  document.getElementById('btn-prev-month').addEventListener('click', () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('btn-next-month').addEventListener('click', () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
    renderCalendar();
  });

  document.getElementById('btn-quick-new-workout').addEventListener('click', () => {
    goToWorkoutForDate(new Date().toISOString().split('T')[0]);
  });

  document.getElementById('btn-add-workout-on-selected-date').addEventListener('click', () => {
    goToWorkoutForDate(calendarSelectedDate);
  });

  document.getElementById('btn-export-day-card').addEventListener('click', () => {
    exportDayCardToPNG(calendarSelectedDate);
  });
}

function renderCalendar() {
  const daysGrid = document.getElementById('calendar-days-grid');
  const monthYearLabel = document.getElementById('calendar-month-year');
  const statsSummary = document.getElementById('calendar-stats-summary');
  if (!daysGrid || !monthYearLabel) return;

  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();

  const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
  monthYearLabel.innerText = monthFormatter.format(calendarCurrentDate);

  const workouts = DB.getWorkouts();
  const workoutsByDate = {};
  workouts.forEach(w => {
    if (!workoutsByDate[w.date]) workoutsByDate[w.date] = [];
    workoutsByDate[w.date].push(w);
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  let daysHtml = '';
  let monthWorkoutsCount = 0;

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    daysHtml += `
      <div class="h-11 rounded-2xl flex items-center justify-center text-[11px] text-purple-900/40 cursor-not-allowed">
        ${dayNum}
      </div>
    `;
  }

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayWorkouts = workoutsByDate[dayStr] || [];
    const hasWorkout = dayWorkouts.length > 0;
    const isToday = dayStr === todayStr;
    const isSelected = dayStr === calendarSelectedDate;

    if (hasWorkout) monthWorkoutsCount += dayWorkouts.length;

    let classes = 'calendar-day h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-semibold cursor-pointer border ';
    
    if (isSelected) classes += 'is-selected ';
    if (isToday) classes += 'is-today ';

    if (hasWorkout) {
      classes += 'has-workout ';
    } else {
      classes += 'bg-[#140b24] hover:bg-[#1d1033] border-[#25133d] text-purple-200/80 ';
    }

    daysHtml += `
      <div class="${classes}" onclick="selectCalendarDate('${dayStr}')">
        <span>${d}</span>
      </div>
    `;
  }

  const totalRendered = startDayOfWeek + totalDays;
  const remainingSlots = (7 - (totalRendered % 7)) % 7;
  for (let nextD = 1; nextD <= remainingSlots; nextD++) {
    daysHtml += `
      <div class="h-11 rounded-2xl flex items-center justify-center text-[11px] text-purple-900/40 cursor-not-allowed">
        ${nextD}
      </div>
    `;
  }

  daysGrid.innerHTML = daysHtml;
  if (statsSummary) {
    statsSummary.innerText = `${monthWorkoutsCount} sesión${monthWorkoutsCount === 1 ? '' : 'es'} completada${monthWorkoutsCount === 1 ? '' : 's'}`;
  }

  renderSelectedDayDetails(calendarSelectedDate);
}

function selectCalendarDate(dateStr) {
  calendarSelectedDate = dateStr;
  renderCalendar();
}

function renderSelectedDayDetails(dateStr) {
  const title = document.getElementById('selected-date-title');
  const container = document.getElementById('selected-day-workouts-list');
  if (!container || !title) return;

  const dateObj = new Date(dateStr + 'T00:00:00');
  const dateFormatted = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  title.innerText = dateFormatted;

  const workouts = DB.getWorkouts().filter(w => w.date === dateStr);

  if (workouts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 bg-[#160c2b]/50 border border-dashed border-[#2d184a] rounded-2xl">
        <i data-lucide="moon" class="w-6 h-6 text-purple-500/60 mx-auto mb-1.5"></i>
        <p class="text-xs font-semibold text-purple-300/80">Día de descanso o sin registros</p>
        <p class="text-[11px] text-purple-400/50 mt-0.5">Puedes registrar una sesión para este día con el botón superior.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = workouts.map(w => {
    const totalVol = calculateSessionVolume(w);
    return `
      <div class="bg-[#180e2a] border border-[#2f174e] rounded-2xl p-3.5 shadow space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 min-w-0 pr-2">
            <span class="p-1 rounded-lg bg-purple-500/20 text-purple-300 flex-shrink-0">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
            </span>
            <h4 class="text-xs font-bold text-white truncate">${w.tag}</h4>
          </div>
          <div class="flex items-center space-x-1.5 flex-shrink-0">
            <span class="text-xs font-bold text-fuchsia-400 mr-1">${totalVol.toLocaleString()} kg</span>
            <button onclick="editWorkout('${w.id}')" class="px-2 py-1 rounded-xl glass-pill hover:bg-purple-600/30 text-fuchsia-300 hover:text-white text-[11px] font-bold flex items-center space-x-1 transition" title="Editar este entrenamiento">
              <i data-lucide="pencil" class="w-3 h-3 text-fuchsia-400"></i>
              <span>Editar</span>
            </button>
            <button onclick="deleteWorkoutEntry('${w.id}')" class="p-1 text-purple-400/50 hover:text-rose-400 transition" title="Eliminar entrenamiento">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
        
        <div class="text-[11px] text-purple-200/70 space-y-1.5 pt-1.5 border-t border-[#2a1445]">
          ${w.exercises.map(ex => {
            const lastSet = (ex.sets && ex.sets.length > 0) ? ex.sets[ex.sets.length - 1] : null;
            const lastSetDetails = lastSet
              ? `<span class="mono text-[10px] text-fuchsia-300 font-bold bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20">${lastSet.weight || 0}kg × ${lastSet.reps || 0}</span>`
              : '';
            return `
            <div class="flex justify-between items-center py-0.5">
              <span class="truncate max-w-[55%] font-medium text-white/90">${ex.exerciseName}</span>
              <div class="flex items-center space-x-2">
                ${lastSetDetails}
                <span class="font-mono text-purple-400 text-[11px]">${ex.sets.length} series</span>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function goToWorkoutForDate(dateStr) {
  const dateInput = document.getElementById('workout-date');
  if (dateInput) dateInput.value = dateStr;
  currentSession.date = dateStr;

  const workoutNavBtn = document.querySelector('.nav-item[data-target="tab-workout"]');
  if (workoutNavBtn) workoutNavBtn.click();
  showToast(`Registrando entreno para: ${dateStr}`);
}

// -------------------------------------------------------------
// GESTIÓN DE SESIÓN DE ENTRENAMIENTO ACTIVA (CON RIR Y REPS EDITABLES)
// -------------------------------------------------------------
const openExerciseIndices = new Set();

function addExerciseToSession(exerciseId) {
  const allExercises = DB.getExercises();
  const exercise = allExercises.find(e => e.id === exerciseId);
  if (!exercise) return;

  const lastSetInfo = findLastPerformance(exerciseId);

  const newExerciseEntry = {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    targetReps: exercise.targetReps || null,
    sets: [
      {
        weight: lastSetInfo ? lastSetInfo.weight : 0,
        reps: 1, // REQUISITO: Empieza con 1 repetición base para que el usuario ponga más
        rir: 2  // REQUISITO: Cambiado por RIR
      }
    ]
  };

  currentSession.exercises.push(newExerciseEntry);
  openExerciseIndices.add(currentSession.exercises.length - 1);
  autosaveSession();
  renderSessionExercises();
  showToast(`Añadido: ${exercise.name}`);
}

function findLastPerformance(exerciseId) {
  const workouts = DB.getWorkouts();
  for (const w of workouts) {
    const foundEx = w.exercises.find(e => e.exerciseId === exerciseId);
    if (foundEx && foundEx.sets && foundEx.sets.length > 0) {
      return foundEx.sets[foundEx.sets.length - 1];
    }
  }
  return null;
}

function toggleExerciseCollapse(exIndex) {
  const panel = document.getElementById(`ex-collapse-${exIndex}`);
  const chevron = document.getElementById(`ex-chevron-${exIndex}`);
  if (!panel) return;

  const isHidden = panel.classList.toggle('hidden');
  if (isHidden) {
    openExerciseIndices.delete(exIndex);
    if (chevron) chevron.style.transform = '';
  } else {
    openExerciseIndices.add(exIndex);
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  }
}

function updateSetDataLive(exIndex, setIndex, field, value) {
  if (currentSession.exercises[exIndex] && currentSession.exercises[exIndex].sets[setIndex]) {
    currentSession.exercises[exIndex].sets[setIndex][field] = parseFloat(value) || 0;
    autosaveSession();

    // Actualizar en vivo el volumen de este ejercicio en la cabecera
    const ex = currentSession.exercises[exIndex];
    const exVol = ex.sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
    const volBadge = document.getElementById(`ex-vol-${exIndex}`);
    if (volBadge) {
      volBadge.innerText = exVol > 0 ? `${exVol} kg` : '';
    }
  }
}

function renderSessionExercises() {
  const container = document.getElementById('workout-exercises-container');
  if (!container) return;

  if (currentSession.exercises.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 bg-[#110a1f]/80 border border-dashed border-[#2a1645] rounded-2xl">
        <i data-lucide="dumbbell" class="w-10 h-10 text-purple-500/40 mx-auto mb-2"></i>
        <p class="text-sm font-semibold text-purple-200">No hay ejercicios añadidos en esta sesión</p>
        <p class="text-xs text-purple-400/60 mt-1">Carga una rutina de arriba o añade ejercicios individuales.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Collect all unique categories for the session body map
  const allExData = DB.getExercises();
  const sessionCategories = [...new Set(currentSession.exercises.map(item => {
    const exData = allExData.find(e => e.id === item.exerciseId);
    return exData ? exData.category : null;
  }).filter(Boolean))];

  const bodyMapHtml = generateBodyMuscleMap(sessionCategories);

  const exerciseCards = currentSession.exercises.map((item, exIndex) => {
    const exData = allExData.find(e => e.id === item.exerciseId);
    const category = exData ? exData.category : '';
    const muscleIcon = getMuscleIcon(category);
    const exerciseVolume = item.sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);

    const targetRepsBadge = (item.targetReps || (exData && exData.targetReps))
      ? `<span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-fuchsia-300 border border-purple-500/30 text-[10px] font-black mono"><i data-lucide="target" class="w-2.5 h-2.5 mr-0.5"></i>${item.targetReps || exData.targetReps} reps</span>`
      : '';

    const setsCount = item.sets.length;
    const collapseId = `ex-collapse-${exIndex}`;
    const isOpen = openExerciseIndices.has(exIndex);

    return `
      <div class="bg-[#110a1f] border border-[#2a1645] rounded-2xl shadow-lg overflow-hidden">
        <!-- CABECERA COLAPSABLE: div interactivo que no rompe botones internos -->
        <div onclick="toggleExerciseCollapse(${exIndex})"
          class="w-full flex items-center justify-between p-4 cursor-pointer select-none active:bg-[#180e2a] transition">
          <div class="flex items-center space-x-2.5 min-w-0 pr-2">
            <div class="flex-shrink-0">${muscleIcon}</div>
            <div class="min-w-0">
              <div class="flex items-center space-x-2 flex-wrap gap-y-0.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-purple-400">Ej. ${exIndex + 1}</span>
                ${targetRepsBadge}
              </div>
              <h3 class="text-sm font-bold text-white leading-tight truncate">${item.exerciseName}</h3>
            </div>
          </div>
          <div class="flex items-center space-x-2 flex-shrink-0">
            <span id="ex-vol-${exIndex}" class="text-[11px] font-semibold text-fuchsia-400 mono">${exerciseVolume > 0 ? exerciseVolume + ' kg' : ''}</span>
            <span class="text-[11px] text-purple-400 font-semibold">${setsCount} ${setsCount === 1 ? 'serie' : 'series'}</span>
            <i id="ex-chevron-${exIndex}" data-lucide="chevron-down" class="w-4 h-4 text-purple-400 transition-transform duration-200" ${isOpen ? 'style="transform: rotate(180deg);"' : ''}></i>
            <button type="button" onclick="event.stopPropagation(); removeExerciseFromSession(${exIndex})" class="p-1.5 text-purple-400/50 hover:text-rose-400 transition ml-1" title="Eliminar ejercicio">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- CONTENIDO DESPLEGABLE -->
        <div id="${collapseId}" class="${isOpen ? '' : 'hidden'} px-4 pb-4 space-y-3 border-t border-[#2a1645]">
          <div class="pt-3 space-y-2">
            <!-- Cabecera tabla -->
            <div class="grid grid-cols-12 gap-1 text-[10px] font-semibold text-purple-300/60 uppercase tracking-wider text-center px-1">
              <div class="col-span-2">Serie</div>
              <div class="col-span-4">Carga (kg)</div>
              <div class="col-span-3">Reps</div>
              <div class="col-span-2">RIR</div>
              <div class="col-span-1"></div>
            </div>

            <div class="space-y-1.5">
              ${item.sets.map((set, setIndex) => `
                <div class="grid grid-cols-12 gap-1 items-center bg-[#170e28] p-1.5 rounded-xl border border-[#2f184e]">
                  <div class="col-span-2 text-center text-xs font-bold text-purple-400">#${setIndex + 1}</div>
                  <div class="col-span-4">
                    <input type="number" step="0.5" value="${set.weight}" placeholder="0"
                      oninput="updateSetDataLive(${exIndex}, ${setIndex}, 'weight', this.value)"
                      class="w-full bg-[#0d071a] border border-[#37195c] rounded-lg py-1 px-1.5 text-center text-xs text-white font-semibold focus:outline-none focus:border-purple-500">
                  </div>
                  <div class="col-span-3">
                    <input type="number" min="1" value="${set.reps || 1}" placeholder="1"
                      oninput="updateSetDataLive(${exIndex}, ${setIndex}, 'reps', this.value)"
                      class="w-full bg-[#0d071a] border border-[#37195c] rounded-lg py-1 px-1.5 text-center text-xs text-white font-semibold focus:outline-none focus:border-purple-500">
                  </div>
                  <div class="col-span-2">
                    <input type="number" step="1" max="6" min="0" value="${set.rir !== undefined ? set.rir : 2}"
                      oninput="updateSetDataLive(${exIndex}, ${setIndex}, 'rir', this.value)"
                      class="w-full bg-[#0d071a] border border-[#37195c] rounded-lg py-1 px-1 text-center text-[11px] text-purple-200 focus:outline-none focus:border-purple-500" placeholder="2" title="RIR">
                  </div>
                  <div class="col-span-1 text-center flex flex-col items-center gap-0.5">
                    ${setIndex < item.sets.length - 1 ? `
                    <button type="button" onclick="copySetToNext(${exIndex}, ${setIndex})" class="text-fuchsia-400/70 hover:text-fuchsia-300 p-0.5" title="Copiar a siguiente">
                      <i data-lucide="copy" class="w-3 h-3"></i>
                    </button>` : `<div class="w-3 h-3"></div>`}
                    <button type="button" onclick="removeSet(${exIndex}, ${setIndex})" class="text-purple-400/50 hover:text-rose-400 p-0.5">
                      <i data-lucide="minus-circle" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <button type="button" onclick="addSetToExercise(${exIndex})" class="w-full py-1.5 rounded-lg bg-[#180e2a] hover:bg-[#23133d] text-purple-300 text-xs font-semibold flex items-center justify-center space-x-1 border border-[#37195c] transition">
            <i data-lucide="plus" class="w-3.5 h-3.5 text-fuchsia-400"></i>
            <span>Añadir Serie</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="mb-3">${bodyMapHtml}</div>
    ${exerciseCards}
  `;

  lucide.createIcons();
}

function updateSetData(exIndex, setIndex, field, value) {
  updateSetDataLive(exIndex, setIndex, field, value);
}

function addSetToExercise(exIndex) {
  const ex = currentSession.exercises[exIndex];
  if (!ex) return;
  const lastSet = ex.sets[ex.sets.length - 1];
  const newSet = lastSet ? { ...lastSet, reps: 1 } : { weight: 0, reps: 1, rir: 2 };
  ex.sets.push(newSet);
  openExerciseIndices.add(exIndex); // Mantener abierto
  autosaveSession();
  renderSessionExercises();
  startRestTimer(90);
}

function removeSet(exIndex, setIndex) {
  const ex = currentSession.exercises[exIndex];
  if (!ex) return;
  if (ex.sets.length > 1) {
    ex.sets.splice(setIndex, 1);
    openExerciseIndices.add(exIndex); // Mantener abierto
  } else {
    removeExerciseFromSession(exIndex);
    return;
  }
  autosaveSession();
  renderSessionExercises();
}

function copySetToNext(exIndex, setIndex) {
  const ex = currentSession.exercises[exIndex];
  if (!ex) return;
  const src = ex.sets[setIndex];
  const dst = ex.sets[setIndex + 1];
  if (!src || !dst) return;
  dst.weight = src.weight;
  dst.reps   = src.reps;
  dst.rir    = src.rir;
  openExerciseIndices.add(exIndex); // Mantener abierto
  autosaveSession();
  renderSessionExercises();
  showToast('Serie copiada ✓');
}

function removeExerciseFromSession(exIndex) {
  currentSession.exercises.splice(exIndex, 1);
  openExerciseIndices.delete(exIndex);
  // Re-mapear los índices abiertos si cambiaron de posición
  const newOpen = new Set();
  openExerciseIndices.forEach(idx => {
    if (idx < exIndex) newOpen.add(idx);
    else if (idx > exIndex) newOpen.add(idx - 1);
  });
  openExerciseIndices.clear();
  newOpen.forEach(idx => openExerciseIndices.add(idx));

  autosaveSession();
  renderSessionExercises();
}

function saveCurrentWorkout() {
  const dateInput = document.getElementById('workout-date');
  const tagInput = document.getElementById('workout-tag');

  if (currentSession.exercises.length === 0) {
    alert('Añade al menos un ejercicio antes de guardar.');
    return;
  }

  const workoutDate = dateInput.value || new Date().toISOString().split('T')[0];
  const isEditing = Boolean(currentSession.id);
  const workoutId = currentSession.id || ('w_' + Date.now());

  const workoutRecord = {
    id: workoutId,
    date: workoutDate,
    tag: tagInput.value.trim() || 'Entrenamiento General',
    exercises: JSON.parse(JSON.stringify(currentSession.exercises))
  };

  DB.saveWorkout(workoutRecord);
  showToast(isEditing ? '¡Entrenamiento actualizado y rectificado!' : '¡Entrenamiento registrado con éxito!');

  currentSession.id = null;
  currentSession.exercises = [];
  currentSession.tag = '';
  tagInput.value = '';
  clearSessionDraft();
  updateEditWorkoutBanner();
  renderSessionExercises();
  renderHistory();
  renderPRs();
  updateChart();

  calendarSelectedDate = workoutDate;
  renderCalendar();
  updateHomeProgressChart();
}

function editWorkout(workoutId) {
  const workouts = DB.getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  if (!workout) {
    showToast('No se encontró el entrenamiento');
    return;
  }

  if (currentSession.exercises.length > 0 && currentSession.id !== workoutId) {
    if (!confirm('Hay un entrenamiento o borrador en curso sin guardar. ¿Deseas descartarlo para editar este entrenamiento?')) {
      return;
    }
  }

  currentSession.id = workout.id;
  currentSession.date = workout.date || new Date().toISOString().split('T')[0];
  currentSession.tag = workout.tag || '';
  currentSession.exercises = JSON.parse(JSON.stringify(workout.exercises || []));

  const dateInput = document.getElementById('workout-date');
  const tagInput = document.getElementById('workout-tag');
  if (dateInput) dateInput.value = currentSession.date;
  if (tagInput) tagInput.value = currentSession.tag;

  openExerciseIndices.clear();
  currentSession.exercises.forEach((_, idx) => openExerciseIndices.add(idx));

  updateEditWorkoutBanner();
  autosaveSession();
  renderSessionExercises();

  // Cambiar a la pestaña de entrenar
  const workoutNavBtn = document.querySelector('.nav-item[data-target="tab-workout"]');
  if (workoutNavBtn) workoutNavBtn.click();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast(`✏️ Editando: ${workout.tag || 'Entrenamiento'}`);
}

function cancelEditWorkout() {
  if (!confirm('¿Deseas cancelar la edición? Se perderán los cambios no guardados.')) {
    return;
  }
  currentSession.id = null;
  currentSession.exercises = [];
  currentSession.tag = '';
  currentSession.date = new Date().toISOString().split('T')[0];

  const tagInput = document.getElementById('workout-tag');
  if (tagInput) tagInput.value = '';
  const dateInput = document.getElementById('workout-date');
  if (dateInput) dateInput.value = currentSession.date;

  clearSessionDraft();
  updateEditWorkoutBanner();
  renderSessionExercises();
  showToast('Edición cancelada');
}

function updateEditWorkoutBanner() {
  const banner = document.getElementById('editing-workout-banner');
  const subText = document.getElementById('editing-workout-sub');
  const saveBtnText = document.getElementById('btn-save-workout-text');

  if (currentSession && currentSession.id) {
    if (banner) banner.classList.remove('hidden');
    if (subText) subText.innerText = `Rectificando sesión del ${currentSession.date || ''} (${currentSession.tag || 'Sin título'})`;
    if (saveBtnText) saveBtnText.innerText = 'Guardar Rectificación / Cambios';
  } else {
    if (banner) banner.classList.add('hidden');
    if (saveBtnText) saveBtnText.innerText = 'Guardar Sesión Completada';
  }
  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// HISTORIAL Y RÉCORDS PERSONALES (PRs)
// -------------------------------------------------------------
function calculate1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + (reps / 30)));
}

function calculateSessionVolume(workout) {
  let volume = 0;
  workout.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      volume += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
    });
  });
  return volume;
}

function renderPRs() {
  const workouts = DB.getWorkouts();
  const prMap = {};

  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      if (!prMap[ex.exerciseName]) {
        prMap[ex.exerciseName] = { maxWeight: 0, best1RM: 0, bestSet: '' };
      }
      ex.sets.forEach(s => {
        const wVal = parseFloat(s.weight) || 0;
        const rVal = parseInt(s.reps) || 0;
        const est1RM = calculate1RM(wVal, rVal);

        if (wVal > prMap[ex.exerciseName].maxWeight) {
          prMap[ex.exerciseName].maxWeight = wVal;
        }
        if (est1RM > prMap[ex.exerciseName].best1RM) {
          prMap[ex.exerciseName].best1RM = est1RM;
          prMap[ex.exerciseName].bestSet = `${wVal}kg x ${rVal}`;
        }
      });
    });
  });

  const prContainer = document.getElementById('prs-list');
  const prCount = document.getElementById('pr-count');
  if (!prContainer) return;

  const entries = Object.entries(prMap);
  if (prCount) prCount.innerText = `${entries.length} ejercicios con marcas`;

  if (entries.length === 0) {
    prContainer.innerHTML = `<p class="col-span-2 text-purple-400/50 text-center py-2">Registra entrenamientos para ver tus récords.</p>`;
    return;
  }

  prContainer.innerHTML = entries.slice(0, 6).map(([name, data]) => `
    <div class="bg-[#170e28] p-2.5 rounded-xl border border-[#2e184c] flex flex-col justify-between">
      <p class="text-[11px] font-semibold text-purple-200 truncate" title="${name}">${name}</p>
      <div class="flex items-baseline justify-between mt-1.5">
        <span class="text-sm font-extrabold text-fuchsia-400">${data.maxWeight} kg</span>
        <span class="text-[10px] text-purple-400/80 font-mono">1RM ~${data.best1RM}kg</span>
      </div>
    </div>
  `).join('');
}

function renderHistory(filterText = '') {
  const container = document.getElementById('history-list');
  if (!container) return;

  let workouts = DB.getWorkouts();

  if (filterText) {
    const term = filterText.toLowerCase();
    workouts = workouts.filter(w => {
      const matchTag = w.tag.toLowerCase().includes(term);
      const matchEx = w.exercises.some(e => e.exerciseName.toLowerCase().includes(term));
      return matchTag || matchEx;
    });
  }

  if (workouts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 bg-[#110a1f] border border-[#2a1645] rounded-2xl">
        <i data-lucide="calendar-x" class="w-8 h-8 text-purple-500/40 mx-auto mb-2"></i>
        <p class="text-sm font-semibold text-purple-300">No se encontraron sesiones</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = workouts.map(w => {
    const totalVol = calculateSessionVolume(w);
    const dateFormatted = new Date(w.date + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

    return `
      <div class="bg-[#110a1f] border border-[#2a1645] rounded-2xl p-4 shadow space-y-3">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="text-sm font-bold text-white">${w.tag}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1035] text-purple-300 font-medium border border-[#3b1b66]">${w.exercises.length} ejerc.</span>
            </div>
            <p class="text-[11px] text-purple-300/70 capitalize mt-0.5">${dateFormatted}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-fuchsia-400">${totalVol.toLocaleString()} kg</span>
            <p class="text-[10px] text-purple-400/60">Volumen total</p>
          </div>
        </div>

        <div class="space-y-1.5 pt-2 border-t border-[#23123b] text-xs">
          ${w.exercises.map(ex => {
            const bestSet = ex.sets.reduce((max, s) => s.weight > max.weight ? s : max, ex.sets[0] || { weight: 0, reps: 0 });
            return `
              <div class="flex items-center justify-between text-purple-200">
                <span class="truncate max-w-[65%] text-[11px]">${ex.exerciseName}</span>
                <span class="font-mono text-[11px] text-purple-400/90">
                  ${ex.sets.length} series | Top: <strong class="text-fuchsia-300">${bestSet.weight}kg</strong> x${bestSet.reps}
                </span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="flex items-center justify-end space-x-2 pt-1 border-t border-[#23123b]/60">
          <button onclick="editWorkout('${w.id}')" class="px-2.5 py-1 rounded-xl glass-pill hover:bg-purple-600/30 text-fuchsia-300 hover:text-white text-[11px] font-bold flex items-center space-x-1 transition">
            <i data-lucide="pencil" class="w-3 h-3 text-fuchsia-400"></i>
            <span>Editar</span>
          </button>
          <button onclick="deleteWorkoutEntry('${w.id}')" class="px-2 py-1 text-[11px] text-rose-400/80 hover:text-rose-300 flex items-center space-x-1 transition">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function deleteWorkoutEntry(id) {
  if (confirm('¿Seguro que deseas eliminar esta sesión de entrenamiento?')) {
    DB.deleteWorkout(id);
    if (currentSession && currentSession.id === id) {
      currentSession.id = null;
      currentSession.exercises = [];
      currentSession.tag = '';
      const tagInput = document.getElementById('workout-tag');
      if (tagInput) tagInput.value = '';
      clearSessionDraft();
      updateEditWorkoutBanner();
      renderSessionExercises();
    }
    renderHistory();
    renderPRs();
    updateChart();
    renderCalendar();
    showToast('Sesión eliminada');
  }
}

// -------------------------------------------------------------
// GRÁFICOS Y ESTADÍSTICAS (CHART.JS)
// -------------------------------------------------------------
function setupChartControls() {
  const metricTypeSelect = document.getElementById('chart-metric-type');
  const exSelectContainer = document.getElementById('chart-exercise-select-container');
  const exSelect = document.getElementById('chart-exercise-select');
  const routineSelectContainer = document.getElementById('chart-routine-select-container');
  const routineSelect = document.getElementById('chart-routine-select');

  const exercises = DB.getExercises();
  exSelect.innerHTML = exercises.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

  const updateRoutineDropdown = () => {
    if (!routineSelect) return;
    const workouts = DB.getWorkouts();
    const tags = [...new Set(workouts.map(w => w.tag || 'Entrenamiento General').filter(Boolean))];
    let html = '<option value="all">Todas las Sesiones</option>';
    tags.forEach(t => {
      html += `<option value="${t}">${t}</option>`;
    });
    routineSelect.innerHTML = html;
  };

  updateRoutineDropdown();

  metricTypeSelect.addEventListener('change', () => {
    const val = metricTypeSelect.value;
    if (val === 'volume') {
      if (routineSelectContainer) routineSelectContainer.classList.remove('hidden');
    } else {
      if (routineSelectContainer) routineSelectContainer.classList.add('hidden');
    }

    if (val === 'exercise-weight' || val === 'exercise-1rm') {
      exSelectContainer.classList.remove('hidden');
    } else {
      exSelectContainer.classList.add('hidden');
    }
    updateChart();
  });

  if (routineSelect) {
    routineSelect.addEventListener('change', () => {
      updateChart();
    });
  }

  exSelect.addEventListener('change', () => {
    updateChart();
  });
}

function updateChart() {
  const metricType = document.getElementById('chart-metric-type').value;
  const selectedExId = document.getElementById('chart-exercise-select').value;
  const routineSelect = document.getElementById('chart-routine-select');
  const selectedRoutineTag = routineSelect ? routineSelect.value : 'all';
  const ctx = document.getElementById('mainChart');
  if (!ctx) return;

  // Ordenar cronolÃ³gicamente ascendente (antiguo a reciente) para que el grÃ¡fico vaya de izquierda a derecha
  const rawWorkouts = DB.getWorkouts();
  const sortedWorkouts = rawWorkouts.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  const rawWeights = DB.getWeights();
  const sortedWeights = rawWeights.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  // Actualizar opciones de rutinas si hay nuevas registradas
  if (routineSelect && rawWorkouts.length > 0) {
    const tags = [...new Set(rawWorkouts.map(w => w.tag || 'Entrenamiento General').filter(Boolean))];
    const currVal = routineSelect.value || 'all';
    let html = '<option value="all">Todas las Sesiones</option>';
    tags.forEach(t => {
      html += `<option value="${t}">${t}</option>`;
    });
    routineSelect.innerHTML = html;
    routineSelect.value = tags.includes(currVal) ? currVal : 'all';
  }

  const statWorkouts = document.getElementById('stat-total-workouts');
  const statTotalVol = document.getElementById('stat-total-volume');
  const statAvgVol = document.getElementById('stat-avg-volume');

  let totalVolAll = 0;
  rawWorkouts.forEach(w => totalVolAll += calculateSessionVolume(w));
  statWorkouts.innerText = rawWorkouts.length;
  statTotalVol.innerText = (totalVolAll / 1000).toFixed(1) + ' t';
  statAvgVol.innerText = rawWorkouts.length ? Math.round(totalVolAll / rawWorkouts.length) + ' kg' : '0 kg';

  let labels = [];
  let dataPoints = [];
  let labelName = '';
  let borderColor = '#a855f7';
  let backgroundColor = 'rgba(168, 85, 247, 0.2)';

  if (metricType === 'volume') {
    let filteredWorkouts = sortedWorkouts;
    if (selectedRoutineTag && selectedRoutineTag !== 'all') {
      filteredWorkouts = sortedWorkouts.filter(w => (w.tag || 'Entrenamiento General') === selectedRoutineTag);
      labelName = `Volumen: ${selectedRoutineTag} (kg)`;
    } else {
      labelName = 'Volumen Total (todas las sesiones)';
    }

    borderColor = '#c084fc';
    backgroundColor = 'rgba(192, 132, 252, 0.2)';
    labels = filteredWorkouts.map(w => {
      const dateStr = w.date.substring(5);
      return dateStr;
    });
    dataPoints = filteredWorkouts.map(w => calculateSessionVolume(w));
  } else if (metricType === 'exercise-weight' || metricType === 'exercise-1rm') {
    const exList = DB.getExercises();
    const exObj = exList.find(e => e.id === selectedExId);
    const exName = exObj ? exObj.name : 'Ejercicio';

    borderColor = '#f43f5e';
    backgroundColor = 'rgba(244, 63, 94, 0.2)';

    sortedWorkouts.forEach(w => {
      const match = w.exercises.find(e => e.exerciseId === selectedExId);
      if (match) {
        labels.push(w.date.substring(5));
        if (metricType === 'exercise-weight') {
          labelName = `Carga Máx: ${exName} (kg)`;
          const maxW = Math.max(...match.sets.map(s => parseFloat(s.weight) || 0));
          dataPoints.push(maxW);
        } else {
          labelName = `1RM Estimado: ${exName} (kg)`;
          const max1RM = Math.max(...match.sets.map(s => calculate1RM(parseFloat(s.weight) || 0, parseInt(s.reps) || 0)));
          dataPoints.push(max1RM);
        }
      }
    });
  } else if (metricType === 'body-weight') {
    labelName = 'Peso Corporal (kg)';
    borderColor = '#38bdf8';
    backgroundColor = 'rgba(56, 189, 248, 0.2)';
    labels = sortedWeights.map(w => w.date.substring(5));
    dataPoints = sortedWeights.map(w => w.weight);
  }

  if (mainChartInstance) {
    mainChartInstance.destroy();
  }

  mainChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['Sin datos'],
      datasets: [{
        label: labelName,
        data: dataPoints.length ? dataPoints : [0],
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: borderColor,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#d8b4fe',
            font: { size: 11, family: 'sans-serif' }
          }
        },
        tooltip: {
          backgroundColor: '#160c2b',
          titleColor: '#f3e8ff',
          bodyColor: '#e9d5ff',
          borderColor: '#4a1d75',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(74, 29, 117, 0.25)' },
          ticks: { color: '#9333ea', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(74, 29, 117, 0.25)' },
          ticks: { color: '#9333ea', font: { size: 10 } }
        }
      }
    }
  });
}

// -------------------------------------------------------------
// GRÁFICO DE MEJORÍA Y PROGRESIÓN EN PANTALLA DE INICIO
// -------------------------------------------------------------
let homeProgressChartInstance = null;

function setupHomeProgressChart() {
  const select = document.getElementById('home-progress-routine-select');
  if (select) {
    select.addEventListener('change', () => {
      updateHomeProgressChart();
    });
  }
  updateHomeProgressChart();
}

function updateHomeProgressChart() {
  const ctx = document.getElementById('homeProgressChart');
  const badge = document.getElementById('home-progress-badge');
  const sub = document.getElementById('home-progress-sub');
  const routineSelect = document.getElementById('home-progress-routine-select');
  if (!ctx) return;

  const rawWorkouts = DB.getWorkouts();
  // Orden cronológico (antiguo a reciente)
  const sortedWorkouts = rawWorkouts.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  // Actualizar opciones del selector de rutinas
  if (routineSelect && rawWorkouts.length > 0) {
    const tags = [...new Set(rawWorkouts.map(w => w.tag || 'Entrenamiento General').filter(Boolean))];
    const currVal = routineSelect.value || 'all';
    let html = '<option value="all">Todas las rutinas</option>';
    tags.forEach(t => {
      html += `<option value="${t}">${t}</option>`;
    });
    routineSelect.innerHTML = html;
    routineSelect.value = tags.includes(currVal) ? currVal : 'all';
  }

  const selectedRoutine = routineSelect ? routineSelect.value : 'all';
  const filteredWorkouts = selectedRoutine === 'all'
    ? sortedWorkouts
    : sortedWorkouts.filter(w => (w.tag || 'Entrenamiento General') === selectedRoutine);

  if (filteredWorkouts.length < 2) {
    if (badge) badge.innerText = filteredWorkouts.length === 1 ? '100%' : '--%';
    if (sub) {
      sub.innerText = filteredWorkouts.length === 1
        ? 'Base inicial fijada. Registra tu próxima sesión para ver la mejora.'
        : 'Registra entrenos para ver tu mejoría porcentual.';
    }

    if (homeProgressChartInstance) {
      homeProgressChartInstance.destroy();
      homeProgressChartInstance = null;
    }

    homeProgressChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: filteredWorkouts.length ? [filteredWorkouts[0].date.substring(5)] : ['Sin datos'],
        datasets: [{
          label: 'Rendimiento Base',
          data: filteredWorkouts.length ? [100] : [0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#160c2b',
            titleColor: '#f3e8ff',
            bodyColor: '#e9d5ff',
            borderColor: '#34d399',
            borderWidth: 1,
            callbacks: {
              label: (item) => `Rendimiento: ${item.formattedValue}%`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(74, 29, 117, 0.15)' },
            ticks: { color: '#a78bfa', font: { size: 9 } }
          },
          y: {
            min: 80,
            max: 120,
            grid: { color: 'rgba(74, 29, 117, 0.15)' },
            ticks: { color: '#a78bfa', font: { size: 9 }, callback: (v) => `${v}%` }
          }
        }
      }
    });
    return;
  }

  // CALCULAR MEJORÍA RELATIVA ENTRE SESIONES:
  // Para evitar comparar entrenos de músculos completamente distintos (ej: pierna con 12000 kg vs hombro con 4000 kg),
  // se busca la sesión ANTERIOR DE LA MISMA RUTINA (o con los mismos ejercicios).
  const baselineIndex = 100;
  const progressPercentages = [baselineIndex];
  const labels = [filteredWorkouts[0].date.substring(5)];

  // Guardar el historial previo por rutina / tag para poder comparar cada sesión con su homóloga anterior
  const lastWorkoutByTag = {};
  lastWorkoutByTag[filteredWorkouts[0].tag || 'Entrenamiento General'] = filteredWorkouts[0];

  for (let i = 1; i < filteredWorkouts.length; i++) {
    const currW = filteredWorkouts[i];
    const currTag = currW.tag || 'Entrenamiento General';
    labels.push(currW.date.substring(5));

    // Buscar la sesión previa de la misma rutina; si no existe, la sesión previa inmediata
    const prevW = lastWorkoutByTag[currTag] || filteredWorkouts[i - 1];

    // Buscar ejercicios coincidentes entre esta sesión y su anterior homóloga
    const matchedImprovements = [];
    currW.exercises.forEach(currEx => {
      const prevEx = prevW.exercises.find(e => e.exerciseId === currEx.exerciseId);
      if (prevEx && prevEx.sets.length > 0 && currEx.sets.length > 0) {
        const prev1RM = Math.max(...prevEx.sets.map(s => calculate1RM(parseFloat(s.weight) || 0, parseInt(s.reps) || 0)));
        const curr1RM = Math.max(...currEx.sets.map(s => calculate1RM(parseFloat(s.weight) || 0, parseInt(s.reps) || 0)));
        if (prev1RM > 0) {
          matchedImprovements.push((curr1RM - prev1RM) / prev1RM);
        }
      }
    });

    let stepFactor = 0;
    if (matchedImprovements.length > 0) {
      // Promedio de mejoría en ejercicios comunes de la rutina
      stepFactor = matchedImprovements.reduce((a, b) => a + b, 0) / matchedImprovements.length;
    } else if (prevW.id !== currW.id && prevW.tag === currW.tag) {
      // Misma rutina pero sin ejercicios exactamente iguales: comparar volumen
      const prevVol = calculateSessionVolume(prevW);
      const currVol = calculateSessionVolume(currW);
      if (prevVol > 0) {
        stepFactor = (currVol - prevVol) / prevVol;
      }
    } else {
      // Primera vez que se hace esta rutina: no penaliza ni suma artificialmente
      stepFactor = 0;
    }

    // Suavizar posibles saltos atípicos a +/- 25% por sesión
    stepFactor = Math.max(-0.25, Math.min(0.25, stepFactor));

    const lastVal = progressPercentages[progressPercentages.length - 1];
    const nextVal = Math.round((lastVal * (1 + stepFactor)) * 10) / 10;
    progressPercentages.push(nextVal);

    // Actualizar última sesión registrada para esta rutina
    lastWorkoutByTag[currTag] = currW;
  }

  // Si estamos en la vista global ("Todas las rutinas"), el porcentaje resumen mostrado
  // es la media aritmética de la progresión conseguida en cada rutina por separado.
  let totalChange = 0;
  if (selectedRoutine === 'all') {
    const routineTags = [...new Set(sortedWorkouts.map(w => w.tag || 'Entrenamiento General').filter(Boolean))];
    const routineDeltas = [];

    routineTags.forEach(tag => {
      const tagWorkouts = sortedWorkouts.filter(w => (w.tag || 'Entrenamiento General') === tag);
      if (tagWorkouts.length >= 2) {
        const firstW = tagWorkouts[0];
        const lastW = tagWorkouts[tagWorkouts.length - 1];
        const matchImp = [];
        lastW.exercises.forEach(currEx => {
          const firstEx = firstW.exercises.find(e => e.exerciseId === currEx.exerciseId);
          if (firstEx && firstEx.sets.length > 0 && currEx.sets.length > 0) {
            const f1RM = Math.max(...firstEx.sets.map(s => calculate1RM(parseFloat(s.weight) || 0, parseInt(s.reps) || 0)));
            const l1RM = Math.max(...currEx.sets.map(s => calculate1RM(parseFloat(s.weight) || 0, parseInt(s.reps) || 0)));
            if (f1RM > 0) matchImp.push((l1RM - f1RM) / f1RM);
          }
        });

        if (matchImp.length > 0) {
          const avg = matchImp.reduce((a, b) => a + b, 0) / matchImp.length;
          routineDeltas.push(avg * 100);
        } else {
          const fVol = calculateSessionVolume(firstW);
          const lVol = calculateSessionVolume(lastW);
          if (fVol > 0) routineDeltas.push(((lVol - fVol) / fVol) * 100);
        }
      }
    });

    if (routineDeltas.length > 0) {
      totalChange = Math.round((routineDeltas.reduce((a, b) => a + b, 0) / routineDeltas.length) * 10) / 10;
    } else {
      totalChange = Math.round((progressPercentages[progressPercentages.length - 1] - 100) * 10) / 10;
    }
  } else {
    totalChange = Math.round((progressPercentages[progressPercentages.length - 1] - 100) * 10) / 10;
  }

  const isPositive = totalChange >= 0;

  if (badge) {
    badge.innerText = `${isPositive ? '+' : ''}${totalChange}%`;
    badge.className = `text-2xl font-black mono tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`;
  }
  if (sub) {
    sub.innerText = `${isPositive ? 'Progreso positivo' : 'Descenso de rendimiento'} vs 1ª sesión (${filteredWorkouts.length} entrenos)`;
  }

  const primaryColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

  if (homeProgressChartInstance) {
    homeProgressChartInstance.destroy();
    homeProgressChartInstance = null;
  }

  homeProgressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Nivel de Rendimiento',
        data: progressPercentages,
        borderColor: primaryColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3.5,
        pointHoverRadius: 5.5,
        pointBackgroundColor: primaryColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#160c2b',
          titleColor: '#f3e8ff',
          bodyColor: '#e9d5ff',
          borderColor: isPositive ? '#34d399' : '#fb7185',
          borderWidth: 1,
          callbacks: {
            label: (item) => {
              const diffFromBase = Math.round((item.raw - 100) * 10) / 10;
              return `Rendimiento: ${item.raw}% (${diffFromBase >= 0 ? '+' : ''}${diffFromBase}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(74, 29, 117, 0.15)' },
          ticks: { color: '#a78bfa', font: { size: 9 } }
        },
        y: {
          grid: { color: 'rgba(74, 29, 117, 0.15)' },
          ticks: {
            color: '#a78bfa',
            font: { size: 9 },
            callback: (v) => `${v}%`
          }
        }
      }
    }
  });
}
// -------------------------------------------------------------
let currentExCategoryFilter = 'all';

function renderExercisesLibrary() {
  const container = document.getElementById('exercises-library-list');
  const searchInput = document.getElementById('exercise-search-input');
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const exercises = DB.getExercises();

  const filtered = exercises.filter(e => {
    const matchName = e.name.toLowerCase().includes(searchTerm);
    if (!matchName) return false;

    if (currentExCategoryFilter === 'all') return true;
    if (currentExCategoryFilter === 'custom') return e.isCustom === true;
    return e.category === currentExCategoryFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 bg-[#110a1f] border border-[#2a1645] rounded-2xl">
        <p class="text-xs text-purple-400/60">No se encontraron ejercicios en esta categoría</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(e => `
    <div class="bg-[#110a1f] border border-[#2a1645] rounded-xl p-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="flex-shrink-0">${getMuscleIcon(e.category)}</div>
        <div>
          <div class="flex items-center space-x-2">
            <h4 class="text-xs font-bold text-white">${e.name}</h4>
            ${e.isCustom ? '<span class="text-[9px] bg-purple-500/20 text-fuchsia-300 px-1.5 py-0.5 rounded font-semibold border border-purple-500/30">Propio</span>' : ''}
          </div>
          <p class="text-[10px] text-purple-300/70 mt-0.5">${e.category} • ${e.equipment}</p>
        </div>
      </div>
      <div class="flex items-center space-x-1">
        <button onclick="startSessionWithExercise('${e.id}')" class="px-2.5 py-1 rounded-lg bg-[#1a0f30] hover:bg-[#251545] text-purple-300 text-[11px] font-semibold flex items-center space-x-1 border border-[#321a52]">
          <i data-lucide="plus" class="w-3 h-3 text-fuchsia-400"></i>
          <span>Añadir</span>
        </button>
        ${e.isCustom ? `
          <button onclick="openEditExerciseModal('${e.id}')" class="p-1 text-purple-400/70 hover:text-fuchsia-300 transition" title="Editar ejercicio">
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteCustomExercise('${e.id}')" class="p-1 text-purple-400/50 hover:text-rose-400">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function startSessionWithExercise(exerciseId) {
  document.querySelector('.nav-item[data-target="tab-workout"]').click();
  addExerciseToSession(exerciseId);
}

function deleteCustomExercise(id) {
  if (confirm('¿Eliminar este ejercicio propio de la biblioteca?')) {
    DB.deleteCustomExercise(id);
    renderExercisesLibrary();
    setupChartControls();
    showToast('Ejercicio eliminado');
  }
}

function openExercisePicker() {
  const modal = document.getElementById('modal-exercise-picker');
  const listContainer = document.getElementById('picker-exercise-list');
  const searchInput = document.getElementById('picker-search-input');
  searchInput.value = '';

  const renderPickerList = (term = '') => {
    const exercises = DB.getExercises().filter(e => e.name.toLowerCase().includes(term.toLowerCase()));
    listContainer.innerHTML = exercises.map(e => `
      <div onclick="selectPickerExercise('${e.id}')" class="p-3 bg-[#170e28] hover:bg-[#23143d] rounded-xl cursor-pointer border border-[#2e184c] flex items-center justify-between transition">
        <div class="flex items-center space-x-2">
          <div class="flex-shrink-0">${getMuscleIcon(e.category)}</div>
          <div>
            <p class="text-xs font-bold text-white">${e.name}</p>
            <span class="text-[10px] text-purple-300/70">${e.category} • ${e.equipment}</span>
          </div>
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-purple-500"></i>
      </div>
    `).join('');
    lucide.createIcons();
  };

  renderPickerList();
  searchInput.oninput = (ev) => renderPickerList(ev.target.value);

  modal.classList.remove('hidden');
}

function selectPickerExercise(id) {
  document.getElementById('modal-exercise-picker').classList.add('hidden');
  addExerciseToSession(id);
}

// -------------------------------------------------------------
// PERFIL, METAS Y PESO CORPORAL
// -------------------------------------------------------------
function loadProfile() {
  const profile = DB.getProfile();
  if (profile.name) document.getElementById('profile-name') && (document.getElementById('profile-name').value = profile.name);
  if (profile.gender) document.getElementById('profile-gender') && (document.getElementById('profile-gender').value = profile.gender);
  if (profile.age) document.getElementById('profile-age') && (document.getElementById('profile-age').value = profile.age);
  if (profile.height) document.getElementById('profile-height') && (document.getElementById('profile-height').value = profile.height);
  if (profile.weight) document.getElementById('profile-current-weight') && (document.getElementById('profile-current-weight').value = profile.weight);
  if (profile.activityLevel) document.getElementById('profile-activity') && (document.getElementById('profile-activity').value = profile.activityLevel);

  const weights = DB.getWeights();
  const lastWeight = weights.length ? weights[weights.length - 1].weight : (profile.weight || '--');

  const headerStatus = document.getElementById('header-user-status');
  if (headerStatus) {
    headerStatus.innerText = `${profile.name || 'Atleta'} • ${lastWeight} kg`;
  }

  const badge = document.getElementById('current-weight-badge');
  if (badge) badge.innerText = `${lastWeight} kg`;
}

function updateProfileCalculationsPreview() {
  // Función mantenida vacía para no romper listeners existentes
}

function saveProfileAndCalculate() {
  const weight   = parseFloat(document.getElementById('profile-current-weight').value) || 75;
  const height   = parseFloat(document.getElementById('profile-height').value) || 175;
  const age      = parseInt(document.getElementById('profile-age').value) || 25;
  const gender   = document.getElementById('profile-gender').value || 'male';
  const activity = parseFloat(document.getElementById('profile-activity').value) || 1.55;

  const profile = {
    name: document.getElementById('profile-name').value.trim() || 'Atleta',
    gender,
    age,
    height,
    weight,
    activityLevel: activity
  };

  DB.saveProfile(profile);
  loadProfile();
  showToast('Perfil guardado ✓');
}

function renderWeightHistory() {
  const container = document.getElementById('weight-history-list');
  const weights = DB.getWeights().slice().reverse();

  if (weights.length === 0) {
    container.innerHTML = `<p class="text-purple-400/50 text-center py-2">Sin registros de peso aún.</p>`;
    return;
  }

  container.innerHTML = weights.map((w, idx) => `
    <div class="flex items-center justify-between p-2 rounded-xl bg-[#170e28] border border-[#2e184c]">
      <span class="text-purple-400 font-mono text-[11px]">${w.date}</span>
      <div class="flex items-center space-x-3">
        <span class="font-bold text-white text-xs">${w.weight} kg</span>
        <button onclick="removeWeightEntry(${weights.length - 1 - idx})" class="text-purple-500/50 hover:text-rose-400">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function removeWeightEntry(originalIndex) {
  DB.deleteWeight(originalIndex);
  renderWeightHistory();
  loadProfile();
  updateChart();
  showToast('Registro de peso eliminado');
}

// -------------------------------------------------------------
// TEMPORIZADOR DE DESCANSO
// -------------------------------------------------------------
function startRestTimer(seconds) {
  clearInterval(restTimerInterval);
  restTimerSeconds = seconds;
  const display = document.getElementById('timer-display');

  const updateTimer = () => {
    const mins = Math.floor(restTimerSeconds / 60);
    const secs = restTimerSeconds % 60;
    display.innerText = `Descanso: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if (restTimerSeconds <= 0) {
      clearInterval(restTimerInterval);
      display.innerText = '¡Descanso terminado!';
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    } else {
      restTimerSeconds--;
    }
  };

  updateTimer();
  restTimerInterval = setInterval(updateTimer, 1000);
}

// -------------------------------------------------------------
// EVENT LISTENERS & SETUP
// -------------------------------------------------------------
function setupEventListeners() {
  document.getElementById('btn-save-workout').addEventListener('click', saveCurrentWorkout);
  const btnCancelEdit = document.getElementById('btn-cancel-edit-workout');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', cancelEditWorkout);
  }

  document.getElementById('btn-open-exercise-picker').addEventListener('click', openExercisePicker);
  document.getElementById('btn-close-exercise-picker').addEventListener('click', () => {
    document.getElementById('modal-exercise-picker').classList.add('hidden');
  });

  const customModal = document.getElementById('modal-custom-exercise');
  document.getElementById('btn-create-custom-exercise').addEventListener('click', () => {
    customModal.classList.remove('hidden');
  });
  document.getElementById('btn-close-custom-modal').addEventListener('click', () => {
    customModal.classList.add('hidden');
  });

  document.getElementById('form-custom-exercise').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-ex-name').value.trim();
    const category = document.getElementById('new-ex-category').value;
    const equipment = document.getElementById('new-ex-equipment').value;

    const newEx = {
      id: 'custom-' + Date.now(),
      name,
      category,
      equipment,
      isCustom: true
    };

    DB.saveExercise(newEx);
    customModal.classList.add('hidden');
    document.getElementById('form-custom-exercise').reset();
    renderExercisesLibrary();
    setupChartControls();
    showToast(`Ejercicio "${name}" creado`);
  });

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.remove('bg-purple-600', 'text-white', 'active', 'shadow-sm', 'shadow-purple-900');
        p.classList.add('bg-[#170e28]', 'text-purple-300');
      });
      pill.classList.remove('bg-[#170e28]', 'text-purple-300');
      pill.classList.add('bg-purple-600', 'text-white', 'active', 'shadow-sm', 'shadow-purple-900');
      currentExCategoryFilter = pill.dataset.cat;
      renderExercisesLibrary();
    });
  });

  document.getElementById('exercise-search-input').addEventListener('input', renderExercisesLibrary);
  document.getElementById('history-search').addEventListener('input', (e) => {
    renderHistory(e.target.value);
  });

  document.getElementById('form-profile-calculator').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfileAndCalculate();
  });

  ['profile-current-weight', 'profile-height', 'profile-age', 'profile-gender', 'profile-activity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateProfileCalculationsPreview);
  });

  document.getElementById('form-log-weight').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('weight-entry-date').value;
    const weight = parseFloat(document.getElementById('weight-entry-val').value);
    if (!weight) return;

    DB.addWeight({ date, weight });
    document.getElementById('weight-entry-val').value = '';
    
    const prof = DB.getProfile();
    prof.weight = weight;
    DB.saveProfile(prof);

    renderWeightHistory();
    loadProfile();
    updateChart();
    showToast('Peso corporal registrado');
  });

  document.getElementById('btn-quick-timer').addEventListener('click', () => {
    startRestTimer(90);
  });

  document.getElementById('btn-export-data').addEventListener('click', () => {
    const dataStr = DB.exportAll();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irontrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Copia de seguridad descargada');
  });

  document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const ok = DB.importAll(event.target.result);
      if (ok) {
        showToast('Datos restaurados con éxito');
        setTimeout(() => location.reload(), 800);
      } else {
        alert('Archivo de copia no válido');
      }
    };
    reader.readAsText(file);
  });
}

// -------------------------------------------------------------
// EDITAR RUTINA
// -------------------------------------------------------------
let editingRoutineId = null;

function openEditRoutineModal(routineId) {
  const routine = DB.getRoutines().find(r => r.id === routineId);
  if (!routine) return;

  editingRoutineId = routineId;
  document.getElementById('edit-routine-name').value = routine.name;
  renderEditRoutineExercises(routine.exercises);

  document.getElementById('modal-edit-routine').classList.remove('hidden');
  lucide.createIcons();
}

function renderEditRoutineExercises(exercises) {
  const container = document.getElementById('edit-routine-exercises-list');
  if (!exercises || exercises.length === 0) {
    container.innerHTML = `<p class="text-xs text-purple-400/50 text-center py-4">Sin ejercicios. Pulsa "Añadir Ejercicio".</p>`;
    return;
  }
  container.innerHTML = exercises.map((ex, i) => `
    <div class="bg-[#170e28] border border-[#2f184e] rounded-xl p-3 flex items-center justify-between">
      <div>
        <p class="text-xs font-bold text-white">${ex.exerciseName}</p>
        <div class="flex items-center space-x-2 mt-1">
          <span class="text-[10px] text-purple-400">Series:</span>
          <input type="number" min="1" max="10" value="${ex.targetSets || 3}"
            onchange="updateEditRoutineExSets(${i}, this.value)"
            class="w-12 bg-[#0d071a] border border-[#37195c] rounded-lg py-0.5 px-1.5 text-center text-xs text-white focus:outline-none focus:border-purple-500">
        </div>
      </div>
      <button onclick="removeEditRoutineExercise(${i})" class="p-1 text-purple-400/50 hover:text-rose-400">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

function updateEditRoutineExSets(index, value) {
  const all = DB.getRoutines();
  const routine = all.find(r => r.id === editingRoutineId);
  if (!routine) return;
  routine.exercises[index].targetSets = parseInt(value) || 3;
  localStorage.setItem('it_routines', JSON.stringify(all));
}

function removeEditRoutineExercise(index) {
  const all = DB.getRoutines();
  const routine = all.find(r => r.id === editingRoutineId);
  if (!routine) return;
  routine.exercises.splice(index, 1);
  localStorage.setItem('it_routines', JSON.stringify(all));
  renderEditRoutineExercises(routine.exercises);
}

function setupEditRoutineModal() {
  document.getElementById('btn-close-edit-routine').addEventListener('click', () => {
    document.getElementById('modal-edit-routine').classList.add('hidden');
    editingRoutineId = null;
  });

  document.getElementById('btn-edit-routine-add-exercise').addEventListener('click', () => {
    openExercisePickerForRoutine((selectedEx) => {
      const all = DB.getRoutines();
      const routine = all.find(r => r.id === editingRoutineId);
      if (!routine) return;
      routine.exercises.push({ exerciseId: selectedEx.id, exerciseName: selectedEx.name, targetSets: 3 });
      localStorage.setItem('it_routines', JSON.stringify(all));
      renderEditRoutineExercises(routine.exercises);
    });
  });

  document.getElementById('btn-save-edit-routine').addEventListener('click', () => {
    const newName = document.getElementById('edit-routine-name').value.trim();
    if (!newName) { showToast('El nombre no puede estar vacío'); return; }
    const all = DB.getRoutines();
    const routine = all.find(r => r.id === editingRoutineId);
    if (!routine) return;
    routine.name = newName;
    localStorage.setItem('it_routines', JSON.stringify(all));
    document.getElementById('modal-edit-routine').classList.add('hidden');
    editingRoutineId = null;
    renderRoutinesList();
    populateRoutinePresetsDropdown();
    showToast('Rutina actualizada ✓');
  });
}

// -------------------------------------------------------------
// EDITAR EJERCICIO PROPIO
// -------------------------------------------------------------
function openEditExerciseModal(exerciseId) {
  const ex = DB.getExercises().find(e => e.id === exerciseId);
  if (!ex || !ex.isCustom) return;

  document.getElementById('edit-ex-id').value = ex.id;
  document.getElementById('edit-ex-name').value = ex.name;
  document.getElementById('edit-ex-category').value = ex.category;
  document.getElementById('edit-ex-equipment').value = ex.equipment;

  document.getElementById('modal-edit-exercise').classList.remove('hidden');
}

function setupEditExerciseModal() {
  document.getElementById('btn-close-edit-exercise').addEventListener('click', () => {
    document.getElementById('modal-edit-exercise').classList.add('hidden');
  });

  document.getElementById('form-edit-exercise').addEventListener('submit', (e) => {
    e.preventDefault();
    const id        = document.getElementById('edit-ex-id').value;
    const name      = document.getElementById('edit-ex-name').value.trim();
    const category  = document.getElementById('edit-ex-category').value;
    const equipment = document.getElementById('edit-ex-equipment').value;

    const exercises = DB.getExercises();
    const idx = exercises.findIndex(ex => ex.id === id);
    if (idx === -1) return;

    exercises[idx] = { ...exercises[idx], name, category, equipment };
    localStorage.setItem('it_exercises', JSON.stringify(exercises));

    document.getElementById('modal-edit-exercise').classList.add('hidden');
    renderExercisesLibrary();
    setupChartControls();
    showToast('Ejercicio actualizado ✓');
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.innerText = msg;
  toast.classList.remove('opacity-0', '-translate-y-2');
  toast.classList.add('opacity-100', 'translate-y-0');
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-2');
  }, 2200);
}

// ─────────────────────────────────────────────────────────────────────────────
// BBDD DINOSAURIOS REALISTAS POR PESO (en toneladas) - ICONOS SVG REALISTAS
// ─────────────────────────────────────────────────────────────────────────────
const DINO_DB = [
  {
    name: 'Microraptor',
    minT: 0,
    maxT: 0.5,
    desc: 'pequeñín pero feroz',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 70 22 C 73 18 78 17 83 19 C 88 21 90 25 89 28 C 87 31 83 32 79 31"/>
      <path d="M 85 24 L 85 26 M 82 24 L 82 26.5 M 88 25 L 88 27"/>
      <ellipse cx="84" cy="22" rx="1" ry="0.6" fill="currentColor" stroke="none"/>
      <circle cx="75" cy="21" r="2" fill="none"/>
      <circle cx="75" cy="21" r="0.8" fill="currentColor" stroke="none"/>
      <path d="M 70 22 C 65 24 61 28 58 33 C 55 38 55 42 57 45"/>
      <path d="M 57 45 C 54 50 50 54 44 57 C 38 60 30 61 22 60 C 14 59 8 56 4 52"/>
      <path d="M 4 52 C 2 48 2 44 5 41 C 8 38 13 37 18 38"/>
      <path d="M 4 52 C 6 56 10 59 16 59"/>
      <path d="M 79 31 C 74 36 68 40 62 44 C 56 48 50 52 44 57"/>
      <path d="M 60 35 C 63 40 65 46 64 52 C 61 58 56 62 51 65"/>
      <path d="M 61 37 C 65 43 67 50 66 57"/>
      <path d="M 62 39 C 67 46 69 54 67 61"/>
      <path d="M 64 52 L 68 55 M 62 55 L 66 59 M 59 58 L 63 62 M 55 61 L 59 65 M 51 65 L 55 68"/>
      <path d="M 38 56 C 36 62 36 68 38 74 C 40 80 44 84 48 86"/>
      <path d="M 38 68 L 33 72 M 37 72 L 32 76 M 38 75 L 33 78"/>
      <path d="M 30 59 C 28 65 26 72 24 78 C 22 82 20 84 17 85"/>
      <path d="M 24 78 C 22 80 19 80 17 80"/>
      <path d="M 17 85 C 15 85 13 83 14 81"/>
    `
  },
  {
    name: 'Velociraptor',
    minT: 0.5,
    maxT: 1.5,
    desc: 'ágil como un rayo',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 72 26 C 76 21 83 20 89 23 C 95 26 97 30 95 33 C 92 36 87 37 82 36"/>
      <path d="M 90 27 L 89 30 M 85 27 L 84 30 M 93 28 L 92 31"/>
      <circle cx="78" cy="25" r="2.5" fill="none"/>
      <circle cx="78" cy="25" r="1" fill="currentColor" stroke="none"/>
      <ellipse cx="87" cy="24" rx="1.2" ry="0.7" fill="currentColor" stroke="none"/>
      <path d="M 76 23 C 77 21 80 21 81 23"/>
      <path d="M 72 26 C 66 29 62 33 60 38"/>
      <path d="M 60 38 C 56 42 50 46 42 49 C 34 52 24 53 14 51 C 8 50 3 47 1 44"/>
      <path d="M 1 44 C 2 40 5 38 9 38 C 13 38 17 40 20 43"/>
      <path d="M 82 36 C 76 42 70 48 64 54 C 58 59 50 62 42 61 C 34 60 26 56 20 51 C 14 46 9 42 1 44"/>
      <path d="M 64 44 C 68 50 72 56 74 62 C 73 65 70 66 68 65"/>
      <path d="M 74 62 L 76 65 M 74 62 L 77 63 M 74 62 L 75 59"/>
      <path d="M 65 46 C 68 52 70 59 68 65 M 67 48 C 71 55 72 62 70 67"/>
      <path d="M 44 58 C 47 64 48 70 46 76 C 44 80 40 82 36 82"/>
      <path d="M 46 76 C 44 82 40 86 36 88"/>
      <path d="M 36 88 L 30 88 M 36 88 L 32 90"/>
      <path d="M 46 72 C 50 70 54 68 58 70 C 60 73 57 76 53 74 C 50 73 48 74 48 76"/>
      <path d="M 32 58 C 33 65 32 73 28 80 L 22 80"/>
      <path d="M 28 80 L 23 83 M 28 80 L 20 80"/>
    `
  },
  {
    name: 'Dilophosaurus',
    minT: 1.5,
    maxT: 3,
    desc: 'con cresta y todo',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 69 22 C 72 15 78 13 83 17 C 86 20 85 25 82 27"/>
      <path d="M 65 24 C 68 18 73 16 77 19 C 79 22 78 26 75 28"/>
      <path d="M 75 28 C 80 29 86 30 92 31 C 88 36 83 37 77 37"/>
      <path d="M 90 31 C 91 29 90 27 88 28"/>
      <path d="M 92 31 C 88 38 82 39 77 38"/>
      <path d="M 88 32 L 87 35 M 83 32 L 82 36 M 86 36 L 85 34"/>
      <circle cx="72" cy="24" r="2.2" fill="none"/>
      <circle cx="72" cy="24" r="0.9" fill="currentColor" stroke="none"/>
      <path d="M 69 22 C 62 26 57 32 55 38"/>
      <path d="M 77 37 C 70 44 63 51 57 58 C 51 64 44 68 36 68 C 28 67 20 63 12 57 C 7 53 3 48 1 44"/>
      <path d="M 55 38 C 48 44 40 49 30 52 C 20 54 11 51 5 46 C 3 44 1 44 1 44"/>
      <path d="M 1 44 C 2 40 6 38 10 39"/>
      <path d="M 54 48 C 58 54 61 60 62 65 L 66 64 M 62 65 L 65 67"/>
      <path d="M 40 58 C 43 66 43 75 38 84 L 30 84 M 38 84 L 43 84"/>
      <path d="M 30 61 C 32 69 29 76 24 82 L 18 82"/>
    `
  },
  {
    name: 'Allosaurus',
    minT: 3,
    maxT: 5,
    desc: 'depredador del Jurásico',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 71 23 L 74 18 L 76 23"/>
      <path d="M 76 23 C 82 23 88 25 93 28 C 97 31 98 35 97 38 C 93 41 86 42 79 41"/>
      <path d="M 97 38 C 92 46 84 48 77 46"/>
      <path d="M 93 29 L 92 33 M 88 29 L 87 34 M 83 30 L 82 34"/>
      <path d="M 90 41 L 89 38 M 85 42 L 84 39 M 80 43 L 79 40"/>
      <circle cx="75" cy="25" r="2.5" fill="none"/>
      <circle cx="75" cy="25" r="1" fill="currentColor" stroke="none"/>
      <path d="M 71 23 C 63 28 58 34 56 40"/>
      <path d="M 56 40 C 50 46 42 51 32 54 C 22 56 12 54 6 50 C 3 48 1 45 1 42"/>
      <path d="M 1 42 C 2 38 6 36 11 37 C 15 38 18 41 20 44"/>
      <path d="M 79 41 C 72 50 65 58 57 64 C 48 69 38 70 28 67 C 18 63 10 57 4 49 C 2 46 1 43 1 42"/>
      <path d="M 60 50 C 64 56 67 63 70 70"/>
      <path d="M 70 70 L 74 72 M 70 70 L 73 67 M 70 70 L 72 74"/>
      <path d="M 61 52 C 65 59 68 67 69 73 M 63 54 C 68 62 70 70 70 76"/>
      <path d="M 40 62 C 44 70 46 79 44 87 L 36 87"/>
      <path d="M 44 87 L 38 90 M 44 87 L 50 90 M 44 87 L 44 90"/>
      <path d="M 28 65 C 30 73 29 81 25 87 L 18 87"/>
      <path d="M 25 87 L 20 89 M 25 87 L 31 89"/>
    `
  },
  {
    name: 'Carnotaurus',
    minT: 5,
    maxT: 7,
    desc: 'el toro del Cretácico',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 73 22 C 76 15 82 13 87 17 C 84 21 80 23 76 24"/>
      <path d="M 76 24 C 82 24 90 26 94 29 C 92 33 87 35 82 34"/>
      <path d="M 94 29 C 92 36 86 38 80 36"/>
      <path d="M 90 30 L 89 33 M 85 30 L 84 33"/>
      <path d="M 71 23 C 73 20 77 20 78 23"/>
      <circle cx="74" cy="25" r="2.3" fill="none"/>
      <circle cx="74" cy="25" r="0.9" fill="currentColor" stroke="none"/>
      <path d="M 73 22 C 65 27 60 33 58 40"/>
      <path d="M 58 40 C 52 46 44 51 34 54 C 24 57 14 55 7 51 C 4 48 2 46 1 44"/>
      <path d="M 1 44 C 2 40 5 38 9 38 C 13 38 17 41 19 44"/>
      <path d="M 80 36 C 73 44 67 52 61 60 C 54 66 46 70 37 69 C 28 68 20 63 12 56 C 7 51 3 47 1 44"/>
      <path d="M 61 48 C 63 51 64 54 63 56 M 63 56 L 65 57"/>
      <path d="M 42 64 C 46 72 47 81 44 89 L 36 89"/>
      <path d="M 44 89 L 38 91 M 44 89 L 50 91 M 44 89 L 44 92"/>
      <path d="M 30 66 C 32 74 31 82 27 88 L 20 88"/>
      <path d="M 27 88 L 22 90 M 27 88 L 33 90"/>
    `
  },
  {
    name: 'Triceratops',
    minT: 7,
    maxT: 9,
    desc: 'con tres cuernos imparables',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 32 26 C 32 14 42 10 52 14 C 60 18 64 26 61 34"/>
      <path d="M 35 16 C 37 13 40 13 41 16 M 44 12 C 46 9 49 9 50 12 M 54 13 C 56 10 59 11 59 14"/>
      <path d="M 58 29 C 68 22 78 18 90 18 C 84 23 76 27 65 30"/>
      <path d="M 56 34 C 66 28 75 25 86 25 C 80 29 72 33 63 36"/>
      <path d="M 68 44 L 72 36 L 73 44"/>
      <path d="M 73 44 C 76 46 79 49 78 52 C 76 55 72 56 68 54 C 64 52 61 48 61 44"/>
      <circle cx="62" cy="38" r="2" fill="none"/>
      <circle cx="62" cy="38" r="0.8" fill="currentColor" stroke="none"/>
      <path d="M 32 26 C 24 28 16 34 10 42 C 5 48 2 54 1 58"/>
      <path d="M 1 58 C 4 60 9 60 14 58"/>
      <path d="M 61 44 C 54 50 48 56 42 60 C 36 63 28 64 20 62 C 12 59 6 56 1 58"/>
      <path d="M 54 59 C 55 67 55 76 52 84 L 45 84 M 52 84 L 58 84 M 52 84 L 52 87"/>
      <path d="M 60 55 L 61 79 L 57 79"/>
      <path d="M 22 62 C 23 71 22 80 19 87 L 12 87 M 19 87 L 25 87 M 19 87 L 19 90"/>
      <path d="M 12 65 L 10 83 L 6 83"/>
    `
  },
  {
    name: 'T-Rex',
    minT: 9,
    maxT: 12,
    desc: 'el rey de los dinosaurios',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 67 20 C 73 18 82 19 89 22 C 96 25 100 29 100 33 C 97 37 90 39 82 38"/>
      <path d="M 76 24 C 79 22 83 22 84 25 C 83 27 80 27 78 26"/>
      <circle cx="72" cy="24" r="3" fill="none"/>
      <circle cx="72" cy="24" r="1.2" fill="currentColor" stroke="none"/>
      <path d="M 100 33 C 95 44 86 47 78 44"/>
      <path d="M 97 27 L 96 32 M 92 26 L 91 31 M 87 26 L 86 31 M 82 27 L 81 32"/>
      <path d="M 94 40 L 93 36 M 89 41 L 88 37 M 84 42 L 83 38"/>
      <path d="M 67 20 C 58 25 54 32 53 38"/>
      <path d="M 53 38 C 46 44 38 49 28 52 C 18 55 10 54 4 50 C 2 48 1 46 1 44"/>
      <path d="M 1 44 C 2 40 5 37 10 37 C 14 37 18 40 20 44"/>
      <path d="M 78 44 C 71 54 63 63 54 69 C 44 74 33 73 23 69 C 14 64 7 57 2 48 C 1 46 1 44 1 44"/>
      <path d="M 56 50 C 58 54 59 58 59 61 L 62 60 M 59 61 L 62 63"/>
      <path d="M 54 46 C 57 50 58 56 57 61"/>
      <path d="M 38 56 C 44 66 47 76 44 87 L 34 87"/>
      <path d="M 34 87 L 27 90 M 34 87 L 34 91 M 34 87 L 42 90"/>
      <path d="M 44 70 C 46 78 44 84 40 87"/>
      <path d="M 25 60 C 28 70 27 80 23 87 L 15 87"/>
      <path d="M 23 87 L 17 90 M 23 87 L 23 91 M 23 87 L 30 89"/>
    `
  },
  {
    name: 'Spinosaurus',
    minT: 12,
    maxT: 15,
    desc: 'más grande que el T-Rex',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 30 44 C 32 20 42 10 56 14 C 68 18 74 32 74 44"/>
      <path d="M 36 32 L 36 44 M 42 22 L 42 44 M 48 15 L 48 44 M 54 14 L 54 44 M 60 17 L 60 44 M 66 25 L 66 44 M 71 36 L 71 44"/>
      <path d="M 74 38 C 80 36 90 36 100 37 C 103 39 101 41 95 42 L 78 43"/>
      <circle cx="78" cy="34" r="2" fill="none"/>
      <circle cx="78" cy="34" r="0.8" fill="currentColor" stroke="none"/>
      <path d="M 98 37 L 97 40 M 93 36 L 92 40 M 88 36 L 87 40 M 83 36 L 82 40"/>
      <path d="M 95 42 L 94 39 M 90 42 L 89 39 M 85 42 L 84 39"/>
      <path d="M 30 44 C 22 46 14 48 7 50 C 3 51 1 52 1 52"/>
      <path d="M 1 52 C 4 56 10 58 18 56 C 26 54 32 51 36 48"/>
      <path d="M 78 43 C 70 50 62 56 54 60 C 46 63 38 64 30 62 C 22 60 14 56 8 52 C 4 50 2 51 1 52"/>
      <path d="M 58 56 C 62 63 66 70 70 76"/>
      <path d="M 70 76 L 74 78 M 70 76 L 73 73 M 70 76 L 71 80"/>
      <path d="M 40 62 C 43 70 43 78 40 85 L 33 85"/>
      <path d="M 33 85 L 27 87 M 33 85 L 33 88 M 33 85 L 40 87"/>
      <path d="M 28 64 L 27 82 L 21 82"/>
    `
  },
  {
    name: 'Brachiosaurus',
    minT: 15,
    maxT: 18,
    desc: 'cuello hasta las nubes',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 82 10 C 85 7 90 7 92 10 C 93 13 90 15 87 15"/>
      <ellipse cx="90" cy="10" rx="1.5" ry="0.8" fill="currentColor" stroke="none"/>
      <circle cx="84" cy="11" r="1.5" fill="none"/>
      <circle cx="84" cy="11" r="0.6" fill="currentColor" stroke="none"/>
      <path d="M 82 10 C 78 18 73 28 68 36 C 63 44 58 48 52 51"/>
      <path d="M 87 15 C 82 24 76 34 70 42 C 64 50 58 54 52 57"/>
      <path d="M 52 51 C 44 52 36 54 28 57 C 20 60 14 63 8 68 C 4 71 2 73 1 74"/>
      <path d="M 1 74 C 5 74 10 72 16 70"/>
      <path d="M 52 57 C 44 60 36 62 28 64 C 20 66 14 70 8 73 C 4 75 2 75 1 74"/>
      <path d="M 52 54 C 54 65 54 76 52 87 L 44 87"/>
      <path d="M 44 87 L 38 89 M 44 87 L 44 90 M 44 87 L 51 89"/>
      <path d="M 56 55 L 56 83 L 51 83"/>
      <path d="M 24 64 C 25 73 24 82 21 88 L 14 88"/>
      <path d="M 14 88 L 9 90 M 14 88 L 14 91 M 14 88 L 20 90"/>
      <path d="M 16 68 L 15 85 L 10 85"/>
    `
  },
  {
    name: 'Diplodocus',
    minT: 18,
    maxT: 22,
    desc: 'cola de látigo gigante',
    viewBox: '0 0 120 90',
    paths: `
      <path d="M 108 38 C 110 36 113 36 114 38 C 114 40 111 41 108 41"/>
      <circle cx="109" cy="37" r="1.3" fill="none"/>
      <circle cx="109" cy="37" r="0.5" fill="currentColor" stroke="none"/>
      <path d="M 108 38 C 97 38 85 40 75 44 C 65 46 55 47 44 48"/>
      <path d="M 108 41 C 97 43 85 46 75 50 C 65 52 55 53 44 54"/>
      <path d="M 80 44 L 80 42 M 72 46 L 72 44 M 64 47 L 64 45 M 56 48 L 56 46 M 48 49 L 48 47"/>
      <path d="M 44 48 C 36 49 28 51 20 53 C 12 55 7 54 3 51 C 1 49 1 47 1 45"/>
      <path d="M 1 45 C 2 41 5 39 9 40 C 13 41 16 44 17 47"/>
      <path d="M 44 54 C 36 56 28 58 20 59 C 12 60 7 59 3 55 C 1 53 1 50 1 48"/>
      <path d="M 52 52 C 53 61 53 70 50 79 L 43 79"/>
      <path d="M 43 79 L 37 81 M 43 79 L 43 82 M 43 79 L 50 81"/>
      <path d="M 56 54 L 56 75 L 51 75"/>
      <path d="M 30 56 C 31 65 30 74 27 80 L 20 80"/>
      <path d="M 20 80 L 15 82 M 20 80 L 20 83 M 20 80 L 26 82"/>
      <path d="M 22 59 L 21 76 L 16 76"/>
    `
  },
  {
    name: 'Apatosaurus',
    minT: 22,
    maxT: 26,
    desc: 'coloso del Jurásico',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 90 34 C 93 32 97 32 97 35 C 97 37 94 38 91 38"/>
      <circle cx="91" cy="33" r="1.3" fill="none"/>
      <circle cx="91" cy="33" r="0.5" fill="currentColor" stroke="none"/>
      <path d="M 90 34 C 81 35 72 38 64 43 C 56 48 50 52 44 54"/>
      <path d="M 91 38 C 82 42 72 48 64 54 C 56 59 50 63 44 65"/>
      <path d="M 76 36 L 76 32 C 78 30 80 32 78 35 M 68 40 L 68 36 C 70 34 72 36 70 39 M 60 44 L 60 40 C 62 38 64 40 62 43"/>
      <path d="M 44 54 C 36 55 27 57 18 59 C 11 60 5 59 2 56 C 1 54 1 52 1 50"/>
      <path d="M 1 50 C 2 46 5 44 9 45 C 13 46 16 49 17 52"/>
      <path d="M 44 65 C 36 67 27 68 18 68 C 11 68 5 66 2 62 C 1 60 1 57 1 55"/>
      <path d="M 46 60 C 48 70 48 80 45 88 L 37 88"/>
      <path d="M 37 88 L 31 90 M 37 88 L 37 91 M 37 88 L 45 90"/>
      <path d="M 52 62 L 52 84 L 47 84"/>
      <path d="M 24 64 C 25 73 24 82 21 88 L 16 88"/>
      <path d="M 14 88 L 8 90 M 14 88 L 14 91 M 14 88 L 21 90"/>
      <path d="M 16 68 L 15 84 L 10 84"/>
    `
  },
  {
    name: 'Argentinosaurus',
    minT: 26,
    maxT: 100,
    desc: 'el dinosaurio más pesado',
    viewBox: '0 0 110 90',
    paths: `
      <path d="M 88 24 C 92 22 97 22 98 25 C 98 27 95 28 92 28"/>
      <circle cx="90" cy="23" r="1.5" fill="none"/>
      <circle cx="90" cy="23" r="0.6" fill="currentColor" stroke="none"/>
      <path d="M 88 24 C 81 28 74 34 68 42 C 62 48 56 52 50 55"/>
      <path d="M 92 28 C 85 34 78 42 72 50 C 65 57 58 61 50 65"/>
      <path d="M 50 55 C 40 56 30 58 20 60 C 12 62 6 61 2 57 C 1 55 1 53 1 50"/>
      <path d="M 1 50 C 2 46 5 44 10 44 C 14 44 17 48 18 51"/>
      <path d="M 50 65 C 40 67 30 68 20 70 C 12 71 6 69 2 65 C 1 63 1 60 1 57"/>
      <path d="M 50 56 C 52 53 55 53 56 56 M 42 58 C 44 55 47 55 48 58 M 34 59 C 36 56 39 57 40 59"/>
      <path d="M 52 60 C 54 70 54 80 51 88 L 43 88"/>
      <path d="M 43 88 L 36 90 M 43 88 L 43 92 M 43 88 L 51 90"/>
      <path d="M 58 62 L 58 84 L 53 84"/>
      <path d="M 22 66 C 23 76 22 85 19 89 L 11 89"/>
      <path d="M 11 89 L 5 91 M 11 89 L 11 92 M 11 89 L 18 91"/>
      <path d="M 14 70 L 13 85 L 8 85"/>
    `
  }
];

function getDinoForKg(totalKg) {
  const totalT = totalKg / 1000;
  const dino = DINO_DB.find(d => totalT >= d.minT && totalT < d.maxT)
    || DINO_DB[DINO_DB.length - 1];
  return dino;
}

function getDinoSvg(dino, strokeColor = '#ffffff', strokeWidth = 1.3) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${dino.viewBox || '0 0 110 90'}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${dino.paths}</svg>`;
}

function drawSvgOnCanvas(ctx, svgString, x, y, width, height) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, x, y, width, height);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR TARJETA DEL DÍA COMO PNG — Estilo Strava / Story, fondo transparente
// ─────────────────────────────────────────────────────────────────────────────
async function exportDayCardToPNG(dateStr) {
  const workouts = DB.getWorkouts().filter(w => w.date === dateStr);
  if (workouts.length === 0) { showToast('No hay entrenos este día para exportar'); return; }

  showToast('Generando tarjeta... ⏳');

  // ── DATOS ──────────────────────────────────────────────────────────────────
  const totalKg = workouts.reduce((sum, w) => sum + calculateSessionVolume(w), 0);
  const totalSeries = workouts.reduce((sum, w) =>
    sum + w.exercises.reduce((s, ex) => s + (ex.sets ? ex.sets.length : 0), 0), 0);
  const tags = [...new Set(workouts.map(w => w.tag || 'Entrenamiento General'))];
  const dino = getDinoForKg(totalKg);

  // ── MEJORA ─────────────────────────────────────────────────────────────────
  const allSorted = DB.getWorkouts().sort((a, b) => new Date(a.date) - new Date(b.date));
  let improvementValue = null;
  for (const tag of tags) {
    const tw = allSorted.filter(w => (w.tag || 'Entrenamiento General') === tag);
    const idx = tw.findIndex(w => w.date === dateStr);
    if (idx > 0) {
      const imps = [];
      tw[idx].exercises.forEach(cEx => {
        const pEx = tw[idx-1].exercises.find(e => e.exerciseId === cEx.exerciseId);
        if (pEx && pEx.sets.length > 0 && cEx.sets.length > 0) {
          const p1 = Math.max(...pEx.sets.map(s => calculate1RM(parseFloat(s.weight)||0, parseInt(s.reps)||0)));
          const c1 = Math.max(...cEx.sets.map(s => calculate1RM(parseFloat(s.weight)||0, parseInt(s.reps)||0)));
          if (p1 > 0) imps.push((c1 - p1) / p1);
        }
      });
      if (imps.length > 0) { improvementValue = Math.round((imps.reduce((a,b)=>a+b,0)/imps.length)*1000)/10; break; }
    }
  }

  // ── EVOLUCIÓN (Línea estilo Strava) ─────────────────────────────────────────
  const primaryTag = tags[0];
  const tagWks = allSorted.filter(w => (w.tag||'Entrenamiento General') === primaryTag);
  const basePerf = [100];
  const chartLabels = tagWks.length ? [tagWks[0].date.substring(5)] : [];
  let lastChartW = tagWks[0];
  for (let i = 1; i < tagWks.length; i++) {
    const cW = tagWks[i];
    chartLabels.push(cW.date.substring(5));
    const mi = [];
    cW.exercises.forEach(cEx => {
      const pEx = lastChartW.exercises.find(e => e.exerciseId === cEx.exerciseId);
      if (pEx && pEx.sets.length > 0 && cEx.sets.length > 0) {
        const p1 = Math.max(...pEx.sets.map(s => calculate1RM(parseFloat(s.weight)||0, parseInt(s.reps)||0)));
        const c1 = Math.max(...cEx.sets.map(s => calculate1RM(parseFloat(s.weight)||0, parseInt(s.reps)||0)));
        if (p1 > 0) mi.push((c1-p1)/p1);
      }
    });
    let sf = mi.length > 0 ? mi.reduce((a,b)=>a+b,0)/mi.length : 0;
    sf = Math.max(-0.25, Math.min(0.25, sf));
    basePerf.push(Math.round(basePerf[basePerf.length-1]*(1+sf)*10)/10);
    lastChartW = cW;
  }
  const dayChartIdx = tagWks.findIndex(w => w.date === dateStr);
  const hasChart = tagWks.length >= 2;
  const isChartPositive = basePerf[basePerf.length-1] >= 100;
  const lineColor = isChartPositive ? '#d946ef' : '#f43f5e';

  // ── CANVAS 1080x1920 (Formato Stories 9:16) ────────────────────────────────
  const W = 1080;
  const H = 1920;
  const canvas = document.getElementById('export-canvas');
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext('2d');

  // FONDO 100% TRANSPARENTE
  c.clearRect(0, 0, W, H);

  // Helper para rectángulos redondeados
  function rr(x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r, y); c.lineTo(x+w-r, y); c.quadraticCurveTo(x+w, y, x+w, y+r);
    c.lineTo(x+w, y+h-r); c.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    c.lineTo(x+r, y+h); c.quadraticCurveTo(x, y+h, x, y+h-r);
    c.lineTo(x, y+r); c.quadraticCurveTo(x, y, x+r, y);
    c.closePath();
  }

  // Centrado vertical dinámico con margen generoso arriba y abajo
  let cy = 160;

  // ── 1. HEADER: IRONTRACK ──────────────────────────────────────────────────
  c.fillStyle = '#ffffff';
  c.font = 'bold 84px "Plus Jakarta Sans", sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.letterSpacing = '2px';
  c.fillText('IRONTRACK', W/2, cy);
  cy += 95;

  // ── 2. ICONO DE LA MANCUERNA NEÓN (Fiel a la foto de referencia) ─────────
  const dbCX = W/2, dbCY = cy + 50;

  // Resplandor exterior (glow) fucsia/morado suave
  const glowG = c.createRadialGradient(dbCX, dbCY, 20, dbCX, dbCY, 180);
  glowG.addColorStop(0, 'rgba(217,70,239,0.35)');
  glowG.addColorStop(0.5, 'rgba(168,85,247,0.18)');
  glowG.addColorStop(1, 'transparent');
  c.fillStyle = glowG;
  c.beginPath(); c.arc(dbCX, dbCY, 180, 0, Math.PI*2); c.fill();

  // Barra central
  const barGrad = c.createLinearGradient(dbCX - 90, dbCY, dbCX + 90, dbCY);
  barGrad.addColorStop(0, '#c084fc');
  barGrad.addColorStop(0.5, '#ec4899');
  barGrad.addColorStop(1, '#c084fc');
  c.fillStyle = barGrad;
  rr(dbCX - 90, dbCY - 8, 180, 16, 8);
  c.fill();

  // Platos interiores (más grandes)
  const plateInL = c.createLinearGradient(dbCX - 120, dbCY - 44, dbCX - 85, dbCY + 44);
  plateInL.addColorStop(0, '#a855f7'); plateInL.addColorStop(1, '#ec4899');
  c.fillStyle = plateInL;
  rr(dbCX - 122, dbCY - 46, 32, 92, 14); c.fill();
  c.strokeStyle = '#f472b6'; c.lineWidth = 2.5; c.stroke();

  const plateInR = c.createLinearGradient(dbCX + 90, dbCY - 44, dbCX + 125, dbCY + 44);
  plateInR.addColorStop(0, '#ec4899'); plateInR.addColorStop(1, '#a855f7');
  c.fillStyle = plateInR;
  rr(dbCX + 90, dbCY - 46, 32, 92, 14); c.fill();
  c.strokeStyle = '#f472b6'; c.lineWidth = 2.5; c.stroke();

  // Platos exteriores (menores)
  const plateOutL = c.createLinearGradient(dbCX - 150, dbCY - 34, dbCX - 122, dbCY + 34);
  plateOutL.addColorStop(0, '#9333ea'); plateOutL.addColorStop(1, '#db2777');
  c.fillStyle = plateOutL;
  rr(dbCX - 146, dbCY - 36, 22, 72, 11); c.fill();
  c.strokeStyle = '#e879f9'; c.lineWidth = 2; c.stroke();

  const plateOutR = c.createLinearGradient(dbCX + 124, dbCY - 34, dbCX + 152, dbCY + 34);
  plateOutR.addColorStop(0, '#db2777'); plateOutR.addColorStop(1, '#9333ea');
  c.fillStyle = plateOutR;
  rr(dbCX + 124, dbCY - 36, 22, 72, 11); c.fill();
  c.strokeStyle = '#e879f9'; c.lineWidth = 2; c.stroke();

  cy = dbCY + 130;

  // ── 3. MÉTRICA: VOLUMEN TOTAL ─────────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.65)';
  c.font = '600 32px "Plus Jakarta Sans", sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('Volumen total', W/2, cy);
  cy += 58;

  // Valor: si >= 1000 kg muestra ej: "16.8 Toneladas"
  c.fillStyle = '#ffffff';
  c.font = 'bold 84px "Plus Jakarta Sans", sans-serif';
  const volString = totalKg >= 1000 ? `${(totalKg/1000).toFixed(1)} Toneladas` : `${totalKg.toLocaleString('es')} kg`;
  c.fillText(volString, W/2, cy);
  cy += 95;

  // ── 4. MÉTRICA: SERIES EFECTIVAS ──────────────────────────────────────────
  c.fillStyle = 'rgba(255,255,255,0.65)';
  c.font = '600 32px "Plus Jakarta Sans", sans-serif';
  c.fillText('Series efectivas', W/2, cy);
  cy += 58;

  c.fillStyle = '#ffffff';
  c.font = 'bold 84px "Plus Jakarta Sans", sans-serif';
  c.fillText(`${totalSeries} series`, W/2, cy);
  cy += 95;

  // ── 5. MEJORA PORCENTUAL (Si la hay) ──────────────────────────────────────
  if (improvementValue !== null) {
    const impColor = improvementValue >= 0 ? '#10b981' : '#f43f5e';
    const arrow = improvementValue >= 0 ? '▲' : '▼';
    c.fillStyle = impColor;
    c.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
    c.fillText(`${arrow} ${improvementValue >= 0 ? '+' : ''}${improvementValue}%`, W/2, cy);
    cy += 40;

    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.font = '500 28px "Plus Jakarta Sans", sans-serif';
    c.fillText('vs sesión anterior', W/2, cy);
    cy += 75;
  }

  // ── 6. GRÁFICO DE EVOLUCIÓN (Línea Strava pura sin títulos redundantes) ───
  if (hasChart) {
    const gW = 680;
    const gH = 200;
    const gOX = (W - gW) / 2;
    const gOY = cy + gH;

    const minV = Math.min(...basePerf) - 3;
    const maxV = Math.max(...basePerf) + 3;
    const rng = maxV - minV || 1;
    const tX = i => gOX + (i/(basePerf.length-1||1))*gW;
    const tY = v => gOY - ((v-minV)/rng)*gH;

    // Relleno suave bajo la curva
    const areaG = c.createLinearGradient(0, gOY - gH, 0, gOY);
    areaG.addColorStop(0, lineColor + '45');
    areaG.addColorStop(1, lineColor + '02');
    c.beginPath();
    c.moveTo(tX(0), gOY);
    basePerf.forEach((v, i) => c.lineTo(tX(i), tY(v)));
    c.lineTo(tX(basePerf.length - 1), gOY);
    c.closePath();
    c.fillStyle = areaG;
    c.fill();

    // Línea continua brillante
    c.beginPath();
    c.moveTo(tX(0), tY(basePerf[0]));
    for (let i = 1; i < basePerf.length; i++) c.lineTo(tX(i), tY(basePerf[i]));
    c.strokeStyle = lineColor;
    c.lineWidth = 6;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.stroke();

    // Puntos
    basePerf.forEach((v, i) => {
      const px = tX(i), py = tY(v);
      const isToday = i === dayChartIdx;

      if (isToday) {
        c.beginPath(); c.arc(px, py, 18, 0, Math.PI*2);
        c.fillStyle = lineColor + '33'; c.fill();
      }
      c.beginPath(); c.arc(px, py, isToday ? 11 : 6, 0, Math.PI*2);
      c.fillStyle = isToday ? '#ffffff' : lineColor;
      c.fill();
      if (isToday) {
        c.strokeStyle = lineColor; c.lineWidth = 3.5;
        c.beginPath(); c.arc(px, py, 11, 0, Math.PI*2); c.stroke();
      }

      // Fechas sutiles
      c.fillStyle = isToday ? '#ffffff' : 'rgba(255,255,255,0.4)';
      c.font = `${isToday ? 'bold ' : ''}22px "Plus Jakarta Sans", sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillText(chartLabels[i], px, gOY + 8);
    });

    cy = gOY + 70;
  }

  // ── 7. SECCIÓN DEL DINOSAURIO (Icono SVG realista de trazo fino) ──────────
  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.font = '600 28px "Plus Jakarta Sans", sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('HOY PODRÍAS HABER MOVIDO UN...', W/2, cy);
  cy += 30;

  // Dibujar el icono vectorial realista del dinosaurio en el Canvas
  if (dino.paths) {
    const dinoSvgString = getDinoSvg(dino, '#ffffff', 1.4);
    const iconW = 200;
    const iconH = 140;
    await drawSvgOnCanvas(c, dinoSvgString, W/2 - iconW/2, cy, iconW, iconH);
    cy += iconH + 35;
  } else {
    c.font = '84px serif';
    c.fillText(dino.emoji || '🦕', W/2, cy + 40);
    cy += 90;
  }

  // Nombre del dinosaurio: cálculo dinámico del tamaño de fuente para que NUNCA se corte
  const maxDinoTextW = 760;
  let dinoFontSize = 64;
  c.font = `bold ${dinoFontSize}px "Plus Jakarta Sans", sans-serif`;
  while (c.measureText(dino.name.toUpperCase()).width > maxDinoTextW && dinoFontSize > 32) {
    dinoFontSize -= 2;
    c.font = `bold ${dinoFontSize}px "Plus Jakarta Sans", sans-serif`;
  }
  c.fillStyle = '#ffffff';
  c.fillText(dino.name.toUpperCase(), W/2, cy);
  cy += 45;

  // Descripción del dinosaurio
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.font = '500 28px "Plus Jakarta Sans", sans-serif';
  c.fillText(dino.desc, W/2, cy);

  // ── DESCARGA DEL PNG ──────────────────────────────────────────────────────
  setTimeout(() => {
    const link = document.createElement('a');
    link.download = `irontrack-${dateStr}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Tarjeta exportada ✓');
  }, 50);
}
