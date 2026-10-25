// muscleIcons.js - Mapeo de grupos musculares e iconos visuales SVG anatómicos

const MUSCLE_ICONS = {
  'Pecho': `
    <svg viewBox="0 0 24 24" class="w-5 h-5 text-fuchsia-400" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 8c2-2 5-3 8-1 3-2 6-1 8 1 0 5-3 9-8 11C7 17 4 13 4 8z" fill="rgba(236, 72, 153, 0.25)" />
      <line x1="12" y1="7" x2="12" y2="17" stroke="#c084fc" stroke-width="1.5" />
    </svg>`,
  'Espalda': `
    <svg viewBox="0 0 24 24" class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 6l8 3 8-3v7l-8 7-8-7V6z" fill="rgba(168, 85, 247, 0.25)" />
      <line x1="12" y1="9" x2="12" y2="20" stroke="#f472b6" stroke-width="1.5" />
      <path d="M6 10l6 3 6-3" stroke="#a855f7" stroke-width="1.2" />
    </svg>`,
  'Piernas': `
    <svg viewBox="0 0 24 24" class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M7 4h3l1 14-3 2-1-16zM14 4h3l-1 16-3-2 1-14z" fill="rgba(129, 140, 248, 0.25)" />
      <circle cx="8.5" cy="11" r="1.5" fill="#c084fc" />
      <circle cx="15.5" cy="11" r="1.5" fill="#c084fc" />
    </svg>`,
  'Hombros': `
    <svg viewBox="0 0 24 24" class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 11c1-4 4-6 9-6s8 2 9 6c-2 2-5 3-9 3s-7-1-9-3z" fill="rgba(251, 191, 36, 0.25)" />
      <circle cx="6" cy="11" r="2" fill="#fbbf24" />
      <circle cx="18" cy="11" r="2" fill="#fbbf24" />
    </svg>`,
  'Brazos': `
    <svg viewBox="0 0 24 24" class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 5c2 0 4 2 4 5 0 2-2 4-4 4s-4-2-4-4c0-3 2-5 4-5z" fill="rgba(244, 114, 182, 0.25)" />
      <path d="M18 5c2 0 4 2 4 5 0 2-2 4-4 4s-4-2-4-4c0-3 2-5 4-5z" fill="rgba(244, 114, 182, 0.25)" />
      <path d="M6 14l2 6h2M18 14l-2 6h-2" stroke="#c084fc" stroke-width="1.5" />
    </svg>`,
  'Core': `
    <svg viewBox="0 0 24 24" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="7" y="5" width="10" height="14" rx="2" fill="rgba(52, 211, 153, 0.2)" />
      <line x1="12" y1="5" x2="12" y2="19" stroke="#34d199" stroke-width="1.5" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="#34d199" stroke-width="1.5" />
      <line x1="7" y1="14" x2="17" y2="14" stroke="#34d199" stroke-width="1.5" />
    </svg>`
};

function getMuscleIcon(category) {
  return MUSCLE_ICONS[category] || `
    <svg viewBox="0 0 24 24" class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="8" fill="rgba(168, 85, 247, 0.2)" />
    </svg>`;
}

