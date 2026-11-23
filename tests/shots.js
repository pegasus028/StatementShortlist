/* The Statement Shortlist — screenshots for the deck and the walkthrough video, with sample data from invented students.
   A class of 30 (10 panels) against the mock backend: Panel 3 (Ploy, Nam, Fern) and a Solo player (Bee) use phones,
   the other 27 are scripted through the same backend.
   Serve the repo first:  (cd /home/claude/ss && python3 -m http.server 8765)
   Run:  OUT=/tmp/ss-shots NOTES=private/Notes.gs NODE_PATH=/home/claude/.npm-global/lib/node_modules node tests/shots.js
   Phones 390×844 at deviceScaleFactor 2, board 1920×1080. Writes <OUT>/INDEX.md.
   Never in a shot (spec §12): the red-flag file (tier 'redflag' in NOTES) with a 🚩 on it, open in a phone reader, named in
   a reason or nominated; its trigger sentences; tiers. The Designer's notes tab is shot closed. Every shot is guarded. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const { chromium } = require('playwright');
const { make } = require('./mock-gas');
const ROOT = path.join(__dirname, '..');
const BASE = 'http://127.0.0.1:8765/', EXEC = 'https://script.google.com/macros/s/TEST/exec';
const OUT = path.resolve(process.env.OUT || '/tmp/ss-shots');
const NOTES = path.resolve(ROOT, process.env.NOTES || 'private/Notes.gs');
if (!fs.existsSync(NOTES)) { console.error('No Notes.gs at ' + NOTES); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const gas = make(NOTES);
const post = b => JSON.parse(gas.handle('POST', EXEC, JSON.stringify(b)));
const get = q => JSON.parse(gas.handle('GET', EXEC + '?' + q));
const state = () => JSON.parse(gas.props.state || '{}');
const ep = () => state().epoch;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const errors = [], problems = [], index = [];

/* content and key */
const sb = { window: {} }; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', 'content.js'), 'utf8'), sb);
const SL = sb.window.SL, IDS = SL.files.map(f => f.id), BYID = Object.fromEntries(SL.files.map(f => [f.id, f]));
const unitsOf = fid => BYID[fid].statement.map(u => u.id).concat(BYID[fid].activities.map(u => u.id));
const textOf = u => { const f = BYID[u.slice(0, 3)]; return f.statement.concat(f.activities).find(x => x.id === u).text; };
const nb = {}; vm.createContext(nb); vm.runInContext(fs.readFileSync(NOTES, 'utf8') + '\nthis.__N = NOTES;', nb);
const KEY = nb.__N;
const RF = Object.keys(KEY.files).find(k => KEY.files[k].tier === 'redflag'), RFNAME = BYID[RF].name;
const TRIG_TEXT = (KEY.files[RF].triggers || []).map(textOf);
const CL = fid => Object.entries(KEY.files[fid].units || {}).filter(([, v]) => v.label === 'cliche').map(([u]) => u);
const EV = fid => Object.entries(KEY.files[fid].units || {}).filter(([, v]) => v.label === 'evidence').map(([u]) => u);
const EYEF = IDS.find(k => k !== RF && CL(k).length >= 2) || IDS.find(k => k !== RF);
const TIER = id => KEY.files[id].tier, LOW = n => IDS.find(k => KEY.files[k].lowRank === n);

/* invented class: no name shared with an applicant */
const APPL = new Set(SL.files.map(f => f.name.toLowerCase()));
const POOL = ['Mind', 'June', 'Bam', 'Fah', 'Mew', 'Prang', 'Jane', 'Ice', 'Kwan', 'Nook', 'Benz', 'Aom', 'Eye', 'Gift', 'Earn', 'Ning', 'Pear', 'Tarn', 'Bow', 'Muk', 'Oil', 'Pang', 'First', 'Sai', 'Pan', 'Cream', 'Fon', 'Bua', 'Kaimuk', 'Nim']
  .filter(n => !APPL.has(n.toLowerCase()));
