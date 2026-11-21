// Rendering: the progress header, the checklist cards, the guide pane and the
// roadmap. Everything is built with DOM calls and textContent, so trophy data
// is never parsed as markup.

import { STAGES } from './roadmap.js';

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const RING_CIRCUMFERENCE = 226.2;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function isMasked(trophy, state, ui) {
  return ui.hideSpoilers && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

export function displayName(trophy, state, ui) {
  return isMasked(trophy, state, ui) ? '••••••••••' : trophy.name;
}

function formatTarget(trophy, value) {
  const body = Number(value).toLocaleString('en-US');
  return trophy.targetLabel && trophy.targetLabel.startsWith('dollars') ? `$${body}` : body;
}

export function badgesFor(trophy, state) {
  const badges = [];
  const grade = el('span', `badge grade-${trophy.grade}`, trophy.grade);
  badges.push(grade);
  if (trophy.kind !== 'platinum') badges.push(el('span', 'badge', trophy.kind));
  if (trophy.hidden) badges.push(el('span', 'badge hidden-badge', 'hidden'));
  if (trophy.missable) badges.push(el('span', 'badge missable', 'possible missable'));
  if (trophy.caution) badges.push(el('span', 'badge caution', 'watch out'));
  if (trophy.target) {
    const now = state.counts[trophy.id] ?? 0;
    badges.push(
      el('span', 'badge count-progress', `${formatTarget(trophy, now)} / ${formatTarget(trophy, trophy.target)} ${trophy.targetLabel}`),
    );
  }
  return badges;
}

export function renderProgress(trophies, state) {
  const earned = state.earned.size;
  document.getElementById('progress-count').textContent = String(earned);
  document.getElementById('progress-line').textContent = `${earned} of ${trophies.length} earned`;
  const ring = document.getElementById('ring-fill');
  ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - earned / trophies.length));
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const all = trophies.filter((t) => t.grade === grade);
    const got = all.filter((t) => state.earned.has(t.id)).length;
    return `${grade} ${got}/${all.length}`;
  });
  document.getElementById('grade-line').textContent = byGrade.join(' · ');
}

