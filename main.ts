// Leonida Legend — hand-in for gta6-trophy-guide-01 (Node 22, standard library only).
//
// What is being handed in: app/ holds a fully offline, static trophy guide and
// tracker for Grand Theft Auto VI (PS5). It opens at app/index.html, loads its
// data from app/data/trophies.json — all 55 official trophies, each with a
// guide written for this entry and the sources that guide stands on — and
// needs no build step and no network. Progress lives in the visitor's
// localStorage and can be exported and imported as JSON.
//
// This program does three things, in order:
//   1. checks the data file really carries 55 trophies with a non-blank guide
//      each (a guide-less entry would be a list, not a guide);
//   2. copies app/ and screenshots/ from beside this file into the output
//      directory (MAKEFUN_OUTPUT_DIR, or /output in the grader's container);
//   3. writes dossier.json there with the vendored make.fun library.
//      vendor/makefun-frontend.ts stays byte for byte as shipped: the scorer
//      requires the dossier to be exactly what its own copy writes.
//
// Run it with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Preview the app first with `node serve.ts`, then open the local address it prints.

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// 1. The data check. The official list has 55 trophies; every one of them
// must carry a guide in our own words, or the entry fails its own premise.
const data = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
const trophies = data.trophies ?? [];
if (trophies.length !== 55) {
  throw new Error(`trophies.json must list all 55 trophies; found ${trophies.length}`);
}
const guideless = trophies.filter((t) => typeof t.guide !== 'string' || t.guide.trim() === '');
if (guideless.length > 0) {
  throw new Error(`trophies without a guide: ${guideless.map((t) => t.name).join(', ')}`);
}
const unsourced = trophies.filter((t) => !Array.isArray(t.sources) || t.sources.length === 0);
if (unsourced.length > 0) {
  throw new Error(`trophies without sources: ${unsourced.map((t) => t.name).join(', ')}`);
}
// The official split is 1 platinum, 2 gold, 6 silver, 46 bronze; a data edit
// that quietly changed a grade would mislead every reader of the guide.
const gradeCounts = {};
for (const t of trophies) gradeCounts[t.grade] = (gradeCounts[t.grade] ?? 0) + 1;
const expectedGrades = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
for (const [grade, count] of Object.entries(expectedGrades)) {
  if (gradeCounts[grade] !== count) {
    throw new Error(`expected ${count} ${grade} trophies; found ${gradeCounts[grade] ?? 0}`);
  }
}

// 2. Copy the entry into the output directory.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// 3. The dossier, under the scorer's own caps (reference/gate.json): only
// text_max_bytes shapes the bytes; the others refuse an entry the scorer
// would refuse (more than 4 screenshots or one over 256 KiB; more than 993
// files and directories in app/ or 48 MiB of app files).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(
  `Handed in: ${trophies.length} trophies (${gradeCounts.platinum} platinum, ${gradeCounts.gold} gold, ` +
    `${gradeCounts.silver} silver, ${gradeCounts.bronze} bronze), every one with a sourced guide, ` +
    `plus app/ and screenshots/ -> ${out}`,
);
