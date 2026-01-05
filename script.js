// Initialize Supabase client (global)
const supabaseUrl = 'https://ybfewqvydkihkyznqjcm.supabase.co';
const supabaseKey = 'sb_publishable_XQzxhiiQwZVE0eF4O_oLDQ_6op6-HfP';

// "supabase" comes from the CDN script in index.html
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized');


// This will hold your past sessions in memory for now
let sessions = [];

const DEFAULT_TIMEZONE = 'America/Chicago';
const timezoneSelect = document.getElementById('timezone-select');
const timezoneApplyButton = document.getElementById('timezone-apply');

function getSelectedTimeZone() {
  if (timezoneSelect && timezoneSelect.value) {
    return timezoneSelect.value;
  }
  return DEFAULT_TIMEZONE;
}

function loadSavedTimeZone() {
  if (!timezoneSelect) return;
  const savedZone = localStorage.getItem('preferredTimeZone');
  timezoneSelect.value = savedZone || DEFAULT_TIMEZONE;
}

function applySelectedTimeZone() {
  if (!timezoneSelect) return;
  localStorage.setItem('preferredTimeZone', timezoneSelect.value);
  renderLog();
}

if (timezoneSelect) {
  loadSavedTimeZone();
  timezoneSelect.addEventListener('change', applySelectedTimeZone);
}

if (timezoneApplyButton) {
  timezoneApplyButton.addEventListener('click', applySelectedTimeZone);
}

// ---- Helper functions for "Today" suggestion ----

// Engine session types we care about in the loop
const ENGINE_TYPES = ['ST1', 'CD1', 'ST2', 'CD2'];

// Theme options available for each session type
const THEME_OPTIONS_BY_TYPE = {
  ST1: ['Lower', 'Upper/Total'],
  ST2: ['Linear', 'Rotational'],
  CD1: ['Boxing', 'Engine'],
  CD2: ['Run/Walk', 'Nonimpact'],
  BK3: ['Footwork', 'Bag Work', 'Shadowboxing / Defense']
};

