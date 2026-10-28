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
        { exerciseId: 'machine-chest-press', exerciseName: 'Press en Máquina Sentado', targetSets: 3 },
        { exerciseId: 'lat-pulldown', exerciseName: 'Jalón al Pecho en Polea', targetSets: 3 },
        { exerciseId: 'overhead-press', exerciseName: 'Press Militar de Pie con Barra', targetSets: 3 },
        { exerciseId: 'barbell-row-machine', exerciseName: 'Remo maquina / 90°', targetSets: 3 },
        { exerciseId: 'chest-fly-cable-machine', exerciseName: 'Mariposa maquina', targetSets: 2 },
        { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales', targetSets: 3 },
        { exerciseId: 'barbell-curl', exerciseName: 'Curl de Bíceps con Barra Z', targetSets: 2 },
        { exerciseId: 'tricep-pushdown', exerciseName: 'Extensiones de Tríceps en Polea', targetSets: 2 }
      ]
    },
    {
      title: 'Día 2 - Lower A',
      exercises: [
        { exerciseId: 'barbell-squat', exerciseName: 'Sentadilla Trasera con Barra', targetSets: 3 },
        { exerciseId: 'romanian-deadlift', exerciseName: 'Peso Muerto Rumano', targetSets: 3 },
        { exerciseId: 'leg-press', exerciseName: 'Prensa Inclinada a 45°', targetSets: 3 },
        { exerciseId: 'leg-curl', exerciseName: 'Curl Femoral Tumbado/Sentado', targetSets: 2 },
        { exerciseId: 'leg-extension', exerciseName: 'Extensión de Cuádriceps', targetSets: 2 },
        { exerciseId: 'calf-raise', exerciseName: 'Elevación de Gemelos de Pie', targetSets: 3 },
        { exerciseId: 'aductors', exerciseName: 'Aductores', targetSets: 2 }
      ]
    },
    {
      title: 'Día 3 - Upper B',
      exercises: [
        { exerciseId: 'incline-db-press', exerciseName: 'Press Inclinado con Mancuernas', targetSets: 3 },
        { exerciseId: 'barbell-row-machine', exerciseName: 'Remo maquina / 90°', targetSets: 3 },
        { exerciseId: 'lat-pulldown-neutr', exerciseName: 'Jalón al Pecho agarre Neutro', targetSets: 3 },
        { exerciseId: 'db-shoulder-press-machine', exerciseName: 'Press de Hombro', targetSets: 3 },
        { exerciseId: 'face-pull', exerciseName: 'Face Pull en Polea con Cuerda', targetSets: 3 },
        { exerciseId: 'lateral-raises', exerciseName: 'Elevaciones Laterales', targetSets: 3 },
        { exerciseId: 'bicep-curl-unilateral', exerciseName: 'Curl de Bíceps Unilateral', targetSets: 3 },
        { exerciseId: 'tricep-aboveHead', exerciseName: 'Extensiones de Tríceps encima cabeza', targetSets: 3 }
      ]
    },
    {
      title: 'Día 4 - Lower B',
      exercises: [
        { exerciseId: 'leg-press', exerciseName: 'Prensa Inclinada a 45°', targetSets: 3 },
        { exerciseId: 'hipThrust', exerciseName: 'Hip Thrust', targetSets: 3 },
        { exerciseId: 'bulgarian', exerciseName: 'Sentadillas bulgaras', targetSets: 3 },
        { exerciseId: 'leg-curl', exerciseName: 'Curl Femoral Tumbado/Sentado', targetSets: 2 },
        { exerciseId: 'leg-extension', exerciseName: 'Extensión de Cuádriceps', targetSets: 2 },
        { exerciseId: 'calf-raise', exerciseName: 'Elevación de Gemelos de Pie', targetSets: 3 },
        { exerciseId: 'abductors', exerciseName: 'Abductores', targetSets: 2 }
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

// Cargar la rutina seleccionada en la sesión activa: CON 1 REPETICIÓN POR DEFECTO PARA QUE EL USUARIO META MÁS
function loadRoutineIntoSession(routine) {
  if (!routine || !routine.exercises) return;

  currentSession.tag = routine.name;
  const tagInput = document.getElementById('workout-tag');
  if (tagInput) tagInput.value = routine.name;

  currentSession.exercises = routine.exercises.map(re => {
    const numSets = re.targetSets || 3;
    const lastPerf = findLastPerformance(re.exerciseId);
    const sets = [];
    for (let i = 0; i < numSets; i++) {
      sets.push({
        weight: lastPerf ? lastPerf.weight : 0,
        reps: 1, // REQUISITO: Pone solo 1 repetición para empezar y el usuario la sube al entrenar
        rir: 2  // Cambiado RPE por RIR (2 repeticiones en recámara por defecto)
      });
    }

    return {
      exerciseId: re.exerciseId,
      exerciseName: re.exerciseName,
      sets
    };
  });

  autosaveSession();
  renderSessionExercises();
  showToast(`Rutina "${routine.name}" cargada con 1 repetición base.`);
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
          <div class="flex items-center space-x-2">
            <span class="p-1 rounded-lg bg-purple-500/20 text-purple-300">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
            </span>
            <h4 class="text-xs font-bold text-white">${w.tag}</h4>
          </div>
          <span class="text-xs font-bold text-fuchsia-400">${totalVol.toLocaleString()} kg</span>
        </div>
        
        <div class="text-[11px] text-purple-200/70 space-y-1 pt-1 border-t border-[#2a1445]">
          ${w.exercises.map(ex => `
            <div class="flex justify-between items-center">
              <span class="truncate max-w-[65%]">${ex.exerciseName}</span>
              <span class="font-mono text-purple-400">${ex.sets.length} series</span>
            </div>
          `).join('')}
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
function addExerciseToSession(exerciseId) {
  const allExercises = DB.getExercises();
  const exercise = allExercises.find(e => e.id === exerciseId);
  if (!exercise) return;

  const lastSetInfo = findLastPerformance(exerciseId);

  const newExerciseEntry = {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    sets: [
      {
        weight: lastSetInfo ? lastSetInfo.weight : 0,
        reps: 1, // REQUISITO: Empieza con 1 repetición base para que el usuario ponga más
        rir: 2  // REQUISITO: Cambiado por RIR
      }
    ]
  };

  currentSession.exercises.push(newExerciseEntry);
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

    return `
      <div class="bg-[#110a1f] border border-[#2a1645] rounded-2xl p-4 shadow-lg space-y-3">
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-2">
            <div class="flex-shrink-0 mt-0.5">${muscleIcon}</div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-400">Ejercicio ${exIndex + 1}</span>
              <h3 class="text-sm font-bold text-white leading-tight">${item.exerciseName}</h3>
              <p class="text-[11px] text-purple-300/70 mt-0.5">Volumen ejercicio: <span class="text-fuchsia-400 font-semibold">${exerciseVolume} kg</span></p>
            </div>
          </div>
          <button onclick="removeExerciseFromSession(${exIndex})" class="p-1 text-purple-400/60 hover:text-rose-400 transition" title="Eliminar ejercicio">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="space-y-2">
          <!-- Cabecera de la tabla con RIR en vez de RPE -->
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
                <div class="col-span-2 text-center text-xs font-bold text-purple-400">
                  #${setIndex + 1}
                </div>
                <div class="col-span-4">
                  <input type="number" step="0.5" value="${set.weight}" placeholder="0"
                    onchange="updateSetData(${exIndex}, ${setIndex}, 'weight', this.value)"
                    class="w-full bg-[#0d071a] border border-[#37195c] rounded-lg py-1 px-1.5 text-center text-xs text-white font-semibold focus:outline-none focus:border-purple-500">
                </div>
                <div class="col-span-3">
                  <input type="number" min="1" value="${set.reps || 1}" placeholder="1"
                    onchange="updateSetData(${exIndex}, ${setIndex}, 'reps', this.value)"
                    class="w-full bg-[#0d071a] border border-[#37195c] rounded-lg py-1 px-1.5 text-center text-xs text-white font-semibold focus:outline-none focus:border-purple-500">
                </div>
                <div class="col-span-2">
                  <input type="number" step="1" max="6" min="0" value="${set.rir !== undefined ? set.rir : 2}" 
                    onchange="updateSetData(${exIndex}, ${setIndex}, 'rir', this.value)"
                    class="w-full bg-[#0d071a] border border-[#37195c] rounded-lg py-1 px-1 text-center text-[11px] text-purple-200 focus:outline-none focus:border-purple-500" placeholder="2" title="Repeticiones en Reserva (RIR)">
                </div>
                <div class="col-span-1 text-center flex flex-col items-center gap-0.5">
                  ${setIndex < item.sets.length - 1 ? `
                  <button onclick="copySetToNext(${exIndex}, ${setIndex})" class="text-fuchsia-400/70 hover:text-fuchsia-300 p-0.5" title="Copiar a la serie siguiente">
                    <i data-lucide="copy" class="w-3 h-3"></i>
                  </button>` : `<div class="w-3 h-3"></div>`}
                  <button onclick="removeSet(${exIndex}, ${setIndex})" class="text-purple-400/50 hover:text-rose-400 p-0.5">
                    <i data-lucide="minus-circle" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <button onclick="addSetToExercise(${exIndex})" class="w-full py-1.5 rounded-lg bg-[#180e2a] hover:bg-[#23133d] text-purple-300 text-xs font-semibold flex items-center justify-center space-x-1 border border-[#37195c] transition">
          <i data-lucide="plus" class="w-3.5 h-3.5 text-fuchsia-400"></i>
          <span>Añadir Serie</span>
        </button>
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
  if (currentSession.exercises[exIndex] && currentSession.exercises[exIndex].sets[setIndex]) {
    currentSession.exercises[exIndex].sets[setIndex][field] = parseFloat(value) || 0;
    autosaveSession();
  }
}

function addSetToExercise(exIndex) {
  const ex = currentSession.exercises[exIndex];
  if (!ex) return;
  const lastSet = ex.sets[ex.sets.length - 1];
  const newSet = lastSet ? { ...lastSet, reps: 1 } : { weight: 0, reps: 1, rir: 2 };
  ex.sets.push(newSet);
  autosaveSession();
  renderSessionExercises();
  startRestTimer(90);
}

function removeSet(exIndex, setIndex) {
  const ex = currentSession.exercises[exIndex];
  if (!ex) return;
  if (ex.sets.length > 1) {
    ex.sets.splice(setIndex, 1);
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
  autosaveSession();
  renderSessionExercises();
  showToast('Serie copiada ✓');
}

function removeExerciseFromSession(exIndex) {
  currentSession.exercises.splice(exIndex, 1);
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

  const workoutRecord = {
    id: 'w_' + Date.now(),
    date: workoutDate,
    tag: tagInput.value.trim() || 'Entrenamiento General',
    exercises: JSON.parse(JSON.stringify(currentSession.exercises))
  };

  DB.saveWorkout(workoutRecord);
  showToast('¡Entrenamiento registrado con éxito!');

  tagInput.value = '';
  currentSession.exercises = [];
  clearSessionDraft();
  renderSessionExercises();
  renderHistory();
  renderPRs();
  updateChart();

  calendarSelectedDate = workoutDate;
  renderCalendar();
  updateHomeProgressChart();
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

        <div class="flex justify-end pt-1">
          <button onclick="deleteWorkoutEntry('${w.id}')" class="text-[10px] text-rose-400 hover:text-rose-300 flex items-center space-x-1">
            <i data-lucide="trash" class="w-3 h-3"></i>
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

  // CALCULAR MEJORÍA RELATIVA ENTRE SESIONES CONSECUTIVAS:
  // Se compara cada sesión contra la anterior calculando la mejoría de fuerza (1RM estimado) 
  // en los ejercicios coincidentes (para medir progresión real y no variación de volumen por número de ejercicios).
  // Si no hay ejercicios coincidentes, se utiliza la variación de volumen de la sesión.
  const baselineIndex = 100;
  const progressPercentages = [baselineIndex];
  const labels = [filteredWorkouts[0].date.substring(5)];

  for (let i = 1; i < filteredWorkouts.length; i++) {
    const prevW = filteredWorkouts[i - 1];
    const currW = filteredWorkouts[i];
    labels.push(currW.date.substring(5));

    // Buscar ejercicios coincidentes
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
      // Promedio de mejoría en ejercicios comunes
      const avgImp = matchedImprovements.reduce((a, b) => a + b, 0) / matchedImprovements.length;
      stepFactor = avgImp;
    } else {
      // Si no comparten ejercicios (o rutinas distintas sin filtrar), comparar volumen total
      const prevVol = calculateSessionVolume(prevW);
      const currVol = calculateSessionVolume(currW);
      if (prevVol > 0) {
        stepFactor = (currVol - prevVol) / prevVol;
      }
    }

    // Suavizar saltos atípicos a +/- 25% por sesión para mantener escala lógica de progresión deportiva
    stepFactor = Math.max(-0.25, Math.min(0.25, stepFactor));

    const lastVal = progressPercentages[progressPercentages.length - 1];
    const nextVal = Math.round((lastVal * (1 + stepFactor)) * 10) / 10;
    progressPercentages.push(nextVal);
  }

  // Mejoría total acumulada respecto a la primera sesión del periodo
  const totalChange = Math.round((progressPercentages[progressPercentages.length - 1] - 100) * 10) / 10;
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