export function applyFilters(trophies, state, ui) {
  const query = ui.query.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (ui.kind === 'missable') {
      if (!t.missable && !t.caution) return false;
    } else if (ui.kind !== 'all' && t.kind !== ui.kind) {
      return false;
    }
    if (ui.grade !== 'all' && t.grade !== ui.grade) return false;
    if (query && !`${t.name} ${t.description}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const byRoadmap = (a, b) => a.stage - b.stage || a.id - b.id;
  if (ui.sort === 'grade') list = [...list].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || byRoadmap(a, b));
  else if (ui.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else if (ui.sort === 'remaining') list = [...list].sort((a, b) => Number(state.earned.has(a.id)) - Number(state.earned.has(b.id)) || byRoadmap(a, b));
  else list = [...list].sort(byRoadmap);
  return list;
}

export function renderList(container, trophies, state, ui, handlers) {
  container.replaceChildren();
  document.getElementById('result-line').textContent =
    `${trophies.length} of 55 trophies shown · click a card for its guide · tick the box when you earn it`;
  for (const trophy of trophies) {
    const earned = state.earned.has(trophy.id);
    const card = el('article', `card${earned ? ' earned' : ''}${ui.selectedId === trophy.id ? ' selected' : ''}`);
    const tick = el('span', 'tick', earned ? '✓' : '');
    tick.title = earned ? 'Earned — click to undo' : 'Mark as earned';
    tick.addEventListener('click', (event) => {
      event.stopPropagation();
      handlers.onToggle(trophy.id);
    });
    const body = el('div');
    const masked = isMasked(trophy, state, ui);
    body.append(el('h3', masked ? 'spoiler-name' : '', displayName(trophy, state, ui)));
    body.append(el('p', 'desc', masked ? 'A story trophy, hidden until you earn it.' : trophy.description));
    const meta = el('div', 'meta');
    for (const badge of badgesFor(trophy, state)) meta.append(badge);
    body.append(meta);
    card.append(tick, body, el('span', 'stage-tag', `Stage ${trophy.stage}`));
    card.addEventListener('click', () => handlers.onSelect(trophy.id));
    container.append(card);
  }
  if (trophies.length === 0) {
    container.append(el('p', 'result-line', 'No trophies match — loosen a filter or clear the search.'));
  }
}

export function renderDetail(container, trophy, state, ui, handlers) {
  container.replaceChildren();
  if (!trophy) {
    container.append(el('p', 'placeholder', 'Pick a trophy from the checklist and its guide — what to do, when it can be missed, and where every fact comes from — opens here.'));
    return;
  }
  const earned = state.earned.has(trophy.id);
  const masked = isMasked(trophy, state, ui);
  const meta = el('div', 'meta');
  for (const badge of badgesFor(trophy, state)) meta.append(badge);
  container.append(meta);
  container.append(el('h2', masked ? 'spoiler-name' : '', displayName(trophy, state, ui)));
  if (masked) {
    container.append(el('p', 'guide-text', 'Spoiler protection is on: this story trophy’s name, description and guide stay hidden until you earn it. Turn off “Hide story spoilers” in the toolbar to read it now.'));
    return;
  }
  container.append(el('p', 'official', `“${trophy.description}” — official description`));
  container.append(el('h4', '', 'Guide'));
  container.append(el('p', 'guide-text', trophy.guide));
  if (trophy.missable) {
    const box = el('div', 'missable-box', 'Possible missable: Mobalytics’ walkthrough names this as the list’s one possible missable. Do not leave it for a single end-game sweep.');
    container.append(box);
  }
  if (trophy.caution) {
    container.append(el('div', 'caution-box', `Watch out: ${trophy.caution}`));
  }
  container.append(el('h4', '', 'Sources'));
  const sources = el('ul', 'sources');
  for (const source of trophy.sources ?? []) {
    const item = el('li');
    if (source.url) {
      const link = el('a', '', source.name);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      item.append(link);
    } else {
      item.append(el('span', '', source.name));
    }
    sources.append(item);
  }
  container.append(sources);

  const earnRow = el('div', 'earn-row');
  const toggle = el('button', `earn-toggle${earned ? ' on' : ''}`, earned ? '✓ Earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => handlers.onToggle(trophy.id));
  earnRow.append(toggle);
  if (trophy.target) {
    const editor = el('label', 'count-editor', `Progress (${trophy.targetLabel})`);
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target);
    input.value = String(state.counts[trophy.id] ?? 0);
    input.addEventListener('change', () => handlers.onCount(trophy.id, input.value));
    const of = el('span', '', `of ${formatTarget(trophy, trophy.target)}`);
    editor.append(input, of);
    earnRow.append(editor);
  }
  container.append(earnRow);
}

const WATCHOUT_TEXT = {
  missable: 'Reported as the list’s one possible missable (Mobalytics’ walkthrough). Work its 18 spots as you travel; do not save them for the end.',
};

export function renderRoadmap(stageContainer, watchoutContainer, trophies, state, ui, handlers) {
  watchoutContainer.replaceChildren();
  for (const trophy of trophies.filter((t) => t.missable || t.caution)) {
    const card = el('div', `watchout-card${trophy.missable ? '' : ' amber'}`);
    card.append(el('h3', '', `${trophy.missable ? '⚠ ' : 'Watch out — '}${trophy.name}`));
    card.append(el('p', '', trophy.caution ?? WATCHOUT_TEXT.missable));
    card.addEventListener('click', () => handlers.onSelect(trophy.id));
    watchoutContainer.append(card);
  }
  stageContainer.replaceChildren();
  for (const stage of STAGES) {
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-num', `Stage ${stage.n}`), el('h3', '', stage.title));
    section.append(head, el('p', 'stage-note', stage.note));
    const rows = el('div', 'stage-rows');
    for (const trophy of trophies.filter((t) => t.stage === stage.n)) {
      const earned = state.earned.has(trophy.id);
      const row = el('button', `stage-row${earned ? ' earned' : ''}`);
      row.type = 'button';
      const tick = el('span', 'tick', earned ? '✓' : '');
      tick.addEventListener('click', (event) => {
        event.stopPropagation();
        handlers.onToggle(trophy.id);
      });
      const nameWrap = el('span');
      const masked = isMasked(trophy, state, ui);
      nameWrap.append(
        el('span', `row-name${masked ? ' spoiler-name' : ''}`, displayName(trophy, state, ui)),
        el('span', 'row-desc', masked ? 'Story trophy — hidden until earned' : trophy.description),
      );
      const flags = el('span', 'meta');
      for (const badge of badgesFor(trophy, state)) flags.append(badge);
      row.append(tick, nameWrap, flags);
      row.addEventListener('click', () => handlers.onSelect(trophy.id));
      rows.append(row);
    }
    section.append(rows);
    stageContainer.append(section);
  }
}