// High-level workout templates for the modal (ALL session types)
const workoutTemplates = {
  ST1: {
    Lower: {
      Standard: `
        <h3>ST1 – Heavy Strength – Lower – Standard (30–45 min)</h3>
        <p><strong>Goal:</strong> Build lower-body strength for drive, braking, and stability.</p>
        <h4>A. Warm-up – 5–8 min</h4>
        <ul>
          <li>2–4 min easy bike / walk / jump rope</li>
          <li>Dynamic series (1–2 sets each): walking lunges x 6–8 steps/leg, leg swings x 10/leg, bodyweight squat x 10, hip airplanes or single-leg RDL reach x 5/leg</li>
        </ul>
        <h4>B. Main Lift – Squat Pattern (Heaviest Work)</h4>
        <ul>
          <li>Choose one: high-bar back squat, front squat, or trap bar deadlift (squatty stance)</li>
          <li>4 × 4–6 @ RPE 7–8, rest 2–3 min</li>
        </ul>
        <h4>C. Secondary Lift – Hinge or Hip-Dominant</h4>
        <ul>
          <li>RDL or hip thrust/glute bridge</li>
          <li>3 × 6–8, rest 90–120 s</li>
        </ul>
        <h4>D. Accessory – Single-Leg Strength</h4>
        <ul>
          <li>Rear-foot elevated split squat, walking lunge, or step-up</li>
          <li>2–3 × 8–10/leg</li>
        </ul>
        <h4>E. Upper Back Pull</h4>
        <ul>
          <li>1-arm DB row, chest-supported row, or seated cable row</li>
          <li>3 × 8–12</li>
        </ul>
        <h4>F. Core Finisher (RC2 mini-block) – 5–7 min</h4>
        <ul>
          <li>2–3 rounds: Pallof press x 10/side, dead bug x 6–8/side, side plank x 20–30 s/side</li>
        </ul>
      `,
      Quick: `
        <h3>ST1 – Heavy Strength – Lower – Quick (15–20 min)</h3>
        <p><strong>Goal:</strong> One meaningful heavy-ish lower pattern plus some trunk.</p>
        <h4>A. Fast Warm-up – 3–5 min</h4>
        <ul>
          <li>1–2 min easy cardio</li>
          <li>1 set each: bodyweight squat x 10, reverse lunge x 5/leg</li>
        </ul>
        <h4>B. Main Lift – Squat or Trap Bar Deadlift</h4>
        <ul>
          <li>Back/front squat or trap bar deadlift</li>
          <li>3 × 4–6 @ RPE 7–8, rest 90–120 s</li>
        </ul>
        <h4>C. Superset – Row + Core (RC2)</h4>
        <ul>
          <li>2–3 rounds: 1-arm DB row x 8–10/arm, front plank x 30–40 s</li>
        </ul>
      `,
      Easy: `
        <h3>ST1 – Heavy Strength – Lower – Easy (10–20 min)</h3>
        <p><strong>Goal:</strong> Keep tissue loaded and mobile without real fatigue.</p>
        <h4>A. Prep & Mobility – 5–10 min</h4>
        <ul>
          <li>1–2 min easy cardio</li>
          <li>1–2 rounds: 90/90 hip rotations x 6–8/side, deep squat sit x 20–30 s, glute bridge x 10–12, cat-camel x 6–8</li>
        </ul>
        <h4>B. Light Strength Pattern – 5–10 min</h4>
        <ul>
          <li>2–3 rounds: bodyweight/light goblet squat x 8–10, split squat x 6–8/leg, light farmer carry x 20–30 m</li>
        </ul>
      `
    },
    UpperTotal: {
      Standard: `
        <h3>ST1 – Heavy Strength – Upper/Total – Standard (30–45 min)</h3>
        <p><strong>Goal:</strong> Build upper-body pressing/pulling strength and trunk stability with a small lower/total piece.</p>
        <h4>A. Warm-up – 5–8 min</h4>
        <ul>
          <li>2–3 min light cardio</li>
          <li>1–2 rounds: band pull-apart x 12–15, scap push-up x 8–10, shoulder circles x 10/dir, light band/DB external rotation x 10/side</li>
        </ul>
        <h4>B. Main Upper Push</h4>
        <ul>
          <li>Bench press (barbell/DB), incline DB press, or DB OHP</li>
          <li>4 × 4–6 @ RPE 7–8</li>
        </ul>
        <h4>C. Main Upper Pull</h4>
        <ul>
          <li>Pull-up/chin-up, lat pulldown, or row variation</li>
          <li>4 × 6–8 (superset with B if desired)</li>
        </ul>
        <h4>D. Light Lower or Total-Body Pattern</h4>
        <ul>
          <li>RDL, KB swing, goblet squat, or light trap bar deadlift</li>
          <li>2–3 × 6–8 @ RPE ~6</li>
        </ul>
        <h4>E. Accessory Shoulder / Upper Back</h4>
        <ul>
          <li>Lateral raise, face pull, rear delt fly</li>
          <li>2–3 × 10–15 each (pick 1–2)</li>
        </ul>
        <h4>F. Core Finisher (RC2 mini-block) – 5–7 min</h4>
        <ul>
          <li>2–3 rounds: half-kneeling cable/band chop x 10/side, dead bug x 6–8/side, suitcase carry x 20–30 m/side</li>
        </ul>
      `,
      Quick: `
        <h3>ST1 – Heavy Strength – Upper/Total – Quick (15–20 min)</h3>
        <h4>A. Fast Warm-up – 3–5 min</h4>
        <ul>
          <li>1–2 min cardio</li>
          <li>1 set: band pull-apart x 12, knee push-ups x 8–10</li>
        </ul>
        <h4>B. Push–Pull Superset</h4>
        <ul>
          <li>DB bench + 1-arm DB row OR push-up + inverted/TRX row</li>
          <li>3 × 6–8 each @ RPE ~7</li>
        </ul>
        <h4>C. Core – Quick Hit</h4>
        <ul>
          <li>2 rounds: side plank x 30–40 s/side OR Pallof press x 10–12/side</li>
        </ul>
      `,
      Easy: `
        <h3>ST1 – Heavy Strength – Upper/Total – Easy (10–20 min)</h3>
        <p><strong>Goal:</strong> Shoulder health and patterning.</p>
        <h4>A. Shoulder / T-Spine Mobility – 5–10 min</h4>
        <ul>
          <li>1–2 rounds: wall slides x 8–10, quadruped T-spine rotation x 6–8/side, band dislocates x 8–10, scap push-ups x 6–8</li>
        </ul>
        <h4>B. Light Strength & Activation – 5–10 min</h4>
        <ul>
          <li>2–3 rounds: band row x 12–15, elevated push-up x 6–8, very light DB curl + press x 8–10</li>
        </ul>
        <h4>C. Optional Core</h4>
        <ul>
          <li>Bird-dog x 6–8/side for 1–2 rounds</li>
        </ul>
      `
    }
  },

  ST2: {
    Linear: {
      Standard: `
        <h3>ST2 – Speed / Power – Linear – Standard (30–40 min)</h3>
        <h4>A. Dynamic Warm-up – 5–8 min</h4>
        <ul>
          <li>1–2 rounds: 2–3 min rope/jog, walking lunges x 6–8/leg, leg swings x 10/leg, arm circles + scap push-ups x 8–10</li>
        </ul>
        <h4>B. Jump Block</h4>
        <ul>
          <li>CMJ, box jump, or broad jump</li>
          <li>4 × 3–4 reps, full reset, stick landings</li>
        </ul>
        <h4>C. Speed-Strength Lower Lift</h4>
        <ul>
          <li>Speed trap bar deadlift, speed squat, or KB swing</li>
          <li>4 × 3–5 fast reps @ light–moderate load</li>
        </ul>
        <h4>D. Upper-Body Power</h4>
        <ul>
          <li>Speed DB bench, medball chest pass, or plyo push-up</li>
          <li>3–4 × 3–5 explosive reps</li>
        </ul>
        <h4>E. Core / Bracing (RC2-style) – 5–7 min</h4>
        <ul>
          <li>2–3 rounds: tall-kneeling rollout x 6–8, farmer/trap bar carry x 20–30 m, side plank x 20–30 s/side</li>
        </ul>
      `,
      Quick: `
        <h3>ST2 – Speed / Power – Linear – Quick (15–20 min)</h3>
        <h4>A. Fast Warm-up – 3–4 min</h4>
        <ul>
          <li>1–2 min rope/bike</li>
          <li>BW squat x 10, walking lunge x 5/leg</li>
        </ul>
        <h4>B. Jump Block</h4>
        <ul>
          <li>Box jump or CMJ</li>
          <li>3 × 3 reps</li>
        </ul>
        <h4>C. Speed-Strength Lift</h4>
        <ul>
          <li>Speed trap bar DL, goblet squat, or KB swing</li>
          <li>3 × 3–5 reps</li>
        </ul>
        <h4>D. Optional Core</h4>
        <ul>
          <li>1–2 rounds: farmer carry x 20 m, plank x 30 s</li>
        </ul>
      `,
      Easy: `
        <h3>ST2 – Speed / Power – Linear – Easy (10–20 min)</h3>
        <h4>A. Low-Impact Elastic Series – 5–10 min</h4>
        <ul>
          <li>2–3 rounds (easy): ankle pogos x 10–15, skips for height/distance x 10–15 m, A-march/skip x 10–15 m</li>
        </ul>
        <h4>B. Light Power Circuit – 5–10 min</h4>
        <ul>
          <li>2–3 rounds: light KB swing x 8, light medball chest pass/scoop x 6, bird-dog x 6/side</li>
        </ul>
      `
    },
    Rotational: {
      Standard: `
        <h3>ST2 – Speed / Power – Rotational – Standard (30–40 min)</h3>
        <h4>A. Dynamic Warm-up – 5–8 min</h4>
        <ul>
          <li>1–2 rounds: 2–3 min light cardio or shadowboxing, lateral lunge x 6/side, quadruped T-spine rotation x 6–8/side, band pull-aparts x 10–15</li>
        </ul>
        <h4>B. Rotational Medball Block</h4>
        <ul>
          <li>Choose 1–2: rotational scoop toss vs wall, step-behind rotational throw, rotational chest pass</li>
          <li>4–6 sets × 3–5 reps/side</li>
        </ul>
        <h4>C. Lateral Power / COD</h4>
        <ul>
          <li>Lateral bounds, lateral step + bound, or box step-off to stick</li>
          <li>3–4 × 3–4 reps/side</li>
        </ul>
        <h4>D. Speed-Strength Lift (Rotational/Lateral Bias)</h4>
        <ul>
          <li>Split squat jump, landmine rotational press, or cable/band rotational chop</li>
          <li>3–4 × 3–5 fast reps/side</li>
        </ul>
        <h4>E. Anti-Rotation Core (RC2-style) – 5–7 min</h4>
        <ul>
          <li>2–3 rounds: Pallof press x 10–12/side, half-kneeling chop x 8–10/side, suitcase carry x 20–30 m/side</li>
        </ul>
      `,
      Quick: `
        <h3>ST2 – Speed / Power – Rotational – Quick (15–20 min)</h3>
        <h4>A. Fast Warm-up – 3–4 min</h4>
        <ul>
          <li>1–2 min shadowboxing</li>
          <li>Lateral lunge x 6/side, T-spine rotation x 6/side</li>
        </ul>
        <h4>B. Medball Rotational Power</h4>
        <ul>
          <li>Step-behind throw or scoop toss</li>
          <li>4 × 3–4 reps/side</li>
        </ul>
        <h4>C. Anti-Rotation Finisher</h4>
        <ul>
          <li>2–3 rounds: Pallof press x 8–10/side, side plank x 20–30 s/side</li>
        </ul>
      `,
      Easy: `
        <h3>ST2 – Speed / Power – Rotational – Easy (10–20 min)</h3>
        <h4>A. Mobility & Patterning – 5–10 min</h4>
        <ul>
          <li>2–3 rounds: T-spine open book x 6–8/side, 90/90 hip switches x 6–8/side, standing light band rotations x 10/side</li>
        </ul>
        <h4>B. Light Rotational & Core Circuit – 5–10 min</h4>
        <ul>
          <li>2–3 rounds @ RPE 4–5: light medball torso rotation (no throw) x 10/side, bird-dog x 6–8/side, light suitcase carry x 15–20 m/side</li>
        </ul>
      `
    }
  },

  CD1: {
    Boxing: {
      Standard: `
        <h3>CD1 – Intervals / Tempo – Boxing – Standard (30–45 min)</h3>
        <ul>
          <li>Warm-up (shadow)</li>
          <li>6–8 rounds intervals/tempo</li>
          <li>Short RC1 mobility</li>
        </ul>
      `,
      Quick: `
        <h3>CD1 – Intervals / Tempo – Boxing – Quick (15–20 min)</h3>
        <ul>
          <li>Short warm-up</li>
          <li>4–6 focused rounds (moderate-hard)</li>
          <li>Brief cool-down</li>
        </ul>
      `,
      Easy: `
        <h3>CD1 – Intervals / Tempo – Boxing – Easy (10–20 min)</h3>
        <ul>
          <li>Technique-tempo rounds (RPE ≤ 6)</li>
          <li>5–10 min RC1 mobility</li>
        </ul>
      `
    },
    Engine: {
      Standard: `
        <h3>CD1 – Intervals / Tempo – Engine – Standard (30–45 min)</h3>
        <ul>
          <li>Warm-up</li>
          <li>15–25 min intervals or tempos</li>
          <li>Short cool-down</li>
        </ul>
      `,
      Quick: `
        <h3>CD1 – Intervals / Tempo – Engine – Quick (15–20 min)</h3>
        <ul>
          <li>Short warm-up</li>
          <li>6–10 short intervals (not max)</li>
          <li>Quick cool-down</li>
        </ul>
      `,
      Easy: `
        <h3>CD1 – Intervals / Tempo – Engine – Easy (10–20 min)</h3>
        <ul>
          <li>Light tempo/fartlek (easy/moderate switches)</li>
        </ul>
      `
    }
  },

  CD2: {
    RunWalk: {
      Standard: `
        <h3>CD2 – Easy Aerobic – Run/Walk – Standard (30–45 min)</h3>
        <ul>
          <li>Easy steady run/jog/brisk walk</li>
        </ul>
      `,
      Quick: `
        <h3>CD2 – Easy Aerobic – Run/Walk – Quick (15–20 min)</h3>
        <ul>
          <li>Short easy run/jog/walk</li>
        </ul>
      `,
      Easy: `
        <h3>CD2 – Easy Aerobic – Run/Walk – Easy (10–20 min)</h3>
        <ul>
          <li>Very light walk</li>
          <li>Optional RC1 mobility</li>
        </ul>
      `
    },
    Nonimpact: {
      Standard: `
        <h3>CD2 – Easy Aerobic – Nonimpact – Standard (30–45 min)</h3>
        <ul>
          <li>Easy steady bike/row/etc.</li>
          <li>Optional RC1 mobility</li>
        </ul>
      `,
      Quick: `
        <h3>CD2 – Easy Aerobic – Nonimpact – Quick (15–20 min)</h3>
        <ul>
          <li>Short nonimpact steady cardio</li>
        </ul>
      `,
      Easy: `
        <h3>CD2 – Easy Aerobic – Nonimpact – Easy (10–20 min)</h3>
        <ul>
          <li>Very light spin/erg</li>
          <li>RC1/RC2 optional</li>
        </ul>
      `
    }
  },

  BK3: {
    Footwork: {
      Standard: `
        <h3>BK3 – Quick Solo Boxing – Footwork (15–20 min)</h3>
        <ul>
          <li>Ring movement, pivots, step-and-slide, defensive footwork</li>
        </ul>
      `,
      Quick: `
        <h3>BK3 – Quick Solo Boxing – Footwork (15–20 min)</h3>
        <ul>
          <li>Ring movement, pivots, step-and-slide, defensive footwork</li>
        </ul>
      `,
      Easy: `
        <h3>BK3 – Quick Solo Boxing – Footwork (15–20 min)</h3>
        <ul>
          <li>Ring movement, pivots, step-and-slide, defensive footwork</li>
        </ul>
      `
    },
    BagWork: {
      Standard: `
        <h3>BK3 – Quick Solo Boxing – Bag Work (15–20 min)</h3>
        <ul>
          <li>Short focused rounds (jab-only, body shots, power rounds, etc.)</li>
        </ul>
      `,
      Quick: `
        <h3>BK3 – Quick Solo Boxing – Bag Work (15–20 min)</h3>
        <ul>
          <li>Short focused rounds (jab-only, body shots, power rounds, etc.)</li>
        </ul>
      `,
      Easy: `
        <h3>BK3 – Quick Solo Boxing – Bag Work (15–20 min)</h3>
        <ul>
          <li>Short focused rounds (jab-only, body shots, power rounds, etc.)</li>
        </ul>
      `
    },
    ShadowDefense: {
      Standard: `
        <h3>BK3 – Quick Solo Boxing – Shadow/Defense (15–20 min)</h3>
        <ul>
          <li>Head movement, guard, combos in air, visualization</li>
        </ul>
      `,
      Quick: `
        <h3>BK3 – Quick Solo Boxing – Shadow/Defense (15–20 min)</h3>
        <ul>
          <li>Head movement, guard, combos in air, visualization</li>
        </ul>
      `,
      Easy: `
        <h3>BK3 – Quick Solo Boxing – Shadow/Defense (15–20 min)</h3>
        <ul>
          <li>Head movement, guard, combos in air, visualization</li>
        </ul>
      `
    }
  }
};