const PHONES = ['Ploy', 'Nam', 'Fern'].filter(n => !APPL.has(n.toLowerCase()));
const SCRIPTED = POOL.slice(0, 27), panelOf = {};
SCRIPTED.forEach((n, i) => { let p = Math.floor(i / 3) + 1; if (p >= 3) p++; panelOf[n] = String(p); });
PHONES.forEach(n => panelOf[n] = '3');
const members = p => Object.keys(panelOf).filter(n => panelOf[n] === String(p));

/* rankings: strong files high, weaker files low, the red flag mid-table (never a panel's top 3) */
const BASEV = {}; IDS.forEach((id, i) => BASEV[id] = TIER(id) === 'strong' ? 7.2 + (i % 3) * 0.3 : TIER(id) === 'redflag' ? 6.4 : 4.2 + (i % 3) * 0.4);
const rankFrom = v => IDS.slice().sort((a, b) => v[b] - v[a]);
const noisy = sd => Object.fromEntries(IDS.map(id => [id, BASEV[id] + (rnd() - .5) * 2 * sd]));
const keepRfOut = (o, at) => { o = o.slice(); const i = o.indexOf(RF); if (i > -1 && i < at) { o.splice(i, 1); o.splice(at, 0, RF); } return o; };
/* marks: clichés caught by some, evidence marks, concerns only on files that are not the red flag */
function marksFor(opened){
  const marks = {}, concerns = {}, care = rnd();
  opened.forEach(fid => unitsOf(fid).forEach(u => {
    const x = rnd(), kl = (KEY.files[fid].units || {})[u];
    if (kl && kl.label === 'cliche' && x < 0.25 + care * 0.6) marks[u] = 'c';
    else if (kl && kl.label === 'evidence' && x < 0.45) marks[u] = 'e';
    else if (fid === RF) { if (x < 0.12) marks[u] = 'e'; }
    else if (TIER(fid) === 'low' && x < 0.10) { marks[u] = 'f'; concerns[u] = x < 0.05 ? 8 : 4; }
    else if (x < 0.07) marks[u] = 'c';
    else if (x < 0.18) marks[u] = 'e';
  }));
  return { marks, concerns };
}
const REASON = id => `${BYID[id].name}'s file gives one dated moment and a number we can check, and the programme paragraph names a real feature of the scholarship.`;

/* ---------- guards (run before every shot) ---------- */
function dataGuard(where){
  const bad = [];
  for (const [k, v] of Object.entries(gas.props)) {
    if (k.startsWith('I:')) { const r = JSON.parse(v); for (const u in r.marks || {}) if (u.startsWith(RF + '-') && r.marks[u] === 'f') bad.push(k + ' 🚩 ' + u); }
    if (k.startsWith('P:')) { const r = JSON.parse(v); if (r.order.slice(0, 3).includes(RF)) bad.push(k + ' nominates the red flag');
      for (const t of Object.values(r.reasons || {})) if (new RegExp('\\b' + RFNAME + '\\b|' + RF, 'i').test(t)) bad.push(k + ' reason names the red flag'); }
  }
  const d = state().decision; if (d && d.offers.includes(RF)) bad.push('decision offers the red flag');
  bad.forEach(b => problems.push(where + ': ' + b));
}
async function pageGuard(p, where, phoneSide){
  const r = await p.evaluate(({ RF, TRIG, phoneSide }) => {
    const t = document.body.innerText, out = [];
    TRIG.forEach(s => { if (t.includes(s)) out.push('trigger sentence on screen'); });
    if (/RED FLAG(?!S)|redflag|Strong, close call|STRONG, CLOSE CALL|\bWeaker\b|\bWEAKER\b/.test(t)) out.push('tier or red-flag wording on screen');
    if (document.querySelector('.ntable, .fc')) out.push('designer’s notes open');
    if (phoneSide && window.S) {
      if (S.at === RF) out.push('red-flag file open in the reader');
      for (const u in (S.marks || {})) if (u.indexOf(RF + '-') === 0 && S.marks[u] === 'f') out.push('🚩 on the red-flag file (phone)');
    }
    return out;
  }, { RF, TRIG: TRIG_TEXT, phoneSide });
  r.forEach(x => problems.push(where + ': ' + x));
}
async function shot(p, file, what, opts){
  opts = opts || {};
  dataGuard(file); await pageGuard(p, file, !!opts.phone);
  if (opts.atText) await p.evaluate(t => { const el = [...document.querySelectorAll('.lab, h2, summary')].find(e => e.offsetParent && e.textContent.includes(t)); if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 64)); }, opts.atText);
  else if (opts.at) await p.evaluate(sel => { const el = document.querySelector(sel); if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - 64)); }, opts.at);
  else if (!opts.keepScroll) await p.evaluate(() => window.scrollTo(0, 0));
  await sleep(opts.wait || 250);
  await p.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.classList.remove('show'); });
  await sleep(120);
  await p.screenshot({ path: path.join(OUT, file + '.png') });
  index.push([file + '.png', (opts.phone ? 'Phone · ' : 'Board · ') + what]);
}

