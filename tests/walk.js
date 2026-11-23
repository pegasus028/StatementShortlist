/* The Statement Shortlist — full class walk: teacher board + 6 phones in two panels (P3, P5) + one Solo phone,
   against the mock backend (tests/mock-gas.js runs apps-script/Code.gs with a Notes.gs).
   Serve the repo first:  (cd /home/claude/ss && python3 -m http.server 8765)
   Run:  NOTES=private/Notes.gs NODE_PATH=/home/claude/.npm-global/lib/node_modules node tests/walk.js
   Students are invented. Prints PASS/FAIL lines and a count; exits 1 on any failure. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const { chromium } = require('playwright');
const { make } = require('./mock-gas');
const ROOT = path.join(__dirname, '..');
const BASE = 'http://127.0.0.1:8765/', EXEC = 'https://script.google.com/macros/s/TEST/exec';
const NOTES = path.resolve(ROOT, process.env.NOTES || 'private/Notes.gs');
if (!fs.existsSync(NOTES)) { console.error('No Notes.gs at ' + NOTES); process.exit(2); }
const gas = make(NOTES);
const post = b => JSON.parse(gas.handle('POST', EXEC, JSON.stringify(b)));
const get = q => JSON.parse(gas.handle('GET', EXEC + '?' + q));
const rec = n => JSON.parse(gas.props['I:' + n.toLowerCase()] || 'null');
const prop = k => JSON.parse(gas.props[k] || 'null');
const state = () => JSON.parse(gas.props.state || '{}');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let fails = 0, passes = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (ok) passes++; else fails++; };

/* content and key, read the same way the pages and the server do */
const sb = { window: {} }; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', 'content.js'), 'utf8'), sb);
const SL = sb.window.SL, BYID = Object.fromEntries(SL.files.map(f => [f.id, f])), U = SL.ui.student;
const unitsOf = fid => BYID[fid].statement.map(u => u.id).concat(BYID[fid].activities.map(u => u.id));
const nb = {}; vm.createContext(nb); vm.runInContext(fs.readFileSync(NOTES, 'utf8') + '\nthis.__N = NOTES;', nb);
const KEY = nb.__N;
const RF = Object.keys(KEY.files).find(k => KEY.files[k].tier === 'redflag');
const TRIG = KEY.files[RF].triggers;
const CL = fid => Object.entries(KEY.files[fid].units || {}).filter(([, v]) => v.label === 'cliche').map(([u]) => u);
/* a file with at least two keyed clichés (for the Cliché eye) */
const EYEF = Object.keys(KEY.files).find(k => CL(k).length >= 2);
const LOW = n => Object.keys(KEY.files).find(k => KEY.files[k].lowRank === n);
const CORE = require(path.join(ROOT, 'js', 'core.js'));