// Find the most recent engine session (ST1/CD1/ST2/CD2)
function getLastEngineSession() {
  // sessions is sorted newest-first by loadSessions()
  for (const s of sessions) {
    if (ENGINE_TYPES.includes(s.session_type)) {
      return s;
    }
  }
  return null;
}

// Find the next session type in the loop ST1 -> CD1 -> ST2 -> CD2 -> ST1...
function getNextSessionType() {
  const order = ['ST1', 'CD1', 'ST2', 'CD2'];
  const last = getLastEngineSession();

  if (!last) {
    // If you've never done one, start at ST1
    return 'ST1';
  }

  const idx = order.indexOf(last.session_type);
  if (idx === -1) {
    // If last session_type is something else (BK1/BK2/etc.), start at ST1
    return 'ST1';
  }

  // Next in the loop, wrapping around
  return order[(idx + 1) % order.length];
}

// Find the most recent session of a given type
function getLastSessionOfType(type) {
  return sessions.find((s) => s.session_type === type) || null;
}

// Helper to alternate between two themes: A <-> B
function getNextABTheme(type, themeA, themeB) {
  const last = getLastSessionOfType(type);
  if (!last) return themeA;           // default to A
  return last.theme === themeA ? themeB : themeA;
}

// Given a session type, suggest the next theme based on your program rules
function getNextThemeForType(type) {
  switch (type) {
    case 'ST1':
      // ST1-Lower <-> ST1-Upper/Total
      return getNextABTheme('ST1', 'Lower', 'Upper/Total');
    case 'ST2':
      // ST2-Linear <-> ST2-Rotational
      return getNextABTheme('ST2', 'Linear', 'Rotational');
    case 'CD1':
      // CD1-Boxing <-> CD1-Engine
      return getNextABTheme('CD1', 'Boxing', 'Engine');
    case 'CD2':
      // CD2-Run/Walk <-> CD2-Nonimpact
      return getNextABTheme('CD2', 'Run/Walk', 'Nonimpact');
    default:
      return '';
  }
}

