// Leonida Legend — wiring. Loads the trophy data, holds the filter state,
// and re-renders the checklist, guide pane and roadmap on every change.
// Progress itself lives in store.js; this file only owns the view.

import {
  loadState,
  toggleEarned,
  setCount,
  exportState,
  importState,
  resetState,
} from './store.js';
import {
  applyFilters,
  renderProgress,
  renderList,
  renderDetail,
  renderRoadmap,
} from './render.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let state = loadState();
const ui = {
  view: 'checklist',
  kind: 'all',
  grade: 'all',
  query: '',
  sort: 'roadmap',
  hideSpoilers: false,
  selectedId: null,
};

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const checklistView = document.getElementById('checklist-view');
const roadmapView = document.getElementById('roadmap-view');

const handlers = {
  onToggle(id) {
    toggleEarned(state, id);
    refresh();
  },
  onCount(id, value) {
    setCount(state, id, value);
    refresh();
  },
  onSelect(id) {
    ui.selectedId = id;
    if (ui.view !== 'checklist') setView('checklist');
    refresh();
    detailEl.scrollIntoView({ block: 'nearest' });
  },
};

function refresh() {
  renderProgress(trophies, state);
  const visible = applyFilters(trophies, state, ui);
  renderList(listEl, visible, state, ui, handlers);
  renderDetail(detailEl, byId.get(ui.selectedId) ?? null, state, ui, handlers);
  if (ui.view === 'roadmap') {
    renderRoadmap(
      document.getElementById('stage-list'),
      document.getElementById('watchout-list'),
      trophies,
      state,
      ui,
      handlers,
    );
  }
  document.getElementById('online-note').hidden = ui.kind !== 'online';
}

function setView(view) {
  ui.view = view;
  checklistView.hidden = view !== 'checklist';
  roadmapView.hidden = view !== 'roadmap';
  document.getElementById('filters').style.visibility = view === 'checklist' ? 'visible' : 'hidden';
  document.getElementById('tab-checklist').classList.toggle('active', view === 'checklist');
  document.getElementById('tab-roadmap').classList.toggle('active', view === 'roadmap');
  refresh();
}

document.getElementById('tab-checklist').addEventListener('click', () => setView('checklist'));
document.getElementById('tab-roadmap').addEventListener('click', () => setView('roadmap'));
document.getElementById('search').addEventListener('input', (event) => {
  ui.query = event.target.value;
  refresh();
});
document.getElementById('kind-chips').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-kind]');
  if (!chip) return;
  ui.kind = chip.dataset.kind;
  for (const node of document.querySelectorAll('#kind-chips .chip')) {
    node.classList.toggle('active', node === chip);
  }
  refresh();
});
document.getElementById('grade-filter').addEventListener('change', (event) => {
  ui.grade = event.target.value;
  refresh();
});
document.getElementById('sort-order').addEventListener('change', (event) => {
  ui.sort = event.target.value;
  refresh();
});
document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
  ui.hideSpoilers = event.target.checked;
  refresh();
});
document.getElementById('export-btn').addEventListener('click', () => exportState(state));
document.getElementById('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state = await importState(file, new Set(byId.keys()));
  } catch {
    window.alert('That file is not a Leonida Legend progress export.');
  }
  event.target.value = '';
  refresh();
});
document.getElementById('reset-btn').addEventListener('click', () => {
  state = resetState();
  refresh();
});

// A guide open on arrival makes the app explain itself: start with the
// finale's collectible sweep, a silver with a number attached.
ui.selectedId = 42;
refresh();