// Generador de Silueta Anatómica del Cuerpo Humano (Frontal y Dorsal)
// Ilumina dinámicamente los grupos musculares involucrados
function generateBodyMuscleMap(activeCategories = []) {
  const isPecho = activeCategories.includes('Pecho');
  const isEspalda = activeCategories.includes('Espalda');
  const isPiernas = activeCategories.includes('Piernas');
  const isHombros = activeCategories.includes('Hombros');
  const isBrazos = activeCategories.includes('Brazos');
  const isCore = activeCategories.includes('Core');

  const activeColor = '#ec4899'; // Neón fucsia brillante
  const inactiveColor = '#24143d'; // Violeta muy oscuro base
  const activeGlow = 'filter: drop-shadow(0 0 4px #ec4899);';

  return `
    <div class="flex items-center space-x-2 bg-[#090514] p-2.5 rounded-2xl border border-[#2f184e]">
      <!-- SILUETA FRONTAL -->
      <div class="flex flex-col items-center">
        <span class="text-[8px] uppercase tracking-wider text-purple-400/80 mb-0.5">Frontal</span>
        <svg viewBox="0 0 100 160" class="w-12 h-20">
          <!-- Cabeza -->
          <circle cx="50" cy="14" r="8" fill="#351a5c" />
          
          <!-- Hombros -->
          <path d="M28 28 C34 24, 44 24, 50 24 C56 24, 66 24, 72 28 C74 34, 72 40, 68 40 C64 36, 60 36, 50 36 C40 36, 36 36, 32 40 C28 40, 26 34, 28 28 Z" 
            fill="${isHombros ? activeColor : inactiveColor}" style="${isHombros ? activeGlow : ''}" />

          <!-- Pecho -->
          <path d="M34 38 C42 36, 48 38, 50 44 C52 38, 58 36, 66 38 C68 48, 58 54, 50 54 C42 54, 32 48, 34 38 Z" 
            fill="${isPecho ? activeColor : inactiveColor}" style="${isPecho ? activeGlow : ''}" />

          <!-- Brazos (Bíceps) -->
          <rect x="22" y="38" width="8" height="28" rx="4" 
            fill="${isBrazos ? activeColor : inactiveColor}" style="${isBrazos ? activeGlow : ''}" />
          <rect x="70" y="38" width="8" height="28" rx="4" 
            fill="${isBrazos ? activeColor : inactiveColor}" style="${isBrazos ? activeGlow : ''}" />

          <!-- Abdomen / Core -->
          <rect x="41" y="55" width="18" height="25" rx="3" 
            fill="${isCore ? activeColor : inactiveColor}" style="${isCore ? activeGlow : ''}" />

          <!-- Piernas (Cuádriceps) -->
          <path d="M34 84 C34 82, 48 82, 48 86 L46 135 C46 142, 38 142, 36 135 Z" 
            fill="${isPiernas ? activeColor : inactiveColor}" style="${isPiernas ? activeGlow : ''}" />
          <path d="M66 84 C66 82, 52 82, 52 86 L54 135 C54 142, 62 142, 64 135 Z" 
            fill="${isPiernas ? activeColor : inactiveColor}" style="${isPiernas ? activeGlow : ''}" />
        </svg>
      </div>

      <!-- SILUETA DORSAL -->
      <div class="flex flex-col items-center">
        <span class="text-[8px] uppercase tracking-wider text-purple-400/80 mb-0.5">Dorsal</span>
        <svg viewBox="0 0 100 160" class="w-12 h-20">
          <!-- Cabeza -->
          <circle cx="50" cy="14" r="8" fill="#351a5c" />

          <!-- Hombros posteriores -->
          <path d="M28 28 C34 24, 44 24, 50 24 C56 24, 66 24, 72 28 C74 34, 72 38, 68 38 C64 34, 60 34, 50 34 C40 34, 36 34, 32 38 C28 38, 26 34, 28 28 Z" 
            fill="${isHombros ? activeColor : inactiveColor}" style="${isHombros ? activeGlow : ''}" />

          <!-- Espalda / Dorsales / Trapecio -->
          <path d="M34 32 C42 30, 58 30, 66 32 L60 65 C55 68, 45 68, 40 65 Z" 
            fill="${isEspalda ? activeColor : inactiveColor}" style="${isEspalda ? activeGlow : ''}" />

          <!-- Brazos (Tríceps) -->
          <rect x="22" y="38" width="8" height="28" rx="4" 
            fill="${isBrazos ? activeColor : inactiveColor}" style="${isBrazos ? activeGlow : ''}" />
          <rect x="70" y="38" width="8" height="28" rx="4" 
            fill="${isBrazos ? activeColor : inactiveColor}" style="${isBrazos ? activeGlow : ''}" />

          <!-- Glúteos y Femoral -->
          <path d="M36 84 C36 82, 48 82, 48 86 L46 135 C46 142, 38 142, 36 135 Z" 
            fill="${isPiernas ? activeColor : inactiveColor}" style="${isPiernas ? activeGlow : ''}" />
          <path d="M64 84 C64 82, 52 82, 52 86 L54 135 C54 142, 62 142, 64 135 Z" 
            fill="${isPiernas ? activeColor : inactiveColor}" style="${isPiernas ? activeGlow : ''}" />
        </svg>
      </div>

      <!-- Leyenda de músculos marcados -->
      <div class="flex-1 text-[10px] space-y-1 pl-1">
        <p class="font-bold text-white text-[11px] leading-tight">Músculos entrenados:</p>
        <div class="flex flex-wrap gap-1">
          ${activeCategories.length ? activeCategories.map(c => `
            <span class="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-fuchsia-300 font-semibold border border-purple-500/30">${c}</span>
          `).join('') : '<span class="text-purple-400/50">Ninguno asignado</span>'}
        </div>
      </div>
    </div>
  `;
}