// Update the Today view text
function updateTodayView() {
  const typeSpan = document.getElementById('today-session-type');
  const themeSpan = document.getElementById('today-session-theme');
  const gearSpan = document.getElementById('today-session-gear');

  if (!typeSpan || !themeSpan || !gearSpan) return;

  const nextType = getNextSessionType();
  const nextTheme = getNextThemeForType(nextType);
  const suggestedGear = 'Standard'; // simple rule for now

  typeSpan.textContent = nextType || '';
  themeSpan.textContent = nextTheme || '';
  gearSpan.textContent = suggestedGear;
}

// Get references to buttons
const navToday = document.getElementById('nav-today');
const navSession = document.getElementById('nav-session');
const navLog = document.getElementById('nav-log');

// Get references to views
const viewToday = document.getElementById('view-today');
const viewSession = document.getElementById('view-session');
const viewLog = document.getElementById('view-log');

function showView(which) {
  viewToday.style.display = (which === 'today') ? 'block' : 'none';
  viewSession.style.display = (which === 'session') ? 'block' : 'none';
  viewLog.style.display = (which === 'log') ? 'block' : 'none';
}

navToday.addEventListener('click', () => showView('today'));
navSession.addEventListener('click', () => showView('session'));
navLog.addEventListener('click', () => showView('log'));

