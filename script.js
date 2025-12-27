// Initialize Supabase client (global)
const supabaseUrl = 'https://ybfewqvydkihkyznqjcm.supabase.co';
const supabaseKey = 'sb_publishable_XQzxhiiQwZVE0eF4O_oLDQ_6op6-HfP';

// "supabase" comes from the CDN script in index.html
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized');


// This will hold your past sessions in memory for now
let sessions = [];

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
        <ul>
          <li><strong>Warm-up / activation</strong></li>
          <li><strong>Main lower:</strong> squat or hinge pattern</li>
          <li><strong>Secondary pattern:</strong> lunge or hip hinge if you squatted</li>
          <li><strong>Upper back / pulling move</strong></li>
          <li><strong>Short core finisher (RC2)</strong></li>
        </ul>
      `,
      Quick: `
        <h3>ST1 – Heavy Strength – Lower – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short warm-up</strong></li>
          <li><strong>Main lower pattern:</strong> reduced sets</li>
          <li><strong>One quick core exercise</strong></li>
        </ul>
      `,
      Easy: `
        <h3>ST1 – Heavy Strength – Lower – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Light movement prep</strong></li>
          <li><strong>Bodyweight / lighter lower pattern</strong></li>
          <li><strong>Extra mobility (RC1)</strong> + gentle trunk work</li>
        </ul>
      `
    },
    UpperTotal: {
      Standard: `
        <h3>ST1 – Heavy Strength – Upper/Total – Standard (30–45 min)</h3>
        <ul>
          <li><strong>Warm-up</strong></li>
          <li><strong>Main upper push or pull</strong></li>
          <li><strong>Complementary push/pull pattern</strong></li>
          <li><strong>Light lower or total-body pattern</strong> (e.g., RDLs or split squats)</li>
          <li><strong>Core finisher (RC2)</strong></li>
        </ul>
      `,
      Quick: `
        <h3>ST1 – Heavy Strength – Upper/Total – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short warm-up</strong></li>
          <li><strong>One upper compound</strong> (push or pull)</li>
          <li><strong>One core exercise</strong></li>
        </ul>
      `,
      Easy: `
        <h3>ST1 – Heavy Strength – Upper/Total – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Easy upper activation</strong> (bands, light DBs)</li>
          <li><strong>Mobility for shoulders/T-spine (RC1)</strong></li>
          <li><strong>Light core (RC2)</strong></li>
        </ul>
      `
    }
  },

  ST2: {
    Linear: {
      Standard: `
        <h3>ST2 – Speed / Power – Linear – Standard (30–45 min)</h3>
        <ul>
          <li><strong>Dynamic warm-up</strong></li>
          <li><strong>1–2 low-volume jump drills</strong> (e.g., vertical or broad)</li>
          <li><strong>1 speed-strength lift</strong> (e.g., fast squat/press variation)</li>
          <li><strong>Short core block (RC2)</strong></li>
        </ul>
      `,
      Quick: `
        <h3>ST2 – Speed / Power – Linear – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short dynamic warm-up</strong></li>
          <li><strong>1 jump drill</strong></li>
          <li><strong>1 short speed-strength pattern</strong></li>
        </ul>
      `,
      Easy: `
        <h3>ST2 – Speed / Power – Linear – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Very low-impact pogo / skip / bounce style work</strong></li>
          <li><strong>Core activation</strong>, no heavy or high-impact work</li>
        </ul>
      `
    },
    Rotational: {
      Standard: `
        <h3>ST2 – Speed / Power – Rotational – Standard (30–45 min)</h3>
        <ul>
          <li><strong>Dynamic warm-up</strong></li>
          <li><strong>1–2 rotational / lateral medball drills</strong></li>
          <li><strong>1 speed-strength pattern</strong> with rotational or lateral emphasis</li>
          <li><strong>Anti-rotation / carry-focused core (RC2)</strong></li>
        </ul>
      `,
      Quick: `
        <h3>ST2 – Speed / Power – Rotational – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short warm-up</strong></li>
          <li><strong>1 rotational medball drill</strong></li>
          <li><strong>1 core/stability movement</strong> (anti-rotation)</li>
        </ul>
      `,
      Easy: `
        <h3>ST2 – Speed / Power – Rotational – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Light medball / band rotational patterns</strong> (no max effort)</li>
          <li><strong>Gentle core emphasis</strong></li>
        </ul>
      `
    }
  },

  CD1: {
    Boxing: {
      Standard: `
        <h3>CD1 – Intervals / Tempo – Boxing – Standard (30–45 min)</h3>
        <ul>
          <li><strong>Warm-up (shadow)</strong></li>
          <li><strong>6–8 rounds</strong> of bag/shadow intervals or tempo work</li>
          <li><strong>Cool-down</strong> + mobility (RC1)</li>
        </ul>
      `,
      Quick: `
        <h3>CD1 – Intervals / Tempo – Boxing – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short warm-up</strong></li>
          <li><strong>4–6 focused rounds</strong> at moderate-hard pace</li>
          <li><strong>Very short cool-down</strong></li>
        </ul>
      `,
      Easy: `
        <h3>CD1 – Intervals / Tempo – Boxing – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Technique-tempo rounds</strong> (RPE ≤ 6/10)</li>
          <li><strong>Mobility</strong> 5–10 min (RC1)</li>
        </ul>
      `
    },
    Engine: {
      Standard: `
        <h3>CD1 – Intervals / Tempo – Engine – Standard (30–45 min)</h3>
        <ul>
          <li><strong>Warm-up</strong></li>
          <li><strong>Intervals/tempos</strong> on run/bike/erg</li>
          <li><strong>Short cool-down</strong></li>
        </ul>
      `,
      Quick: `
        <h3>CD1 – Intervals / Tempo – Engine – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short warm-up</strong></li>
          <li><strong>6–10 short intervals</strong> (not max)</li>
          <li><strong>Quick cool-down</strong></li>
        </ul>
      `,
      Easy: `
        <h3>CD1 – Intervals / Tempo – Engine – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Light tempo or fartlek</strong> (easy/moderate switches)</li>
          <li><strong>Keep intensity low–moderate</strong></li>
        </ul>
      `
    }
  },

  CD2: {
    RunWalk: {
      Standard: `
        <h3>CD2 – Easy Aerobic – Run/Walk – Standard (30–45 min)</h3>
        <ul>
          <li><strong>Easy steady run/jog or brisk walk</strong></li>
          <li><strong>Relaxed breathing</strong>; conversational pace</li>
        </ul>
      `,
      Quick: `
        <h3>CD2 – Easy Aerobic – Run/Walk – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short run/jog/walk</strong> at easy pace</li>
        </ul>
      `,
      Easy: `
        <h3>CD2 – Easy Aerobic – Run/Walk – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Very light walk</strong></li>
          <li>Optional: longer mobility block (RC1)</li>
        </ul>
      `
    },
    Nonimpact: {
      Standard: `
        <h3>CD2 – Easy Aerobic – Nonimpact – Standard (30–45 min)</h3>
        <ul>
          <li><strong>Easy steady bike/row/elliptical</strong></li>
          <li>Optional: short mobility after (RC1)</li>
        </ul>
      `,
      Quick: `
        <h3>CD2 – Easy Aerobic – Nonimpact – Quick (15–20 min)</h3>
        <ul>
          <li><strong>Short nonimpact steady cardio</strong></li>
        </ul>
      `,
      Easy: `
        <h3>CD2 – Easy Aerobic – Nonimpact – Easy (10–20 min)</h3>
        <ul>
          <li><strong>Very light spin/erg</strong></li>
          <li><strong>Mobility (RC1)</strong> + optional light core (RC2)</li>
        </ul>
      `
    }
  },

  BK3: {
    Footwork: {
      Standard: `
        <h3>BK3 – Quick Solo Boxing – Footwork (≈15–20 min)</h3>
        <ul>
          <li>Ring movement patterns</li>
          <li>Pivots, step-and-slide, defensive footwork</li>
          <li>Small space friendly (line/ladder optional)</li>
        </ul>
      `,
      Quick: `
        <h3>BK3 – Quick Solo Boxing – Footwork (≈10–15 min)</h3>
        <ul>
          <li>Shorter footwork-only block</li>
          <li>Focus on crisp reps and balance</li>
        </ul>
      `,
      Easy: `
        <h3>BK3 – Quick Solo Boxing – Footwork (Easy, ≈10–15 min)</h3>
        <ul>
          <li>Low intensity movement quality</li>
          <li>Technique-first, stay fresh</li>
        </ul>
      `
    },
    BagWork: {
      Standard: `
        <h3>BK3 – Quick Solo Boxing – Bag Work (≈15–20 min)</h3>
        <ul>
          <li>Short, focused rounds (jab-only, body shots, power rounds, etc.)</li>
          <li>Moderate intensity unless planned as CD1-Boxing</li>
        </ul>
      `,
      Quick: `
        <h3>BK3 – Quick Solo Boxing – Bag Work (≈10–15 min)</h3>
        <ul>
          <li>Fewer focused rounds</li>
          <li>Stay technical; avoid empty fatigue</li>
        </ul>
      `,
      Easy: `
        <h3>BK3 – Quick Solo Boxing – Bag Work (Easy, ≈10–15 min)</h3>
        <ul>
          <li>Light, technical rounds</li>
          <li>Keep pace comfortable</li>
        </ul>
      `
    },
    ShadowDefense: {
      Standard: `
        <h3>BK3 – Quick Solo Boxing – Shadowboxing / Defense (≈15–20 min)</h3>
        <ul>
          <li>Head movement, guard position, combinations in the air</li>
          <li>Visualization encouraged</li>
        </ul>
      `,
      Quick: `
        <h3>BK3 – Quick Solo Boxing – Shadowboxing / Defense (≈10–15 min)</h3>
        <ul>
          <li>Short technical rounds</li>
          <li>Emphasize clean form and breathing</li>
        </ul>
      `,
      Easy: `
        <h3>BK3 – Quick Solo Boxing – Shadowboxing / Defense (Easy, ≈10–15 min)</h3>
        <ul>
          <li>Very light technical flow</li>
          <li>Focus on smoothness and posture</li>
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
     updateTodayView();   
  } catch (err) {
    console.error('Unexpected error loading sessions:', err);
  }
}

function renderLog() {
  const tbody = document.getElementById('sessions-table-body');
  if (!tbody) return;

  // Clear existing rows
  tbody.innerHTML = '';

  // Add a row for each session
  sessions.forEach((session) => {
    const tr = document.createElement('tr');

    const dateCell = document.createElement('td');
    const date = session.date ? new Date(session.date) : null;
    dateCell.textContent = date ? date.toLocaleString() : '';
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

    tbody.appendChild(tr);
  });
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