/* ---------- harness ---------- */
async function ctxFor(browser, opts){
  const ctx = await browser.newContext(opts);
  await ctx.route('**/config.js*', r => r.fulfill({ contentType: 'application/javascript', body: `window.API_URL='${EXEC}';window.APP_URL='https://pegasus028.github.io/StatementShortlist/';` }));
  await ctx.route(EXEC + '**', async r => { const q = r.request(); r.fulfill({ contentType: 'application/json', body: gas.handle(q.method(), q.url(), q.postData()) }); });
  await ctx.addInitScript(() => { HTMLMediaElement.prototype.play = function(){ return new Promise(() => {}); }; try { speechSynthesis.speak = () => {}; } catch (e) {} });
  return ctx;
}
function watch(p, name){
  p.on('pageerror', e => errors.push(name + ': ' + e.message));
  p.on('dialog', d => { errors.push(name + ' dialog: ' + d.message()); d.accept(); });
}
async function phone(browser, name){
  const ctx = await ctxFor(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, colorScheme: 'light' });
  const p = await ctx.newPage(); watch(p, name); await p.goto(BASE + 'index.html'); return p;
}
async function mark(p, unit, v, reason){
  await p.click('[data-u="' + unit + '"]'); await p.click('[data-mk="' + v + '"]');
  if (v === 'f') await p.click('[data-rz="' + (reason == null ? 0 : reason) + '"]');
}