// Show Today by default
showView('today');

const sessionTypeInput = document.getElementById('session-type');
const sessionThemeInput = document.getElementById('session-theme');
const sessionGearInput = document.getElementById('session-gear');
const sessionRpeInput = document.getElementById('session-rpe');
const sessionNotesInput = document.getElementById('session-notes');
const saveSessionBtn = document.getElementById('save-session');

// Populate the theme dropdown based on the selected session type
function populateThemeDropdown(type, preferredValue = '') {
  if (!sessionThemeInput) return;

  const themes = THEME_OPTIONS_BY_TYPE[type] || [];
  sessionThemeInput.innerHTML = '';

  if (themes.length === 0) {
    const opt = document.createElement('option');
    opt.value = preferredValue || '';
    opt.textContent = preferredValue || '';
    sessionThemeInput.appendChild(opt);
    return;
  }

  themes.forEach((theme) => {
    const opt = document.createElement('option');
    opt.value = theme;
    opt.textContent = theme;
    sessionThemeInput.appendChild(opt);
  });

  if (preferredValue && themes.includes(preferredValue)) {
    sessionThemeInput.value = preferredValue;
  } else {
    sessionThemeInput.value = themes[0];
  }
}

if (sessionTypeInput) {
  populateThemeDropdown(sessionTypeInput.value);
  sessionTypeInput.addEventListener('change', () => {
    populateThemeDropdown(sessionTypeInput.value);
  });
}

