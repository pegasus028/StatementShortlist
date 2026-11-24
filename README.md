# The Statement Shortlist

Written-applications game for T.Chris's M6 *English as a Lingua Franca* class, on the engine of **The Shortlist**
(https://pegasus028.github.io/Shortlist/). The class becomes the committee for the fictional **Lotus Bridge Scholarship**
at Bang Rak International University: ten applicant files (a 100–120-word personal statement plus two activity lines),
three places, and one scholarship for the best of the three.

- Student app: `index.html` → https://pegasus028.github.io/StatementShortlist/

## The lesson (about 45 minutes; every clock is set on the board)

| Phase | Time | Students | Board |
|---|---|---|---|
| Lobby | ~3 min | Join with a nickname and a panel number (1–10), or Solo practice; read the briefing | Who has joined, by panel |
| Preview (optional, homework) | — | Open, read and mark the files; ranking stays locked | — |
| Round 1 · Alone | 15 min (10 after Preview) | Read the ten files; tap sentences to mark ✓ Evidence, ✗ Cliché or 🚩 Concern (with a reason); rank 1–10 and Send. Points 10, 9 … 1 | Rankings sent per panel |
| Round 2 · Panel | 12 min | Compare rankings and the Marks view (sentences the panel marked differently); one head of panel agrees the ranking, writes three reasons (≥ 15 words), attaches one sentence from the file to each, and picks advice for the bottom 3 | Heads and nominations per panel |
| Round 3 · Committee | 10 min | Own Cliché eye score; after Reveal, the sentences she missed | Leaderboard · Nominations · Agreement · Applicants · Marked text · Red flags · Own field · Cliché eye · Decision → podium · Designer's notes (Reveal) |
| Fix-it (optional) | 5 min or homework | The panel rewrites one paragraph or activity line of a weak file with live checks (cliché list, activity-line formula); paste is blocked | Fix-it gallery, one rewrite at a time |

Unsent rankings, marks and unfinished head forms are sent automatically when the teacher stops a round or starts the next (marked `auto`).

## Files

| File | What it is |
|---|---|
| `index.html` | Student app (one file) |
| `board.html` | Generated: edit `tools/board-src.html`, then `python3 tools/build-board.py <InvestigativeReporter>/leaderboard.html` |
| `config.js` | `API_URL` (Apps Script `/exec`) and `APP_URL` |
| `data/content.js` | Programme, files, criteria, mark types, concern reasons, advice, and the Module 2 tools copied from ELF Studio (cliché ban list, rewrite rule, verb bank, line check) with their source and version. All wording lives here |
| `js/core.js` | Shared logic (Cliché eye, flag catch, Marks view, agreement, own field, Fix-it assignment and checks ported from ELF Studio). Also pasted into `Code.gs` by `tools/sync-gs.js` |
| `apps-script/Code.gs` | Backend (Script Properties only). Run `node tools/sync-gs.js` after any change to content or core, then paste into Apps Script and deploy a new version |
| `data/tts.js`, `audio/` | Read-aloud: one Microsoft neural voice per applicant (Singapore, Hong Kong, Philippine and British English, as in the Shortlist), one clip per paragraph and one for the activity list. `python3 tools/make-audio.py --prune` |
| `art/applicants/fNN.jpg` | Portraits made in Gemini (prompts in `docs/portrait-prompts.md`), 600 × 750 |

The designer's key (which file is which, and the evidence/cliché/concern key for every sentence) is **not** in this repo: it lives in the
Apps Script project as `Notes.gs` and reaches the board only when the teacher presses Reveal.

## Checks

`node tools/content-check.js [--notes <Notes.gs>]` · `node tools/overlap-check.js` · `node tests/core.test.js` ·
`node tests/walk.js` (serve the folder first: `python3 -m http.server 8765`) · `OUT=<dir> node tests/shots.js`.
