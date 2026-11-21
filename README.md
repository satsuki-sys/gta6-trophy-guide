# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/satsuki-sys/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/satsuki-sys/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline trophy guide and tracker for **Grand Theft Auto VI (PlayStation 5)**, built as an entry to make.fun's `gta6-trophy-guide-01` competition. Open `app/index.html` in a browser — no build step, no network, nothing to install.

## What it does

- **All 55 official trophies** (1 platinum, 2 gold, 6 silver, 46 bronze), each with its official name, description and grade, in `app/data/trophies.json`.
- **A guide for every trophy**, written for this tracker in our own words, with the sources each guide stands on named in the guide and listed, with links, in the app. A fact with no source earns no place in a guide; where the trackers had not confirmed a hidden trophy's trigger, the guide says so instead of inventing one.
- **Checklist with memory**: tick trophies off, add running counts toward the counted ones (stunts, scans, dollars, spots…), and progress persists in `localStorage`. Export and import your progress as JSON.
- **Filters**: search, kind chips (story / missable & watch-outs / collectibles / activities / online), grade filter, and four sort orders. The official list has no online trophies, and the Online chip says exactly that.
- **Spoiler protection**: hide story trophies' names, descriptions and guides until you earn them.
- **Platinum roadmap**: eight stages in first-run order, with a Missables & watch-outs section — one reported possible missable (Positive Mental Attitude) and two cautioned trophies, each flag derived from the official descriptions and cited guides.

## Layout

- `app/` — the static app (`index.html`, `style.css`, ES modules under `app/js/`, data under `app/data/`).
- `screenshots/` — three real renders of the app; `shots.json` at the repository root says what each shows. The first by name is the cover.
- `main.ts` — the hand-in: checks the data (55 trophies, a sourced guide for each, the official grade split), copies `app/` and `screenshots/` to the output directory, and writes `dossier.json` with the vendored make.fun library, which is shipped unchanged.

Run the hand-in with:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Preview locally with `node serve.ts`, then open http://localhost:8080.

## Sources

Trophy names, descriptions and grades are the official PlayStation list, as mirrored by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and PSNProfiles. Guide facts are credited per trophy inside the data file and the app — principally KeenGamer's platinum roadmap, SixShore's trophy list, Mobalytics' walkthrough, Games.gg's trophy list and PlanetGTA6. No Rockstar artwork or logos are used; the look is colour and type only.

## License

MIT — see `LICENSE`.