const showWorkoutBtn = document.getElementById('show-workout-modal');
const workoutModal = document.getElementById('workout-modal');
const workoutModalTitle = document.getElementById('workout-modal-title');
const workoutModalBody = document.getElementById('workout-modal-body');
const workoutModalLogBtn = document.getElementById('workout-modal-log-btn');
const workoutModalCloseBtn = document.getElementById('workout-modal-close-btn');

function openWorkoutModal() {
  if (!workoutModal) return;
  workoutModal.classList.remove('hidden');
}

function closeWorkoutModal() {
  if (!workoutModal) return;
  workoutModal.classList.add('hidden');
}

if (workoutModalCloseBtn) {
  workoutModalCloseBtn.addEventListener('click', closeWorkoutModal);
}
if (workoutModal) {
  // Close when clicking backdrop
  workoutModal.addEventListener('click', (e) => {
    if (e.target === workoutModal) {
      closeWorkoutModal();
    }
  });
}

function buildWorkoutHtml(type, theme, gear) {
  const t = (type || '').trim();
  let th = (theme || '').trim();
  const g = (gear || '').trim() || 'Standard';

  // Normalize theme labels to the keys used in workoutTemplates
  if (t === 'ST1') {
    // Accept: "Upper/Total", "Upper", "Total"
    if (/upper/i.test(th) || /total/i.test(th)) th = 'UpperTotal';
    else th = 'Lower';
  }

  if (t === 'ST2') {
    if (/rot/i.test(th)) th = 'Rotational';
    else th = 'Linear';
  }

  if (t === 'CD1') {
    // Accept: "Boxing", "CD1-Boxing", etc.
    if (/box/i.test(th)) th = 'Boxing';
    else th = 'Engine';
  }

  if (t === 'CD2') {
    // Accept: "Run/Walk", "RunWalk", "Nonimpact", etc.
    if (/run/i.test(th) || /walk/i.test(th)) th = 'RunWalk';
    else th = 'Nonimpact';
  }

  if (t === 'BK3') {
    // Accept: "Footwork", "Bag Work", "BagWork", "Shadowboxing / Defense", etc.
    if (/foot/i.test(th)) th = 'Footwork';
    else if (/bag/i.test(th)) th = 'BagWork';
    else th = 'ShadowDefense';
  }

  const typeTemplates = workoutTemplates[t];
  const themeTemplates = typeTemplates ? typeTemplates[th] : null;
  const templateHtml = themeTemplates ? (themeTemplates[g] || themeTemplates.Standard) : null;

  if (templateHtml) return templateHtml;

  return `
    <h3>${t || 'Session'} – ${th || ''} – ${g}</h3>
    <p>No template is defined yet for this combination. You can still log the session.</p>
  `;
}


