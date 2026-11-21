// Progress state for the tracker: which trophies are earned, and the running
// count toward each counted trophy (stunts, scans, dollars and the rest).
// State lives in localStorage only, and can be exported to a JSON file and
// imported back — nothing ever leaves the browser.

const STORAGE_KEY = 'leonida-legend-progress-v1';

export function emptyState() {
  return { earned: new Set(), counts: {} };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ earned: [...state.earned], counts: state.counts }),
  );
}

export function toggleEarned(state, id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveState(state);
}

export function setCount(state, id, value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  if (n > 0) state.counts[id] = n;
  else delete state.counts[id];
  saveState(state);
}

export function exportState(state) {
  const payload = JSON.stringify(
    { app: 'leonida-legend', version: 1, earned: [...state.earned], counts: state.counts },
    null,
    2,
  );
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  link.download = 'leonida-legend-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

// Reads an exported progress file. Returns a fresh state holding only trophy
// ids the current list knows about, so a stray file cannot invent trophies.
export async function importState(file, validIds) {
  const parsed = JSON.parse(await file.text());
  const state = emptyState();
  for (const id of Array.isArray(parsed.earned) ? parsed.earned : []) {
    if (validIds.has(id)) state.earned.add(id);
  }
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const [key, value] of Object.entries(parsed.counts)) {
      const id = Number(key);
      if (validIds.has(id) && Number(value) > 0) state.counts[id] = Math.floor(Number(value));
    }
  }
  saveState(state);
  return state;
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return emptyState();
}
