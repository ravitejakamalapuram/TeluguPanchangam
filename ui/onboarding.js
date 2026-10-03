/**
 * ui/onboarding.js
 * First-run onboarding (review §5.1): language → city → optional birth details in the #onboarding
 * <dialog>, then a one-day note under the clock asking the user to keep this new tab (Chrome's
 * "Change back?" bubble is the biggest source of new-tab uninstalls). It saves nothing itself:
 * every choice goes through newtab.js's own controls via the callbacks passed to startOnboarding().
 */

const DAY_MS = 24 * 3600 * 1000;

// Anything saved before onboarding existed (settings, city, reminders, language) marks an existing user.
const EXISTING_USER_KEYS = ['userSettings', 'selectedCity', 'reminders', 'uiLang'];

// onboardingDone is false while the dialog is open, so a user who leaves half-way sees it again even
// though its steps already saved uiLang/selectedCity; it becomes the finish time once the dialog closes.
export function needsOnboarding(stored) {
  if ('onboardingDone' in stored) return stored.onboardingDone === false;
  return !EXISTING_USER_KEYS.some((k) => k in stored);
}

// US metros first when the browser runs on an American time zone; otherwise the preset order.
export function orderCities(presets, timeZone) {
  if (!String(timeZone).startsWith('America/')) return presets.slice();
  return [...presets.filter((c) => c.region === 'US'), ...presets.filter((c) => c.region !== 'US')];
}

// onboardingDone holds the time onboarding finished; the note covers the day after it.
export function showDayOneNote(stored, now) {
  return typeof stored.onboardingDone === 'number' && !stored.dayOneNoteDismissed && now - stored.onboardingDone < DAY_MS;
}

const storageGet = (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve));

/**
 * app: { setLanguage(lang), cityId(), setCity(city), useMyLocation() → Promise<found>, saveBirthDetails({ name, dob, tob }) }.
 * Each of these refreshes the dashboard itself, so closing the dialog needs no extra refresh.
 */
export async function startOnboarding(app) {
  const note = document.getElementById('day-one-note');
  document.getElementById('day-one-dismiss').addEventListener('click', () => {
    note.hidden = true;
    chrome.storage.local.set({ dayOneNoteDismissed: true });
  });

  const stored = await storageGet(['onboardingDone', 'dayOneNoteDismissed', ...EXISTING_USER_KEYS]);
  if (needsOnboarding(stored)) openDialog(app, note);
  else note.hidden = !showDayOneNote(stored, Date.now());
}

function openDialog(app, note) {
  const dialog = document.getElementById('onboarding');
  const steps = [...dialog.querySelectorAll('.onboarding-step')];
  const progress = document.getElementById('onboarding-progress');
  const cities = document.getElementById('onboarding-cities');
  const form = document.getElementById('onboarding-birth');
  const btnBack = document.getElementById('onboarding-back');
  const btnNext = document.getElementById('onboarding-next');
  const btnFinish = document.getElementById('onboarding-finish');
  let step = 0;

  function show(i) {
    step = i;
    steps.forEach((s, j) => { s.hidden = j !== i; });
    btnBack.hidden = i === 0;
    btnNext.hidden = i === steps.length - 1;
    btnFinish.hidden = i !== steps.length - 1;
    progress.textContent = window.I18N.teEn(`దశ ${i + 1} / ${steps.length}`, `Step ${i + 1} of ${steps.length}`);
    dialog.querySelectorAll('[data-onboarding-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.onboardingLang === window.I18N.getLang()));
    });
    if (i === 1) renderCities();
    // The chosen language, else the step's first control (the top city, so US metros stay in view).
    const s = steps[i];
    (s.querySelector('[aria-pressed="true"]') || s.querySelector('input, button')).focus();
  }

  function renderCities() {
    const current = app.cityId();
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    cities.replaceChildren(...orderCities(window.CityPresets.PRESETS, zone).map((city) => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'onboarding-city';
      input.checked = city.id === current;
      input.addEventListener('change', () => app.setCity(city));
      const label = document.createElement('label');
      label.className = 'onboarding-city';
      label.append(input, document.createTextNode(window.I18N.bi(city.name)));
      return label;
    }));
  }

  dialog.querySelectorAll('[data-onboarding-lang]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.onboardingLang === window.I18N.getLang()) return;
    app.setLanguage(b.dataset.onboardingLang);
    show(step); // re-renders the progress line and pressed state in the new language
  }));
  // Stay on this step until the location arrives: the sidebar's own status line sits behind the backdrop.
  const locate = document.getElementById('onboarding-locate');
  const locateStatus = document.getElementById('onboarding-locate-status');
  locate.addEventListener('click', async () => {
    locateStatus.textContent = window.I18N.t('locLocating');
    const found = await app.useMyLocation();
    locateStatus.textContent = found ? '' : window.I18N.t('locUnavailable');
    if (found && dialog.open && step === 1) show(2);
  });
  btnBack.addEventListener('click', () => show(step - 1));
  btnNext.addEventListener('click', () => show(step + 1));
  document.getElementById('onboarding-skip').addEventListener('click', () => dialog.close());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('onboarding-name').value.trim();
    const dob = document.getElementById('onboarding-dob').value;
    const tob = document.getElementById('onboarding-tob').value || '12:00';
    if (name || dob) app.saveBirthDetails({ name, dob, tob });
    dialog.close();
  });

  // Finish, Skip and Esc all end here: onboarding is done and day 1 starts now.
  dialog.addEventListener('close', () => {
    chrome.storage.local.set({ onboardingDone: Date.now() });
    note.hidden = false;
  }, { once: true });

  chrome.storage.local.set({ onboardingDone: false }); // in progress, before any step saves a key
  dialog.showModal();
  show(0);
}