if (showWorkoutBtn) {
  showWorkoutBtn.addEventListener('click', () => {
    // Prefer the form values (session view) but fall back to Today spans
    const todayTypeSpan = document.getElementById('today-session-type');
    const todayThemeSpan = document.getElementById('today-session-theme');
    const todayGearSpan = document.getElementById('today-session-gear');

    const type = sessionTypeInput.value || (todayTypeSpan && todayTypeSpan.textContent) || '';
    const theme = sessionThemeInput.value || (todayThemeSpan && todayThemeSpan.textContent) || '';
    const gear = sessionGearInput.value || (todayGearSpan && todayGearSpan.textContent) || 'Standard';

    const titleParts = [type, theme, gear].filter(Boolean);
    if (workoutModalTitle) {
      workoutModalTitle.textContent = titleParts.join(' – ') || 'Workout Plan';
    }

    if (workoutModalBody) {
      workoutModalBody.innerHTML = buildWorkoutHtml(type, theme, gear);
    }

    openWorkoutModal();
  });
}



const applyTodayBtn = document.getElementById('apply-today-to-form');

if (applyTodayBtn) {
  applyTodayBtn.addEventListener('click', () => {
    const typeSpan = document.getElementById('today-session-type');
    const themeSpan = document.getElementById('today-session-theme');
    const gearSpan = document.getElementById('today-session-gear');

    if (!typeSpan || !themeSpan || !gearSpan) return;

    // Copy suggested values into the form
    const nextType = (typeSpan.textContent || sessionTypeInput.value || 'ST1').trim();
    const nextTheme = (themeSpan.textContent || '').trim();
    const nextGear = (gearSpan.textContent || 'Standard').trim();

    sessionTypeInput.value = nextType;
    populateThemeDropdown(nextType, nextTheme);
    sessionGearInput.value = nextGear || 'Standard';

    // Switch to the Session Details view
    showView('session');
  });
}