/* ---------- harness ---------- */
const soloPosts = [];
async function ctxFor(browser, opts, tagName){
  const ctx = await browser.newContext(opts);
  await ctx.route('**/config.js*', r => r.fulfill({ contentType: 'application/javascript', body: `window.API_URL='${EXEC}';window.APP_URL='https://pegasus028.github.io/StatementShortlist/';` }));
  await ctx.route(EXEC + '**', async r => {
    const q = r.request();
    if (tagName === 'solo' && q.method() === 'POST') soloPosts.push(q.postData());
    r.fulfill({ contentType: 'application/json', body: gas.handle(q.method(), q.url(), q.postData()) });
  });
  await ctx.addInitScript(() => { try { speechSynthesis.speak = () => {}; } catch (e) {} HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); }; });
  return ctx;
}
function watch(p, name){
  p.on('pageerror', e => errors.push(name + ': ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|fonts\.g/.test(m.text())) errors.push(name + ' console: ' + m.text()); });
  p.on('dialog', d => { errors.push(name + ' dialog: ' + d.message()); d.accept(); });
}
async function phone(browser, name, tagName){
  const ctx = await ctxFor(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }, tagName);
  const p = await ctx.newPage(); watch(p, name);
  await p.goto(BASE + 'index.html'); return p;
}
/* 390 px: page width and every visible control inside the screen (the comparison table scrolls inside .tscroll) */
async function overflow(p, label){
  const r = await p.evaluate(() => {
    const w = document.documentElement.scrollWidth;
    const bad = [...document.querySelectorAll('button,input,select,textarea,a,[role=button],[data-u]')].filter(el => {
      if (el.closest('.tscroll') || el.closest('.sheet:not(.show)')) return false;
      const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.right > 390.5;
    }).map(el => (el.id || el.getAttribute('data-u') || el.className || el.tagName) + ':' + Math.round(el.getBoundingClientRect().right));
    return { w, bad };
  });
  check(r.w <= 390 && !r.bad.length, `390 px · ${label}: no horizontal overflow (scrollWidth ${r.w}${r.bad.length ? '; past 390: ' + r.bad.slice(0, 5).join(', ') : ''})`);
}
const text = p => p.textContent('main');
const toastText = p => p.textContent('#toast');
async function mark(p, unit, v, reason){
  await p.click('[data-u="' + unit + '"]'); await p.click('[data-mk="' + v + '"]');
  if (v === 'f') await p.click('[data-rz="' + (reason == null ? 0 : reason) + '"]');
}
async function rankAt(p, fid, k){ await p.evaluate(id => openFile(id), fid); await p.selectOption('#rankSel', String(k)); }
async function sendRanking(p){
  await p.click('[data-tab="rank"]');
  for (let i = 0; i < 3; i++) { if (await p.evaluate(() => S.r1 && S.r1.queued)) break; await p.click('#send'); await sleep(150); }
  await sleep(300);
}

(async () => {
  console.log('Notes: ' + path.relative(ROOT, NOTES) + ' (red-flag, low and cliché files read from the key at runtime; ids not printed)');
  const browser = await chromium.launch();

  /* ---------- board ---------- */
  const bctx = await ctxFor(browser, { viewport: { width: 1920, height: 1080 } }, 'board');
  const board = await bctx.newPage(); watch(board, 'board');
  await board.goto(BASE + 'board.html'); await sleep(700);
  const refresh = async () => { await board.evaluate(() => poll()); await sleep(350); };
  const tab = async v => { await board.click('[data-v="' + v + '"]'); await sleep(200); };

  /* ---------- join ---------- */
  const P3 = ['Ploy', 'Nam', 'Fern'], P5 = ['Mind', 'June', 'Bam'], ph = {};
  for (const n of P3.concat(P5)) ph[n] = await phone(browser, n);
  const all = Object.values(ph);
  const pollAll = async (list) => { for (const p of (list || all)) await p.evaluate(() => poll()); await sleep(600); };
  await overflow(ph.Ploy, 'join');
  for (const n of P3.concat(P5)) { const p = ph[n]; await p.fill('#jName', n); await p.selectOption('#jPanel', P3.includes(n) ? '3' : '5'); await p.click('#jGo'); }
  await sleep(900);
  check(all.every(Boolean) && (await Promise.all(all.map(p => p.isVisible('#changeMe')))).every(Boolean), 'join: all six phones reach the lobby');
  check(P3.concat(P5).every(n => rec(n) && rec(n).panel === (P3.includes(n) ? '3' : '5')), 'join: six I: records with panels 3 and 5');
  await overflow(ph.Nam, 'lobby + briefing');
  await refresh();
  { const t = await text(board); check(P3.concat(P5).every(n => t.includes(n)), 'board Joined lists the six students'); }

  // Solo practice phone: reads, marks and ranks, sends nothing
  const So = await phone(browser, 'Solo', 'solo');
  await So.fill('#jName', 'Bee'); await So.click('#jSolo'); await sleep(300);
  check(await So.isVisible('[data-tab="fix"]') && (await So.textContent('#app')).includes('Solo practice'), 'solo: practice view with Files, My ranking and Fix-it tabs');
  await overflow(So, 'solo file list');
  await So.evaluate(id => openFile(id), EYEF); await mark(So, CL(EYEF)[0], 'c'); await So.selectOption('#rankSel', '2');
  await overflow(So, 'solo reader');
  await So.click('[data-tab="rank"]'); await So.click('[data-dn="0"]');
  await overflow(So, 'solo ranking');
  await So.click('#helpBtn'); await sleep(200);
  await So.click('.sheet details >> nth=0');
  await overflow(So, 'help sheet');
  await So.keyboard.press('Escape');

  /* ---------- Preview ---------- */
  await board.click('#pvBtn'); await sleep(400);
  check(state().phase === 'preview' && !state().running, 'board: Preview opens without a clock');
  await pollAll();
  const Pl = ph.Ploy, Na = ph.Nam, Fe = ph.Fern, Mi = ph.Mind, Ju = ph.June, Ba = ph.Bam;
  check(await Pl.isVisible('.ftile') && !(await Pl.$('[data-tab="rank"]')) && !(await Pl.$('#send')), 'Preview: file list, no ranking tab, no Send');
  await overflow(Pl, 'preview list');
  await Pl.evaluate(id => openFile(id), EYEF);
  check(!(await Pl.$('#rankSel')) && (await text(Pl)).includes(U.rankLocked), 'Preview reader: no My rank, "' + U.rankLocked + '"');
  await mark(Pl, CL(EYEF)[0], 'c'); await mark(Pl, unitsOf(EYEF)[1], 'e');
  await Pl.click('[data-u="' + unitsOf(EYEF)[2] + '"]'); await Pl.click('[data-mk="f"]');
  check(await Pl.isVisible('[data-rz="0"]'), 'Preview: 🚩 opens the reason picker');
  await overflow(Pl, 'reader with the concern reasons open');
  await Pl.click('[data-rz="5"]');
  await Pl.click('#back'); await sleep(400);
  const pv = rec('Ploy');
  check(pv && pv.order === null && pv.marks[CL(EYEF)[0]] === 'c' && pv.marks[unitsOf(EYEF)[2]] === 'f' && pv.concerns[unitsOf(EYEF)[2]] === 5 && pv.opened.includes(EYEF), 'Preview: marks saved on the server (order null, ✗, ✓, 🚩 with reason 5)');
  check(post({ action: 'individual', name: 'Ploy', panel: '3', order: SL.files.map(f => f.id), opened: [], marks: {}, epoch: state().epoch }).ok === false && rec('Ploy').order === null, 'Preview: a ranking is refused by the server (ranking locked)');
  const PVF = SL.files.map(f => f.id).find(id => id !== RF && id !== EYEF);
  await Na.evaluate(id => openFile(id), PVF); await mark(Na, unitsOf(PVF)[0], 'e'); await Na.click('#back'); await sleep(300);
  check(rec('Nam').opened.includes(PVF), 'Preview: Nam’s opened file saved');
  check(get('action=scores&name=Ploy').locked === true && get('action=scores&name=Ploy').score === null, 'GET scores in Preview: locked');

  /* ---------- Round 1 ---------- */
  await board.fill('#mins', '15'); await board.click('#r1Btn'); await sleep(400);
  check(state().phase === 'r1' && state().running, 'board: Round 1 running');
  await pollAll();
  check(await Pl.isVisible('[data-tab="rank"]') && await Pl.isVisible('#send'), 'R1: ranking tab and Send appear');
  await overflow(Pl, 'R1 file list');
  // Ploy: catches the red flag (🚩 + reason on a trigger), ranks it 10th
  await Pl.evaluate(id => openFile(id), RF); await mark(Pl, TRIG[0], 'f', 7);
  check(await Pl.isVisible('#rankSel') && await Pl.isVisible('#progStrip'), 'R1 reader: programme strip and My rank');
  await Pl.selectOption('#rankSel', '10');
  await overflow(Pl, 'R1 reader');
  await Pl.click('[data-tab="rank"]'); await Pl.click('[data-dn="0"]');
  await overflow(Pl, 'R1 ranking');
  await sendRanking(Pl);
  const r1p = rec('Ploy');
  check(r1p.order && r1p.order.length === 10 && r1p.order[9] === RF && r1p.marks[TRIG[0]] === 'f' && r1p.concerns[TRIG[0]] === 7 && r1p.auto === false, 'R1: Ploy sends ranking + 🚩 with reason');
  await overflow(Pl, 'R1 after Send');
  // Nam: one keyed cliché found, one false ✗, one keyed cliché missed -> a number
  await Na.evaluate(id => openFile(id), EYEF); await mark(Na, CL(EYEF)[0], 'c');
  const nonKey = unitsOf(EYEF).find(u => !(KEY.files[EYEF].units || {})[u]) || unitsOf(EYEF)[0];
  await mark(Na, nonKey, 'c'); await Na.selectOption('#rankSel', '1');
  await sendRanking(Na);
  check(rec('Nam').order && rec('Nam').marks[CL(EYEF)[0]] === 'c', 'R1: Nam sends ranking + ✗ marks');
  // Fern: evidence marks only -> "—"
  await Fe.evaluate(id => openFile(id), EYEF); await mark(Fe, unitsOf(EYEF)[1], 'e'); await Fe.selectOption('#rankSel', '2');
  await sendRanking(Fe);
  check(rec('Fern').order && !Object.values(rec('Fern').marks).includes('c'), 'R1: Fern sends ranking, no ✗ marks');
  // Mind: red flag in her top 3 without a flag; a ✗ in the cliché file
  await Mi.evaluate(id => openFile(id), EYEF); await mark(Mi, CL(EYEF)[1], 'c');
  await rankAt(Mi, RF, 1); await sendRanking(Mi);
  check(rec('Mind').order && rec('Mind').order[0] === RF, 'R1: Mind sends ranking (red flag 1st, no flag)');
  // June: red flag 8th–10th without a flag; a 🚩 elsewhere
  const other = SL.files.map(f => f.id).find(id => id !== RF && id !== EYEF);
  await Ju.evaluate(id => openFile(id), other); await mark(Ju, unitsOf(other)[0], 'f', 4);
  await rankAt(Ju, RF, 9); await sendRanking(Ju);
  check(rec('June').order && rec('June').order[8] === RF, 'R1: June sends ranking');
  // Bam: reads and marks, never presses Send
  await Ba.evaluate(id => openFile(id), EYEF); await mark(Ba, CL(EYEF)[1], 'c'); await Ba.selectOption('#rankSel', '3');
  check(!rec('Bam').order, 'R1: Bam has not sent');
  check(get('action=scores&name=Nam').locked === true, 'GET scores in Round 1: locked');
  await board.click('#stopBtn'); await sleep(300);
  await pollAll(); await sleep(500);
  const rb = rec('Bam');
  check(rb && rb.order && rb.order.length === 10 && rb.auto === true && rb.marks[CL(EYEF)[1]] === 'c', 'Stop: Bam’s ranking and marks auto-sent (auto: true)');
  check((await text(Ba)).includes('Time is up') || (await text(Ba)).includes('ranking is in'), 'Stop: Bam’s phone shows time up');
  await overflow(Ba, 'R1 time up');

  /* ---------- Round 2 ---------- */
  await board.fill('#mins', '12'); await board.click('#r2Btn'); await sleep(400);
  check(state().phase === 'r2', 'board: Round 2');
  await pollAll();
  for (const [grp] of [[P3], [P5]]) for (const n of grp) { const p = ph[n]; await p.evaluate(() => loadPanel()); }
  await sleep(500);
  for (const grp of [P3, P5]) for (const n of grp) { const p = ph[n]; for (const m of grp.filter(x => x !== n)) await p.check('[data-mate="' + m + '"]'); }
  await sleep(300);
  check(await Na.isVisible('.tbl'), 'R2: ranking comparison table');
  await Na.click('[data-mvf="' + EYEF + '"]'); await sleep(200);
  const mvRows = await Na.$$eval('.mvrow', els => els.length);
  const mvWant = CORE.marksView([rec('Nam'), rec('Ploy'), rec('Fern')].map(r => ({ name: r.name, opened: r.opened, marks: r.marks, concerns: r.concerns })), BYID[EYEF]);
  const mvIds = (Array.isArray(mvWant) ? mvWant : mvWant.units || []).map(u => typeof u === 'string' ? u : u.id);
  check(mvRows > 0 && mvRows === mvIds.length, 'R2 Marks view: lists the ' + mvRows + ' units where the panel’s marks differ (core says ' + mvIds.length + ')');
  check((await text(Na)).includes('Nam · ✗') || (await text(Na)).includes('You · ✗'), 'R2 Marks view: shows each member’s mark');
  await overflow(Na, 'R2 comparison + Marks view');
  // head claim: Ploy first; Nam's stale button is refused
  check(await Pl.isVisible('#claim') && await Na.isVisible('#claim'), 'R2: no head yet, both see the claim button');
  await Pl.click('#claim'); await sleep(500);
  await Na.click('#claim'); await sleep(500);
  check(gas.props['H:3'] === 'Ploy' && (await toastText(Na)).includes('Ploy is already head'), 'R2: second head claim refused (H:3 stays Ploy, Nam told)');
  check(post({ action: 'claimHead', name: 'Fern', panel: '3', epoch: state().epoch }).ok === false, 'R2: server refuses a third claim');
  await Na.evaluate(() => loadPanel()); await sleep(400);
  check(!(await Na.$('#pform')) && (await text(Na)).includes('Ploy is head of panel'), 'R2: Nam sees Ploy as head, no head form');
  await Pl.waitForSelector('#pform');
  const long = 'Her file gives a dated moment, a number we can check and a clear link to the first-year project, which the brief asks for.';
  await Pl.fill('[data-reason="s"]', 'Good evidence and clear reflection.');
  await Pl.fill('[data-reason="o2"]', long); await Pl.fill('[data-reason="o3"]', long);
  for (const k of ['s', 'o2', 'o3']) { await Pl.click('[data-attopen="' + k + '"]'); await Pl.click('.attpick >> nth=1'); }
  const bottom = await Pl.evaluate(() => S.pform.order.slice(7));
  for (const id of bottom) { await Pl.click('[data-rec="' + id + '|r1"]'); await Pl.click('[data-rec="' + id + '|r4"]'); }
  await Pl.click('#psend'); await sleep(400);
  check(!gas.props['P:3'] && /15 words/.test(await toastText(Pl)), 'R2: a reason under 15 words is refused on the phone');
  { const f = await Pl.evaluate(() => S.pform); const at = {}; ['s', 'o2', 'o3'].forEach((k, i) => at[k] = unitsOf(f.order[i])[0]);
    const r = post({ action: 'panel', panel: '3', head: 'Ploy', members: P3, order: f.order, reasons: { s: 'Too short to count.', o2: long, o3: long }, attach: at, recs: f.recs, epoch: state().epoch });
    check(r.ok === false && /15 words/.test(r.error || '') && !gas.props['P:3'], 'R2: the server refuses a reason under 15 words'); }
  await Pl.fill('[data-reason="s"]', long);
  await Pl.click('[data-attopen="s"]'); await sleep(100);
  check(await Pl.isVisible('.attlist'), 'R2: attach picker lists the file’s units');
  await overflow(Pl, 'R2 head form with the attach picker');
  await Pl.click('.attpick >> nth=2');
  await overflow(Pl, 'R2 head form');
  await Pl.click('#psend'); await sleep(600);
  const p3 = prop('P:3');
  check(p3 && p3.auto === false && ['s', 'o2', 'o3'].every((k, i) => p3.attach[k] && p3.attach[k].startsWith(p3.order[i] + '-')), 'R2: Panel 3 stored, one attached unit from each nominated file');
  check(p3 && ['s', 'o2', 'o3'].every(k => p3.reasons[k].split(/\s+/).length >= 15) && p3.order.slice(7).every(id => p3.recs[id] && p3.recs[id].length === 2), 'R2: reasons ≥ 15 words, two pieces of advice for each of the bottom 3');
  check(p3 && p3.members.length === 3, 'R2: Panel 3 lists 3 members');
  await Fe.evaluate(() => loadPanel()); await sleep(400);
  check((await text(Fe)).includes('Submitted by Ploy') && await Fe.isVisible('.attq'), 'R2: members see the submission with the attached sentence');
  await overflow(Fe, 'R2 member sees the submission');
  // Panel 5: Mind is head, writes a short reason and never submits
  await Mi.evaluate(() => loadPanel()); await sleep(300); await Mi.click('#claim'); await sleep(400); await Mi.waitForSelector('#pform');
  await Mi.fill('[data-reason="s"]', 'She seems kind');
  await Ju.evaluate(() => loadPanel()); await sleep(300);
  check((await text(Ju)).includes('Mind') && !(await Ju.$('#pform')), 'R2: June sees Mind as head');
  await overflow(Mi, 'R2 head form (Panel 5)');
  check(!gas.props['P:5'], 'R2: Panel 5 has not submitted');
  // before Round 3: no key on the board, scores locked
  { const r = get('action=board'), s = JSON.stringify(r);
    check(r.ok && r.notes === null && !r.scores, 'GET board before R3: notes null, no scores');
    check(!/"(tier|triggers|units|builtToShow|weakness|lowRank|headline|group|label|ban|design)"\s*:/.test(s) && !/redflag|RED FLAG/i.test(s), 'GET board before R3: no key-like fields');
    check(get('action=scores&name=Nam').locked === true && get('action=scores&name=Nam').score === null, 'GET scores in Round 2: locked'); }
  await board.click('#stopBtn'); await sleep(300);
  await Mi.evaluate(() => poll()); await sleep(800);
  const p5 = prop('P:5');
  check(p5 && p5.auto === true && p5.head === 'Mind' && p5.order.length === 10, 'Stop: Panel 5 auto-sent by its head’s phone (auto: true)');
  await refresh();

  /* ---------- Round 3 ---------- */
  await board.fill('#mins', '10'); await board.click('#r3Btn'); await sleep(600);
  check(state().phase === 'r3', 'board: Round 3');
  await pollAll(); await sleep(500);
  const big = async p => (await p.$eval('.eye .big', e => e.textContent)).trim();
  const eyeNam = await big(Na);
  check(/^\d+$/.test(eyeNam), 'R3: Nam sees a Cliché eye number (' + eyeNam + ')');
  check((await big(Fe)) === '—' && (await text(Fe)).includes(U.eyeNoMarks), 'R3: Fern (no ✗ marks) sees "—" with the reason');
  check((await text(Na)).includes(U.eyeMissedWait), 'R3: missed sentences wait for the reveal');
  { const r = get('action=scores&name=Nam');
    check(!r.locked && r.score && String(r.score.score) === eyeNam && r.missed == null && r.score.missed == null, 'GET scores in R3: score, no missed list before Reveal'); }
  { const r = get('action=board'), s = JSON.stringify(r);
    check(r.notes === null && r.scores && Object.keys(r.scores).length === 6 && !/"missed"/.test(s) && !/"(tier|triggers|builtToShow|lowRank)"\s*:/.test(s), 'GET board in R3 before Reveal: notes null, 6 scores, no missed lists or key fields'); }
  for (const n of ['Nam', 'Fern', 'Mind']) await overflow(ph[n], 'R3 ' + n);
  // board: Marked text heatmap
  await refresh(); await tab('mt'); await board.click('[data-mtf="' + EYEF + '"]'); await sleep(200);
  const mu = await board.$$eval('.mu', els => els.map(e => ({ id: e.dataset.unit, shaded: !!e.querySelector('.mtx').getAttribute('style'), key: /key-/.test(e.className) })));
  const cAt = await board.$eval('.mu[data-unit="' + CL(EYEF)[0] + '"] .mb-c b', e => +e.textContent);
  check(mu.length === unitsOf(EYEF).length && mu.some(x => x.shaded) && !mu.some(x => x.key), 'board Marked text: one row per unit, shaded, no key outline before Reveal');
  check(cAt === 2, 'board Marked text: the first keyed cliché shows 2 ✗ (Ploy, Nam)');
  await tab('own'); const own = await board.$$eval('.own:not(.hd)', els => els.map(e => e.textContent));
  check(own.length === 2 && own[0].includes('P3') && own[1].includes('P5'), 'board Own field: rows for P3 and P5');
  await tab('eye');
  const kpi = await board.$$eval('.kpi .v', els => els.map(e => e.textContent));
  const nScored = Object.values(get('action=board').scores).filter(v => v && typeof v.score === 'number').length;
  check(await board.isVisible('.ehist') && kpi[0].startsWith(String(nScored)) && kpi[0].includes('/ 6') && await board.isHidden('.top5'), 'board Cliché eye: distribution (' + kpi[0] + ' scored), top five off');
  // Reveal
  await tab('notes'); await board.click('#revealNotes'); await sleep(600);
  check(state().notes === true && await board.isVisible('.fc'), 'board: Reveal shows the designer’s notes and Flag catch');
  { const want = CORE.flagCatch(get('action=board').individuals, get('action=board').panels, KEY).class;
    const got = await board.$$eval('.fc tr.cls td.n', t => t.map(x => x.textContent));
    check(want.caught === 1 && want.offered >= 1 && want.rank810NoFlag >= 1, 'Flag catch (core): caught 1 (Ploy), offered ≥ 1 (Mind), ranked 8–10 without a flag ≥ 1 (June) — ' + JSON.stringify(want));
    check(got[0] === String(want.of) && got[1] === String(want.caught) && got[2] === String(want.rank810NoFlag) && got[3] === String(want.offered), 'board Flag catch class row matches core (' + got.slice(0, 4).join(', ') + ')'); }
  await tab('mt'); await board.click('[data-mtf="' + EYEF + '"]'); await sleep(200);
  check((await board.$$('.mu.key-c')).length === CL(EYEF).length, 'board Marked text: keyed clichés outlined after Reveal');
  await pollAll(); await sleep(600);
  const missedNam = CL(EYEF).filter(u => rec('Nam').marks[u] !== 'c');
  const tNam = await text(Na);
  check(tNam.includes(U.eyeMissedTitle) && missedNam.every(u => tNam.includes(sb.window.SL.files.find(f => f.id === EYEF).statement.concat(BYID[EYEF].activities).find(x => x.id === u).text)), 'after Reveal: Nam’s phone lists the ' + missedNam.length + ' missed cliché sentence(s)');
  { const r = get('action=scores&name=Nam'); check(Array.isArray(r.missed) && r.missed.length === missedNam.length, 'GET scores after Reveal: missed list present'); }
  await overflow(Na, 'R3 after Reveal');
  // Decision -> Announce -> podium
  await tab('dec');
  const picks = await board.$$eval('[data-pick]', els => [...new Set(els.map(e => e.dataset.pick))].slice(0, 3));
  for (const id of picks) await board.click('[data-pick="' + id + '"]');
  await board.click('[data-pick="' + picks[1] + '"]'); await sleep(100);
  await board.click('#announce'); await sleep(1500);
  check(await board.isVisible('#podium.show') && (await board.textContent('#plinks')).includes(BYID[picks[1]].name), 'board: Announce opens the podium with the scholar');
  check(state().decision && state().decision.scholar === picks[1] && state().decision.offers.length === 3, 'decision stored (3 offers, scholar)');
  await board.click('#closePodium');
  await pollAll(); await sleep(600);
  for (const n of ['Ploy', 'June']) { const t = await text(ph[n]);
    check(t.includes('committee’s decision') && t.includes(BYID[picks[1]].name) && t.includes('Scholarship'), 'phones: ' + n + ' sees the committee’s decision'); }
  await overflow(Ju, 'R3 decision');

  /* ---------- Fix-it in class ---------- */
  check(await board.isVisible('#fixWrap'), 'board: Fix-it control after Reveal');
  await board.fill('#mins', '5'); await board.click('#fixBtn'); await sleep(600);
  const fa = state().fixAssign;
  check(state().phase === 'fix' && fa && fa.homework === false && fa.panels['3'] === LOW(3) && fa.panels['5'] === LOW(2), 'Fix-it in class: P3 → low file 3, P5 → low file 2');
  await pollAll(); await sleep(800);
  await Pl.waitForSelector('[data-tgt]:not([disabled])');
  check(await Na.$('[data-tgt]') && !(await Na.$('[data-tgt]:not([disabled])')) && !(await Na.$('#fixText')) && (await text(Na)).includes('Ploy'), 'Fix-it: Nam (not head) cannot type, sees Ploy is typing');
  check(post({ action: 'fix', name: 'Nam', panel: '3', fileId: LOW(3), target: 'p1', text: 'In May 2025 I counted 40 boxes at the Bangna depot for my uncle.', epoch: state().epoch }).ok === false && !gas.props['F:3'], 'Fix-it: the server refuses a non-head send in class');
  await overflow(Na, 'Fix-it member');
  await Pl.click('[data-tgt="p2"]');
  await Pl.fill('#fixText', 'I have a passion for numbers.');
  const ck1 = await Pl.$$eval('#fixChecks li', ls => ls.map(l => l.className));
  check(ck1.length >= 4 && ck1.includes('no'), 'Fix-it: live checks shown, some not ticked (' + ck1.join(',') + ')');
  await overflow(Pl, 'Fix-it head with checks');
  await Pl.fill('#fixText', 'In March 2025 I kept the accounts for my aunt’s noodle stall at Talad Noi for 8 weeks and cut waste by 15 per cent.');
  check(await Pl.$$eval('#fixChecks li', ls => ls.length && ls.every(l => l.className === 'ok')), 'Fix-it: all checks ticked for a good paragraph');
  await Pl.click('#fixSend'); await sleep(600);
  const f3 = prop('F:3');
  check(f3 && f3.name === 'Ploy' && f3.target === 'p2' && f3.fileId === LOW(3) && f3.checks && f3.checks.ok === true, 'Fix-it: F:3 stored, server checks ok');
  await Na.evaluate(() => loadBoard()); await sleep(500);
  check((await text(Na)).includes('Talad Noi'), 'Fix-it: Nam sees Ploy’s sent version');
  await Mi.waitForSelector('[data-tgt]:not([disabled])');
  await Mi.click('[data-tgt="a1"]'); await Mi.fill('#fixText', 'Organised 3 dental check-up days for 60 pupils, resulting in a brushing club that meets weekly.');
  await Mi.click('#fixSend'); await sleep(300); if (!gas.props['F:5']) { await Mi.click('#fixSend'); await sleep(400); }
  check(!!prop('F:5') && prop('F:5').target === 'a1', 'Fix-it: Mind (head P5) sends an activity line');
  check(!(await Ju.$('[data-tgt]:not([disabled])')), 'Fix-it: June (not head) cannot pick a target');
  await refresh();
  check((await board.$$('.fixcard')).length === 2 && (await board.$$('.fixcard .tick')).length > 4, 'board Fix-it gallery: 2 rewrites beside the originals with ticks');

  /* ---------- Fix-it as homework ---------- */
  await board.check('#fixHw'); await board.fill('#mins', '0'); await board.click('#fixBtn'); await sleep(600);
  check(state().fixAssign.homework === true, 'Fix-it as homework: fixAssign homework true');
  await pollAll(); await sleep(800);
  const hw = [['Nam', 'p1', 'Last June I checked 120 receipts at the Bang Rak shop with my cousin and found 9 mistakes.'],
              ['Fern', 'a2', 'Tracked 45 invoices for a school fair, resulting in a cash record the club still uses.'],
              ['June', 'p1', 'In July 2025 I sorted 30 boxes of donated books at the Thonburi library with Khun Dao.']];
  for (const [n, tg, t] of hw) {
    const p = ph[n]; await p.waitForSelector('[data-tgt]:not([disabled])', { timeout: 5000 }).catch(() => {});
    await p.click('[data-tgt="' + tg + '"]'); await p.fill('#fixText', t);
    await p.click('#fixSend'); await sleep(300); if (!gas.props['F:n:' + n.toLowerCase()]) { await p.click('#fixSend'); await sleep(400); }
    const f = prop('F:n:' + n.toLowerCase());
    check(f && f.name === n && f.target === tg && f.fileId === state().fixAssign.panels[P3.includes(n) ? '3' : '5'], 'homework: ' + n + ' sends her own (F:n:' + n.toLowerCase() + ')');
  }
  await overflow(Ju, 'Fix-it homework');
  await refresh();
  check((await board.$$('.fixcard')).length === 5, 'board Fix-it gallery: 5 rewrites (2 in class + 3 homework)');
  check(soloPosts.length === 0 && !rec('Bee'), 'solo phone sent nothing (0 POSTs, no I:bee)');

  /* ---------- Reset ---------- */
  await board.click('#resetBtn'); await board.click('#resetBtn'); await sleep(700);
  check(!Object.keys(gas.props).some(k => /^[IHPF]:/.test(k)) && state().phase === 'lobby' && state().epoch === '2', 'Reset: students, heads, panels and fixes wiped, epoch 2');
  await pollAll(); await sleep(600);
  const joins = await Promise.all(all.map(p => p.isVisible('#jName')));
  check(joins.every(Boolean), 'Reset: all six phones back on the join screen');
  await overflow(Pl, 'join after Reset');

  check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 8).join(' | ') : ''));
  await browser.close();
  console.log((fails ? 'FAILED ' + fails + ' of ' : 'ALL PASSED · ') + (passes + fails) + ' checks (' + passes + ' passed)');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