(async () => {
  const browser = await chromium.launch();
  const bctx = await ctxFor(browser, { viewport: { width: 1920, height: 1080 } });
  const board = await bctx.newPage(); watch(board, 'board');
  await board.goto(BASE + 'board.html'); await sleep(600);
  const refresh = async () => { await board.evaluate(() => poll()); await sleep(350); };
  const tab = async v => { await board.click('[data-v="' + v + '"]'); await sleep(250); };
  const bshot = (f, w, o) => shot(board, f, w, Object.assign({ keepScroll: true }, o || {}));

  /* ---------- join ---------- */
  SCRIPTED.slice(0, 20).forEach(n => post({ action: 'register', name: n, panel: panelOf[n] }));
  const ph = {}; for (const n of PHONES) ph[n] = await phone(browser, n);
  const [Pl, Na, Fe] = PHONES.map(n => ph[n]);
  const pollAll = async () => { for (const p of Object.values(ph)) await p.evaluate(() => poll()); await sleep(600); };
  await Pl.fill('#jName', 'Ploy'); await Pl.selectOption('#jPanel', '3');
  await shot(Pl, 'p01-join', 'Join: nickname and panel, or Solo practice', { phone: true });
  for (const n of PHONES) { const p = ph[n]; if (n !== 'Ploy') { await p.fill('#jName', n); await p.selectOption('#jPanel', '3'); } await p.click('#jGo'); }
  await sleep(900);
  SCRIPTED.slice(20).forEach(n => post({ action: 'register', name: n, panel: panelOf[n] }));
  await shot(Pl, 'p02-lobby', 'Lobby: joined, waiting for the teacher; briefing starts (purposes)', { phone: true });
  await shot(Pl, 'p03-briefing-programme', 'Briefing: the programme brief and its three features', { phone: true, atText: 'The programme' });
  await shot(Pl, 'p04-briefing-marks', 'Briefing: the three marks and what a strong file shows', { phone: true, at: '.mchip' });
  await refresh(); await bshot('b01-joined-lobby', 'Joined (lobby): 30 students by panel');

  /* ---------- Preview (homework) ---------- */
  await board.click('#pvBtn'); await sleep(400); await pollAll();
  SCRIPTED.slice(0, 12).forEach(n => { const op = IDS.filter(id => id !== RF).slice(0, 3 + Math.floor(rnd() * 4)).concat(rnd() < .5 ? [RF] : []); const m = marksFor(op);
    post({ action: 'individual', name: n, panel: panelOf[n], order: null, opened: op, marks: m.marks, concerns: m.concerns, epoch: ep() }); });
  await shot(Pl, 'p05-preview-list', 'Preview (homework): file list, ranking locked', { phone: true });
  await Pl.evaluate(id => openFile(id), EYEF);
  await mark(Pl, EV(EYEF)[0] || unitsOf(EYEF)[1], 'e'); await mark(Pl, CL(EYEF)[0], 'c');
  await shot(Pl, 'p06-preview-reader', 'Preview reader: portrait, programme strip, statement with ✓ and ✗ marks', { phone: true });
  await Pl.click('[data-u="' + (EV(EYEF)[1] || unitsOf(EYEF)[2]) + '"]'); await sleep(150);
  await shot(Pl, 'p07-reader-mark-toggles', 'Reader: tap a sentence, three mark toggles', { phone: true, at: '.mk' });
  await Pl.click('[data-mk="e"]');
  await Pl.click('[data-u="' + unitsOf(EYEF).filter(u => !(KEY.files[EYEF].units || {})[u]).slice(-1)[0] + '"]'); await Pl.click('[data-mk="f"]'); await sleep(150);
  await shot(Pl, 'p08-reader-concern-reasons', 'Reader: 🚩 Concern asks for one of nine reasons', { phone: true, at: '.mk' });
  await Pl.click('[data-rz="5"]');
  await shot(Pl, 'p09-reader-activity-list', 'Reader: the activity list and "Ranking opens in class"', { phone: true, at: '.acts' });
  await Pl.click('#back'); await sleep(300);
  await refresh(); await bshot('b02-joined-preview', 'Joined (Preview): who has opened files, marks so far');

  /* ---------- Round 1 ---------- */
  await board.fill('#mins', '15'); await board.click('#r1Btn'); await sleep(400); await pollAll();
  // phones read every file except the red flag in the reader (opened is recorded so marks count)
  for (const p of [Pl, Na, Fe]) await p.evaluate(rf => { FILES.forEach(f => { if (f.id !== rf && !S.opened.includes(f.id)) S.opened.push(f.id); }); if (!S.opened.includes(rf)) S.opened.push(rf); save(); render(); }, RF);
  await shot(Pl, 'p10-r1-list', 'Round 1: file list with Read / marks / rank, Send in the dock', { phone: true });
  await Pl.evaluate(id => openFile(id), LOW(1)); await mark(Pl, unitsOf(LOW(1))[0], 'c'); await mark(Pl, unitsOf(LOW(1))[2], 'f', 8);
  await Pl.selectOption('#rankSel', '9');
  await shot(Pl, 'p11-r1-reader-myrank', 'Round 1 reader: My rank picker (1–10 with Scholarship / Place / Bottom 3)', { phone: true, at: '.toolrow' });
  const setOrder = async (p, o) => p.evaluate(o => { S.r1.order = o; S.r1.moved = 2; save(); tab = 'rank'; S.at = null; render(); }, o);
  const ploy = keepRfOut(rankFrom(noisy(0.6)), 5), nam = keepRfOut(rankFrom(noisy(0.8)), 4), fern = keepRfOut(rankFrom(noisy(0.8)), 6);
  await setOrder(Pl, ploy);
  await shot(Pl, 'p12-r1-ranking', 'Round 1: My ranking with ▲ ▼, points and the place lines', { phone: true });
  await Pl.click('#send'); await sleep(500);
  await shot(Pl, 'p13-r1-sent', 'Round 1: ranking sent, can still change until time is up', { phone: true });
  // Nam: finds one cliché, one false ✗, misses one (a number); Fern: evidence only ("—")
  await Na.evaluate(id => openFile(id), EYEF); await mark(Na, CL(EYEF)[0], 'c'); await mark(Na, unitsOf(EYEF)[0], 'c'); await mark(Na, EV(EYEF)[0] || unitsOf(EYEF)[1], 'e');
  await setOrder(Na, nam); await Na.click('#send'); await sleep(300);
  await Fe.evaluate(id => openFile(id), EYEF); await mark(Fe, EV(EYEF)[0] || unitsOf(EYEF)[1], 'e'); await mark(Fe, EV(EYEF)[1] || unitsOf(EYEF)[2], 'e');
  await setOrder(Fe, fern); await Fe.click('#send'); await sleep(300);
  const indOrder = {};
  SCRIPTED.forEach((n, i) => {
    const op = i % 7 === 3 ? IDS.slice(0, 7) : IDS.slice(), m = marksFor(op);
    indOrder[n] = rankFrom(noisy(1.3));
    if (n === SCRIPTED[26]) return;   // one student never sends: auto-sent below
    post({ action: 'individual', name: n, panel: panelOf[n], order: indOrder[n], opened: op, marks: m.marks, concerns: m.concerns, epoch: ep() });
  });
  await refresh(); await bshot('b03-joined-r1', 'Joined (Round 1): rankings arriving, clock running');
  await board.click('#stopBtn'); await sleep(300);
  { const n = SCRIPTED[26], m = marksFor(IDS); post({ action: 'individual', name: n, panel: panelOf[n], order: indOrder[n], opened: IDS, marks: m.marks, concerns: m.concerns, auto: true, epoch: ep() }); }
  await pollAll();
  await shot(Fe, 'p14-r1-time-up', 'Round 1 over: ranking in, own ranking listed', { phone: true });

  /* ---------- Round 2 ---------- */
  await board.fill('#mins', '12'); await board.click('#r2Btn'); await sleep(400); await pollAll();
  for (const p of [Pl, Na, Fe]) await p.evaluate(() => loadPanel()); await sleep(500);
  for (const n of PHONES) for (const m of PHONES.filter(x => x !== n)) await ph[n].check('[data-mate="' + m + '"]');
  await sleep(300);
  await shot(Na, 'p15-r2-mates-compare', 'Round 2: tick panel members, ranking comparison (biggest split first)', { phone: true });
  await shot(Na, 'p16-r2-compare-table', 'Round 2: the comparison table with points and 🚩 counts', { phone: true, at: '.tbl' });
  await Na.click('[data-mvf="' + EYEF + '"]'); await sleep(200);
  await shot(Na, 'p17-r2-marks-view', 'Round 2: Marks view — sentences where the panel’s marks differ', { phone: true, at: '.mvrow' });
  await Pl.click('#claim'); await sleep(500);
  await Na.evaluate(() => loadPanel()); await sleep(400);
  await shot(Na, 'p18-r2-head-claimed', 'Round 2: a member sees who is head of panel', { phone: true, atText: 'Head of panel' });
  await Pl.waitForSelector('#pform');
  await Pl.evaluate(rf => { const o = S.pform.order, i = o.indexOf(rf); if (i > -1 && i < 4) { o.splice(i, 1); o.splice(4, 0, rf); } save(); render(); }, RF);
  await shot(Pl, 'p19-r2-head-ranking', 'Round 2 head form: panel ranking from combined points', { phone: true, at: '#pform' });
  const top = await Pl.evaluate(() => S.pform.order.slice(0, 3));
  for (const [k, i] of [['s', 0], ['o2', 1], ['o3', 2]]) await Pl.fill('[data-reason="' + k + '"]', REASON(top[i]));
  await Pl.click('[data-attopen="s"]'); await sleep(150);
  await shot(Pl, 'p20-r2-attach-picker', 'Round 2 head form: reason with the 15-word counter, attach a sentence', { phone: true, at: '[data-reason="s"]' });
  await Pl.click('.attpick >> nth=1');
  for (const k of ['o2', 'o3']) { await Pl.click('[data-attopen="' + k + '"]'); await Pl.click('.attpick >> nth=1'); }
  await shot(Pl, 'p21-r2-reasons-attached', 'Round 2 head form: reasons with attached sentences', { phone: true, at: '[data-reason="o2"]' });
  const bottom = await Pl.evaluate(() => S.pform.order.slice(7));
  const RECS = [['r1', 'r4'], ['r7', 'r9'], ['r10', 'r6']];
  for (let i = 0; i < 3; i++) for (const r of RECS[i]) await Pl.click('[data-rec="' + bottom[i] + '|' + r + '"]');
  await shot(Pl, 'p22-r2-advice', 'Round 2 head form: two pieces of advice for each of the bottom 3', { phone: true, at: '[data-rec]' });
  await Pl.click('#psend'); await sleep(600);
  await Fe.evaluate(() => loadPanel()); await sleep(400);
  await shot(Fe, 'p23-r2-submitted', 'Round 2: members see the nominations with the attached sentence', { phone: true, at: '.nomcard' });
  // the other nine panels
  for (const p of [1, 2, 4, 5, 6, 7, 8, 9, 10]) {
    const ms = members(p), head = ms[0], sum = {};
    IDS.forEach(id => sum[id] = 0); ms.forEach(n => indOrder[n].forEach((id, i) => sum[id] += 10 - i));
    const order = keepRfOut(IDS.slice().sort((a, b) => sum[b] - sum[a]), 3 + (p % 3));
    post({ action: 'claimHead', name: head, panel: String(p), epoch: ep() });
    const reasons = {}, attach = {}; ['s', 'o2', 'o3'].forEach((k, i) => { reasons[k] = REASON(order[i]); attach[k] = (EV(order[i])[i % 2] || unitsOf(order[i])[1]); });
    const recs = {}; order.slice(7).forEach((id, i) => recs[id] = RECS[(i + p) % 3]);
    const auto = p === 9;
    post({ action: 'panel', panel: String(p), head, members: ms, order, reasons: auto ? { s: '', o2: '', o3: '' } : reasons, attach: auto ? {} : attach, recs, auto, epoch: ep() });
  }
  await refresh(); await bshot('b04-joined-r2', 'Joined (Round 2): heads ★ and panel nominations in');
  await board.click('#stopBtn'); await sleep(300);

  /* ---------- Round 3 (before Reveal) ---------- */
  await board.fill('#mins', '10'); await board.click('#r3Btn'); await sleep(600); await refresh();
  await pollAll(); await sleep(500);
  await shot(Na, 'p24-r3-cliche-eye', 'Round 3: her own Cliché eye score (missed sentences wait for the reveal)', { phone: true, at: '.eye' });
  await shot(Fe, 'p25-r3-cliche-eye-none', 'Round 3: Cliché eye "—" when she made no ✗ marks', { phone: true, at: '.eye' });
  await shot(Pl, 'p26-r3-committee', 'Round 3: look at the board; the class leaderboard', { phone: true, at: '.lb' });
  await tab('lb'); await board.click('[data-lb="panel"]'); await bshot('b10-leaderboard-panel', 'Leaderboard by panel points');
  await board.click('[data-lb="ind"]'); await bshot('b11-leaderboard-r1', 'Leaderboard by Round 1 points');
  await tab('mx'); await bshot('b12-nominations', 'Nominations: each panel’s rank per applicant');
  await tab('agr'); await bshot('b13-agreement', 'Agreement: Agree / Mixed / Split per applicant');
  await tab('apps'); await bshot('b14-applicants', 'Applicants grid and the programme brief');
  await board.click('[data-c="' + EYEF + '"]'); await sleep(300); await bshot('b15-applicant-file', 'Applicant window: the file, Round 1 ranks, panel reasons with attached sentences');
  await board.click('#closeModal');
  await tab('mt'); await board.click('[data-mtf="' + EYEF + '"]'); await sleep(200); await bshot('b16-marked-text', 'Marked text: heatmap of the class’s ✓ ✗ 🚩 marks on one file');
  await tab('rf'); await bshot('b17-red-flags', 'Red flags: who marked a 🚩 concern in which file');
  await tab('own'); await bshot('b18-own-field', 'Own field: each panel’s rank for its own profession vs the other panels');
  await tab('eye'); await bshot('b19-cliche-eye', 'Cliché eye: class distribution (no names)');
  await board.click('#eyeTop'); await bshot('b20-cliche-eye-top5', 'Cliché eye: optional top five (teacher’s choice)');
  await board.click('#eyeTop');
  await tab('notes'); await bshot('b21-designers-notes-closed', 'Designer’s notes: closed, Reveal button');
  // decision: three non-red-flag files by panel points; scholar = the 1st
  const pts = {}; IDS.forEach(id => pts[id] = 0); get('action=board').panels.forEach(p => p.order.forEach((id, i) => pts[id] += 10 - i));
  const offers = IDS.filter(id => id !== RF).sort((a, b) => pts[b] - pts[a]).slice(0, 3);
  await tab('dec'); for (const id of offers) await board.click('[data-pick="' + id + '"]');
  await board.click('[data-pick="' + offers[0] + '"]'); await sleep(150);
  await bshot('b22-decision', 'Decision: the committee picks three places and the scholarship');
  await board.click('#announce'); await sleep(1800); await bshot('b23-podium', 'Announce: podium with confetti');
  await board.click('#closePodium');
  await pollAll(); await sleep(500);
  await shot(Pl, 'p27-r3-decision', 'Round 3: the committee’s decision on the phone', { phone: true, at: '.nomcard' });

  /* ---------- Reveal (posted directly: the notes tab is never shot open) ---------- */
  await tab('mt'); post({ action: 'notes', on: true }); await refresh();
  await board.click('[data-mtf="' + EYEF + '"]'); await sleep(200);
  await bshot('b30-marked-text-key', 'Marked text after Reveal: the designer’s cliché/evidence key outlined (a strong file)');
  await tab('eye'); await bshot('b31-cliche-eye-revealed', 'Cliché eye after Reveal: most-missed clichés');
  await pollAll(); await sleep(600);
  await shot(Na, 'p28-r3-missed', 'After Reveal: the clichés she did not mark', { phone: true, at: '.eye' });

  /* ---------- Fix-it in class ---------- */
  await board.fill('#mins', '5'); await board.click('#fixBtn'); await sleep(600);
  await pollAll(); await sleep(800);
  await Pl.waitForSelector('[data-tgt]:not([disabled])');
  await shot(Pl, 'p29-fix-targets', 'Fix-it (head): choose a paragraph or an activity line of the panel’s weak file', { phone: true });
  await Pl.click('[data-tgt="p1"]'); await Pl.fill('#fixText', 'I have always had a passion for numbers and I want to make a difference.');
  await shot(Pl, 'p30-fix-checks', 'Fix-it: live checks (cliché named, detail missing), paste blocked', { phone: true, at: '#fixBox' });
  await Pl.fill('#fixText', 'In March 2025 I kept the accounts for my aunt’s noodle stall at Talad Noi for 8 weeks and cut waste by 15 per cent.');
  await shot(Pl, 'p31-fix-checks-ok', 'Fix-it: every check ticked', { phone: true, at: '#fixBox' });
  await Pl.click('#fixSend'); await sleep(600);
  await Na.evaluate(() => loadBoard()); await sleep(500);
  await shot(Na, 'p32-fix-member', 'Fix-it in class: a member sees the head’s sent version and its checks', { phone: true, at: '.attq' });
  const FIXES = [['1', 'p2', 'Last May I helped at the Bang Sue market stall for 6 Saturdays and counted every sale in a notebook.'],
    ['2', 'a1', 'Organised 3 maths clinics for 45 Grade 7 pupils, resulting in a weekly club that the school still runs.'],
    ['4', 'p1', 'I have a dream to help people and to make a difference in the world.'],
    ['6', 'a2', 'Led 2 beach clean-ups at Bang Saen with 30 classmates, which removed 80 kilograms of plastic in one day.']];
  for (const [p, tg, t] of FIXES) { const head = members(p)[0], fid = get('action=fixFor&name=' + head + '&panel=' + p).fileId; post({ action: 'fix', name: head, panel: p, fileId: fid, target: tg, text: t, epoch: ep() }); }
  await refresh(); await bshot('b40-fixit-gallery', 'Fix-it gallery: each rewrite beside the original, with ticks');
  await board.click('[data-proj="0"]'); await sleep(300); await bshot('b41-fixit-project', 'Fix-it: one rewrite projected large');
  await board.keyboard.press('Escape');

  /* ---------- Fix-it as homework ---------- */
  await board.check('#fixHw'); await board.fill('#mins', '0'); await board.click('#fixBtn'); await sleep(600);
  await pollAll(); await sleep(800);
  await Na.waitForSelector('[data-tgt]:not([disabled])');
  await Na.click('[data-tgt="a2"]'); await Na.fill('#fixText', 'Tracked 45 invoices for the school fair, resulting in a cash record the club still uses.');
  await Na.click('#fixSend'); await sleep(500);
  await shot(Na, 'p33-fix-homework', 'Fix-it as homework: every student sends her own', { phone: true, at: '#fixBox' });
  for (const n of [members(1)[1], members(2)[2]]) { const p = panelOf[n], fid = get('action=fixFor&name=' + n + '&panel=' + p).fileId;
    post({ action: 'fix', name: n, panel: p, fileId: fid, target: 'p2', text: 'In June 2025 I sorted 120 receipts at my uncle’s shop in Bang Rak and found 9 mistakes.', epoch: ep() }); }
  await refresh(); await bshot('b42-fixit-homework', 'Fix-it gallery (homework): one rewrite per student');

  /* ---------- Solo practice and help ---------- */
  const So = await phone(browser, 'Bee');
  await So.fill('#jName', 'Bee'); await So.click('#jSolo'); await sleep(300);
  await So.evaluate(id => openFile(id), EYEF); await mark(So, CL(EYEF)[0], 'c'); await So.selectOption('#rankSel', '2');
  await shot(So, 'p34-solo-reader', 'Solo practice: read, mark and rank; nothing is sent', { phone: true });
  await So.click('[data-tab="fix"]'); await sleep(800);
  await shot(So, 'p35-solo-fix', 'Solo practice: Fix-it with her own weak file', { phone: true });
  await So.click('#helpBtn'); await sleep(200); await So.click('.sheet details >> nth=0'); await sleep(150);
  await shot(So, 'p36-help', 'Help: criteria, the three marks, concern reasons, the cliché list with replacements', { phone: true, keepScroll: true });
  await So.evaluate(() => { const b = document.querySelector('#sheetBox'); const d = document.querySelectorAll('.sheet details'); d[0].open = false; d[1].open = true; d[1].scrollIntoView(); });
  await shot(So, 'p37-help-formula', 'Help: the activity-line formula and the verb bank', { phone: true, keepScroll: true });

  await browser.close();
  const md = ['# The Statement Shortlist — screenshots', '', '**Sample data from invented students.** Phones 390×844 at 2×, board 1920×1080. ' +
    'Generated by `tests/shots.js` against the mock backend (`NOTES=' + path.relative(ROOT, NOTES) + '`). No shot shows the red-flag file with a 🚩, open in a reader or named in a reason; the Designer’s notes tab is shot closed.', '',
    '| File | What it shows |', '|---|---|'].concat(index.map(([f, w]) => '| `' + f + '` | ' + w + ' |')).join('\n') + '\n';
  fs.writeFileSync(path.join(OUT, 'INDEX.md'), md);
  const all = problems.concat(errors.map(e => 'page error: ' + e));
  all.forEach(p => console.log('FAIL ' + p));
  console.log((all.length ? 'FAILED · ' : 'PASS · ') + index.length + ' shots in ' + OUT + (all.length ? ' · ' + all.length + ' problems' : ' · red-flag guard clean, no page errors'));
  process.exit(all.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