async function loadSessions() {
  try {
    const { data, error } = await supabaseClient
      .from('sessions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading sessions from Supabase:', error);
      return;
    }

    sessions = data || [];
    renderLog();
  } catch (err) {
    console.error('Unexpected error loading sessions:', err);
  } finally {
    updateTodayView();
  }
}

function renderLog() {
  const tbody = document.getElementById('sessions-table-body');
  if (!tbody) return;

  const timeZone = getSelectedTimeZone();
  const dateTimeOptions = timeZone ? { timeZone } : undefined;
  const formatSessionDate = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleString(undefined, dateTimeOptions);
  };

  // Clear existing rows
  tbody.innerHTML = '';

  // Add a row for each session
  sessions.forEach((session) => {
    const tr = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = formatSessionDate(session.date);
    tr.appendChild(dateCell);

    const typeCell = document.createElement('td');
    typeCell.textContent = session.session_type || '';
    tr.appendChild(typeCell);

    const themeCell = document.createElement('td');
    themeCell.textContent = session.theme || '';
    tr.appendChild(themeCell);

    const gearCell = document.createElement('td');
    gearCell.textContent = session.gear || '';
    tr.appendChild(gearCell);

    const rpeCell = document.createElement('td');
    rpeCell.textContent = session.rpe != null ? session.rpe : '';
    tr.appendChild(rpeCell);

    const notesCell = document.createElement('td');
    notesCell.textContent = session.notes || '';
    tr.appendChild(notesCell);

    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
      if (!session.id) {
        alert('Unable to delete this session because no ID was found.');
        return;
      }

      const confirmed = window.confirm('Delete this session? This cannot be undone.');
      if (!confirmed) return;

      await deleteSession(session.id);
    });
    actionsCell.appendChild(deleteButton);
    tr.appendChild(actionsCell);

    tbody.appendChild(tr);
  });
}

async function deleteSession(sessionId) {
  try {
    const { error } = await supabaseClient
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session from Supabase:', error);
      alert('Error deleting session from Supabase.');
      return;
    }

    await loadSessions();
  } catch (err) {
    console.error('Unexpected error deleting session:', err);
    alert('Unexpected error deleting session.');
  }
}

async function saveCurrentSession() {
  const session = {
    date: new Date().toISOString(),
    session_type: sessionTypeInput.value,
    theme: sessionThemeInput.value,
    gear: sessionGearInput.value,
    rpe: Number(sessionRpeInput.value || 0),
    notes: sessionNotesInput.value
  };

  try {
    const { error } = await supabaseClient
      .from('sessions')
      .insert([session]);

    if (error) {
      console.error(error);
      alert('Error saving session to Supabase.');
      return;
    }

    await loadSessions();
    alert('Session saved online to Supabase.');
  } catch (err) {
    console.error(err);
    alert('Unexpected error saving session.');
  }
}

if (saveSessionBtn) {
  saveSessionBtn.addEventListener('click', () => {
    saveCurrentSession();
  });
}

if (workoutModalLogBtn) {
  workoutModalLogBtn.addEventListener('click', async () => {
    await saveCurrentSession();
    closeWorkoutModal();
  });
};

// Show Today by default
showView('today');

// Load existing sessions from Supabase on startup
loadSessions();
