// The platinum roadmap: eight stages in the order a first run meets them.
// The order is built from the official descriptions — chapters and named
// missions in campaign order, contact strands next (they stay available after
// the story), collections and feats in the travelling between, money and
// property after that, and the 100% checklist last because it asks for more
// than several trophies do (300 stunts against the trophy's 250, all 8 bank
// vaults against its 5).

export const STAGES = [
  {
    n: 1,
    title: 'Opening waters',
    note: 'Gone Fishing opens the game and Chapter 1 closes its first act. Nothing to prepare: play, and let the tracker start filling in.',
  },
  {
    n: 2,
    title: 'Chapters 2–4 and the named missions',
    note: 'The campaign’s spine. Chapters 2, 3 and 4 end with their trophies, and the named missions — Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown, Operation Savage Glory — arrive inside these chapters. In Chapter 4, take the optional mission that opens the bank-vault jobs; Maximum Withdrawal depends on it.',
  },
  {
    n: 3,
    title: 'The finale',
    note: 'The final mission, and the run’s one hard edge: there is no mission replay, so keep a manual save from before it and clear the meditation spots first. Free roam opens again after the credits for everything left.',
  },
  {
    n: 4,
    title: 'Contacts & strangers',
    note: 'Andy, Kenton, Billy, Randy and Tyrone each pay a trophy at the end of their strand, Bret pays one for a single unique hunt, and Strangers & Freaks wants eight full stranger strands. Strands stay available after the story, so this stage batches neatly into post-campaign cleanup.',
  },
  {
    n: 5,
    title: 'Collecting Leonida',
    note: 'The map-wide harvest: meditation spots (the reported possible missable — start early), card sets, WAiNK scans, discovered vehicles, Scooter Bros registrations and the full exploration of the state. All of it rewards travelling slowly with the tracker open.',
  },
  {
    n: 6,
    title: 'Feats & activities',
    note: 'The long middle: stunts, range golds, races, challenges, robberies and the one-off feats, including the hidden handful whose descriptions are jokes or riddles. Most are retryable forever; the choice-based Actions Speak Louder is the exception to protect with a save.',
  },
  {
    n: 7,
    title: 'Money & property',
    note: 'Launder the marked bills, spend through the shops, and buy all eight garages. These are cumulative counters — habits, not events — and the earnings from stage 6’s robberies feed them.',
  },
  {
    n: 8,
    title: '100% and the platinum',
    note: 'A Long Road asks for the game’s own 100% checklist (Progress → Stats → 100% Completion), which overshoots several trophy targets. When it lands, Vice Got a Price! follows on its own: the platinum is the last trophy because it is all of them.',
  },
];

export function stageOf(n) {
  return STAGES.find((s) => s.n === n) ?? STAGES[0];
}
