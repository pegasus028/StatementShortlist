/* The Statement Shortlist — core vectors (node tests/core.test.js).
   Runs every group in tests/vectors.json against js/core.js (harness conventions: src/wsC1/SCORING.md §0), then, when
   tools/sync-gs.js has pasted the core into apps-script/Code.gs, against that copy too (evaluated in a fresh vm context).
   Prints PASS/FAIL per group with counts; exits 1 on any failure. No frameworks. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors.json'), 'utf8'));
const FX = V.fixtures || {};

const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
function lookup(p) {
  let cur = FX;
  for (const k of p.split('.')) {
    if (cur == null || !Object.prototype.hasOwnProperty.call(cur, k)) throw new Error('fixture path not found: @' + p);
    cur = cur[k];
  }
  return clone(cur);
}
function resolve(x) {
  if (typeof x === 'string') return x.charAt(0) === '@' ? lookup(x.slice(1)) : x;
  if (Array.isArray(x)) return x.map(resolve);
  if (x && typeof x === 'object') { const o = {}; for (const k of Object.keys(x)) o[k] = resolve(x[k]); return o; }
  return x;
}
/* Deep equality that works across vm realms (no instanceof, no prototypes). */
function equal(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b);
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  const aa = Array.isArray(a), ba = Array.isArray(b);
  if (aa !== ba) return false;
  if (aa) return a.length === b.length && a.every((v, i) => equal(v, b[i]));
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && equal(a[k], b[k]));
}
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* One call per key, as SCORING.md §0 says. C = the core under test. */
const CALLS = {
  clicheEye: (C, i) => C.clicheEye(i.student, i.notes),
  flagCatch: (C, i) => C.flagCatch(i.individuals, i.panels, i.notes),
  marksView: (C, i) => C.marksView(i.members, i.file),
  agreement: (C, i) => C.agreement(i.spread),
  points: (C, i) => {
    if (has(i, 'orders')) {
      const tot = {};
      i.orders.forEach((o) => { const p = C.points(o); Object.keys(p).forEach((f) => { tot[f] = (tot[f] || 0) + p[f]; }); });
      return tot;
    }
    return C.points(i.order);
  },
  ownField: (C, i) => C.ownField(i.panels, i.content),
  fixAssignment: (C, i) => C.fixAssignment(i.panelNumbers, i.notes),
  fixForSolo: (C, i) => C.fixForSolo(i.name, i.notes),
  checkLine: (C, i) => {
    const set = C.makeVerbSet(i.verbBank);
    if (i.opts === null || i.opts === undefined) return C.checkLine(i.text, set);
    const o = {}, s = i.opts;
    if (has(s, 'numberPattern')) o.number = C.numberTester(s.numberPattern);
    if (has(s, 'resultMarkers')) o.result = C.resultTester(s.resultMarkers);
    if (has(s, 'banList')) o.banned = C.clicheMatchers(s.banList);
    if (has(s, 'maxWords')) o.maxWords = s.maxWords;
    return C.checkLine(i.text, set, o);
  },
  checkRewrite: (C, i) => C.checkRewrite(i.text, i.original, C.clicheMatchers(i.banList), i.minWords, i.requireDetail),
  checkFix: (C, i) => C.checkFix(i.target, i.text, i.original, i.content),
  words: (C, i) => C.words(i.text),
  findBanned: (C, i) => C.findBanned(i.text, C.clicheMatchers(i.banList)).map((m) => m.id),
  hasDetail: (C, i) => C.hasDetail(i.text),
  resultClauseOk: (C, i) => C.resultClauseOk(i.after),
  verbKey: (C, i) => C.verbKey(i.word)
};
const EXPORTS = ['words', 'clicheMatchers', 'findBanned', 'hasDetail', 'checkRewrite', 'verbKey', 'makeVerbSet', 'resultClauseOk',
  'resultTester', 'checkLine', 'checkFix', 'clicheEye', 'flagCatch', 'marksView', 'agreement', 'ownField', 'fixAssignment',
  'fixForSolo', 'points', 'numberTester', 'norm'];

let failed = 0;
const short = (x) => { const s = JSON.stringify(x); return s === undefined ? 'undefined' : s.length > 400 ? s.slice(0, 400) + '…' : s; };

function runAll(C, label, keys) {
  console.log('\n== ' + label + ' ==');
  const missing = EXPORTS.filter((n) => typeof C[n] !== 'function');
  if (missing.length) { failed++; console.log('FAIL exports: missing ' + missing.join(', ')); }
  else console.log('PASS exports (' + EXPORTS.length + ')');
  const groups = Object.keys(V).filter((k) => k !== 'fixtures' && Array.isArray(V[k]));
  groups.filter((k) => !keys || keys.indexOf(k) > -1).forEach((k) => {
    if (!CALLS[k]) { failed++; console.log('FAIL ' + k + ': no harness call for this key'); return; }
    let pass = 0;
    const bad = [];
    V[k].forEach((vec, n) => {
      let got;
      try { got = CALLS[k](C, resolve(vec.input)); } catch (e) { got = { __threw: String(e && e.stack || e) }; }
      // Round-trip through JSON-like clone only for comparison of plain values; Sets are not expected in results.
      if (equal(got, vec.expect)) pass++;
      else bad.push({ n, name: vec.name, got, expect: vec.expect });
    });
    const total = V[k].length;
    console.log((bad.length ? 'FAIL ' : 'PASS ') + k + ' ' + pass + '/' + total);
    bad.forEach((b) => {
      console.log('   #' + b.n + ' ' + b.name);
      console.log('      expect ' + short(b.expect));
      console.log('      got    ' + short(b.got));
    });
    if (bad.length) failed++;
  });
}

/* 1. js/core.js */
const core = require(path.join(ROOT, 'js', 'core.js'));
runAll(core, 'js/core.js');

/* 2. the copy pasted into apps-script/Code.gs (only once tools/sync-gs.js has pasted it) */
const gsPath = path.join(ROOT, 'apps-script', 'Code.gs');
const gs = fs.existsSync(gsPath) ? fs.readFileSync(gsPath, 'utf8') : '';
const m = /\/\* @@CORE-BEGIN@@ \*\/([\s\S]*?)\/\* @@CORE-END@@ \*\//.exec(gs);
if (m && /SSCore/.test(m[1])) {
  const ctx = {};
  vm.createContext(ctx);
  try {
    vm.runInContext(m[1], ctx, { filename: 'Code.gs#CORE' });
    const C = ctx.CORE || ctx.SSCore;
    if (!C) throw new Error('CORE block ran but defined neither CORE nor SSCore');
    // Checker and clicheEye vectors are the minimum (task brief); the copy is the same code, so run every group.
    runAll(C, 'apps-script/Code.gs CORE block (fresh vm context)');
  } catch (e) { failed++; console.log('\nFAIL Code.gs CORE block: ' + (e && e.stack || e)); }
  // Smoke: the whole Code.gs still loads under the mock services with the core pasted.
  try { require('./mock-gas.js').make(); console.log('PASS Code.gs loads in tests/mock-gas.js'); }
  catch (e) { failed++; console.log('FAIL Code.gs does not load in tests/mock-gas.js: ' + (e && e.message || e)); }
} else {
  console.log('\n(skip) Code.gs CORE block has no SSCore yet: run node tools/sync-gs.js, then these tests again.');
}

console.log('\n' + (failed ? 'FAILED: ' + failed + ' group(s)' : 'ALL PASS'));
process.exit(failed ? 1 : 0);
