/* The Statement Shortlist — shared pure functions (no DOM, no clock, no randomness).
 * Contract: src/CONTRACTS.md §6 and src/wsC1/SCORING.md. Vectors: tests/vectors.json (node tests/core.test.js).
 * Works in the browser (window.SSCore), in Node (require('./core.js')) and in Apps Script V8 when pasted into
 * Code.gs by tools/sync-gs.js (this.SSCore). Keep to ES2019: no ??, no ?., no class fields.
 * The Fix-it checkers (norm … checkRewrite) are ported unchanged in behaviour from ELF Studio js/core.js (content 1.0.0).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SSCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ================= ported from ELF Studio js/core.js ================= */
  var norm = function (s) {
    return String(s == null ? '' : s)
      .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
  };
  var reEsc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

  var NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty',
    'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'hundreds', 'thousand', 'thousands', 'million', 'dozen', 'dozens',
    'half', 'once', 'twice', 'double', 'doubled', 'tripled'];
  var DURATION = /\b(weekly|monthly|daily|yearly|annually|fortnightly|every\s+(day|week|weekend|month|term|semester|year|morning|evening|monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i;
  var RESULT = /\b(resulting in|result(ed)? in|which|that (led|helped|raised|cut|reduced|increased|saved|showed|meant|gave|earned|won|doubled|halved|improved|brought)|leading to|led to|so that|so|helping|enabling|allowing|raising|cutting|reducing|increasing|saving|earning|winning|giving|improving|boosting|attracting|bringing|growing|expanding|doubling|halving|lifting|lowering|getting|thereby|and (raised|cut|reduced|increased|saved|won|earned|doubled|halved|improved|reached|attracted))\b/i;
  var SLOT_IDS = ['verb', 'number', 'result'];

  /** Normalise a verb for bank comparison: lower case, US -ize/-yze → -ise/-yse. */
  function verbKey(w) {
    return norm(w).replace(/[^a-z'-]/g, '').replace(/iz(e|ed|es|ing)$/, 'is$1').replace(/yz(e|ed|es|ing)$/, 'ys$1');
  }
  function makeVerbSet(bank) {
    var set = new Set();
    (bank || []).forEach(function (v) {
      var s = typeof v === 'string' ? v : (v && (v.verb || v.word)) || '';
      s.split(/[\/,]/).forEach(function (x) { var k = verbKey(x.trim().split(' ')[0]); if (k) set.add(k); });
    });
    return set;
  }
  function hasNumber(text) {
    var t = norm(text);
    if (/\d/.test(t)) return true;
    var ws = t.split(/[^a-z-]+/);
    if (ws.some(function (w) {
      return NUMBER_WORDS.indexOf(w) > -1 || w.split('-').some(function (p) { return NUMBER_WORDS.indexOf(p) > -1; });
    })) return true;
    return DURATION.test(t);
  }
  /** Number test: a RegExp source from the content (lineCheck.numberPattern) or the built-in rule. */
  function numberTester(pattern) {
    if (!pattern) return hasNumber;
    var re = new RegExp(pattern, 'i');
    return function (text) { return re.test(String(text == null ? '' : text)); };
  }
  var EVALUATIVE = /^(was|is|were|are|be|been)\b|^(very|really|so)\s+(good|great|fun|nice)\b|^(good|great|fun|nice|amazing|interesting|helpful|useful)\b/;
  var PERFECT_OK = /(ed|en)$|^(won|grown|cut|brought|taught|built|made|given|become|run|led|met|sold|raised|spent|kept)$/;
  /** What follows a result marker must say what changed: at least 3 words, not an evaluation
   *  ("was good", "is fun") and not a description ("has 30 members"); "has raised 5,000 baht" is fine. */
  function resultClauseOk(after) {
    var w = norm(after).replace(/[^a-z0-9%,.'\s-]/g, ' ').replace(/[,.]+(\s|$)/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (w.length < 3) return false;
    var head = w.join(' ');
    if (EVALUATIVE.test(head)) return false;
    if (/^(has|had|have)$/.test(w[0]) && !PERFECT_OK.test(w[1] || '')) return false;
    return true;
  }
  function resultTester(markers) {
    var src = markers && markers.length
      ? '\\b(' + markers.map(function (m) { return reEsc(norm(m)); }).join('|') + ')\\b'
      : RESULT.source;
    return function (rest) {
      var t = norm(rest), re = new RegExp(src, 'gi');
      var m;
      while ((m = re.exec(t))) {
        if (resultClauseOk(t.slice(m.index + m[0].length))) return true;
        if (m[0].length === 0) re.lastIndex++;
      }
      return false;
    };
  }
  /** CV activity line: verb from the bank first, a number, a result clause after the first word, no banned
   *  cliché, within maxWords. opts: {number: fn, result: fn, banned: matchers, maxWords}. */
  function checkLine(text, verbSet, opts) {
    var o = opts || {};
    var numberOk = o.number || hasNumber, resultOk = o.result || resultTester(null);
    var t = String(text == null ? '' : text).trim();
    var ws = t ? t.split(/\s+/) : [];
    var first = ws.length ? verbKey(ws[0]) : '';
    var rest = ws.slice(1).join(' ');
    var slots = {
      verb: !!first && verbSet.has(first),
      number: numberOk(t),
      result: resultOk(rest)
    };
    var missing = SLOT_IDS.filter(function (k) { return !slots[k]; });
    var banned = o.banned ? findBanned(t, o.banned).map(function (b) { return b.cliche; }) : [];
    var tooLong = !!o.maxWords && ws.length > o.maxWords;
    return { ok: missing.length === 0 && ws.length >= 4 && !banned.length && !tooLong, slots: slots, missing: missing,
      banned: banned, tooLong: tooLong, firstWord: ws[0] || '', words: ws.length };
  }

  /** Ban-list matchers. An item's `patterns` (regex strings) are used when present; otherwise its
   *  cliché text: "a / b" = alternatives, "a … b" = both in order, a single word also matches its longer forms. */
  function clicheMatchers(banList) {
    return (banList || []).map(function (b, i) {
      var raw = typeof b === 'string' ? b : b.cliche;
      var res;
      if (b && Array.isArray(b.patterns) && b.patterns.length) res = b.patterns.map(function (p) { return new RegExp(p, 'i'); });
      else {
        var alts = String(raw).split(/\s*\/\s*/).filter(Boolean);
        res = alts.map(function (a) {
          var parts = norm(a).replace(/[()"]/g, '').split(/\s*(?:…|\.\.\.)\s*/).filter(Boolean);
          var src = parts.map(function (p) {
            var single = !/\s/.test(p);
            return '\\b' + reEsc(p) + (single ? '' : '\\b');
          }).join('.*?');
          return new RegExp(src, 'i');
        });
      }
      return { i: i, id: (b && b.id) || String(i), cliche: raw, res: res };
    });
  }
  /** The ban-list entries (matchers, in ban-list order) found in the text. */
  function findBanned(text, matchers) {
    var t = norm(text);
    return matchers.filter(function (m) { return m.res.some(function (r) { return r.test(t); }); });
  }
  /** A concrete detail: a digit, or a capitalised word that does not start a sentence and is not "I". */
  function hasDetail(text) {
    var t = String(text || '');
    if (/\d/.test(t)) return true;
    var ws = t.split(/\s+/);
    return ws.some(function (w, i) {
      return i > 0 && /^[A-Z][a-z]/.test(w.replace(/^["'(‘“]/, '')) && !/[.!?]["')’”]?$/.test(ws[i - 1]) && !/^I('|’|$)/.test(w);
    });
  }
  /** A rewrite is accepted when it has ≥ minWords words, contains no banned item, is not the original,
   *  and (when requireDetail) contains a concrete detail. */
  function checkRewrite(text, original, matchers, minWords, requireDetail) {
    var t = String(text || '').trim();
    var n = t ? t.split(/\s+/).length : 0;
    var banned = findBanned(t, matchers);
    var same = norm(t) === norm(original);
    var short = n < (minWords || 6);
    var noDetail = !!requireDetail && !hasDetail(t);
    return { ok: !banned.length && !same && !short && !noDetail, banned: banned.map(function (b) { return b.cliche; }),
      same: same, short: short, noDetail: noDetail, words: n };
  }

  /* ================= Statement Shortlist (SCORING.md) ================= */
  var MARKS = { e: 1, c: 1, f: 1 };
  var OWN_FIELD = { 1: 'Business', 2: 'Business', 3: 'Medicine', 4: 'Medicine', 5: 'Dentistry', 6: 'Veterinary Science',
    7: 'Engineering', 8: 'Accounting', 9: 'Design', 10: 'Humanities' };
  var has = function (o, k) { return o != null && Object.prototype.hasOwnProperty.call(o, k); };

  /** §9 */
  function words(text) {
    var t = String(text == null ? '' : text).trim();
    return t === '' ? 0 : t.split(/\s+/).length;
  }
  /** §0 */
  function fileOf(unitId) { return String(unitId).split('-')[0]; }
  function panelNo(x) {
    if (x === null || x === undefined || x === '') return null;
    var n = Number(x);
    return (isFinite(n) && Math.floor(n) === n && n >= 1) ? n : null;
  }
  function rankIn(order, fileId) {
    if (!Array.isArray(order)) return null;
    var i = order.indexOf(fileId);
    return i < 0 ? null : i + 1;
  }
  function unitKey_(id) {
    var s = String(id), m = /^([^-]*)-([sa])(\d+)$/.exec(s);
    return m ? { f: m[1], k: m[2] === 's' ? 0 : 1, n: Number(m[3]), s: s } : { f: fileOf(s), k: 2, n: 0, s: s };
  }
  /** Unit order: file id, then statement sentences before activity lines, then number. */
  function unitCompare(a, b) {
    var x = unitKey_(a), y = unitKey_(b);
    if (x.f !== y.f) return x.f < y.f ? -1 : 1;
    if (x.k !== y.k) return x.k - y.k;
    if (x.n !== y.n) return x.n - y.n;
    return x.s < y.s ? -1 : x.s > y.s ? 1 : 0;
  }
  function openedSet_(student) {
    var set = {}, list = [];
    var op = student && Array.isArray(student.opened) ? student.opened : [];
    op.forEach(function (f) { var k = String(f); if (!has(set, k)) { set[k] = true; list.push(k); } });
    return { set: set, list: list };
  }
  /** The counted mark of a unit ('e' | 'c' | 'f'), or '' when unmarked / not counted. */
  function countedMark_(student, opened, unitId) {
    var marks = (student && student.marks) || {};
    var v = has(marks, unitId) ? marks[unitId] : '';
    return (typeof v === 'string' && has(MARKS, v) && has(opened.set, fileOf(unitId))) ? v : '';
  }

  /** §1 */
  function clicheEye(student, notes) {
    var op = openedSet_(student);
    var files = (notes && notes.files) || {};
    var keyed = {}, keyedList = [];
    op.list.forEach(function (f) {
      var units = has(files, f) && files[f] && files[f].units;
      if (!units) return;
      Object.keys(units).forEach(function (u) {
        if (units[u] && units[u].label === 'cliche' && !has(keyed, u)) { keyed[u] = true; keyedList.push(u); }
      });
    });
    var marks = (student && student.marks) || {};
    var hits = 0, falses = 0;
    Object.keys(marks).forEach(function (u) {
      if (countedMark_(student, op, u) !== 'c') return;
      if (has(keyed, u)) hits++; else falses++;
    });
    var missed = keyedList.filter(function (u) {
      var m = countedMark_(student, op, u);
      return m !== 'c' && m !== 'f';
    }).sort(unitCompare);
    var misses = missed.length, units = keyedList.length;
    var score = (hits + falses === 0 || units === 0) ? null
      : Math.round(100 * 2 * hits / (2 * hits + falses + misses));
    return { score: score, hits: hits, falses: falses, misses: misses, units: units, missed: missed };
  }

  /** §2 */
  function flagCatch(individuals, panels, notes) {
    var files = (notes && notes.files) || {};
    var red = Object.keys(files).filter(function (f) { return files[f] && files[f].tier === 'redflag'; });
    if (red.length !== 1) return null;
    var fileId = red[0], triggers = files[fileId].triggers;
    if (!Array.isArray(triggers) || !triggers.length) return null;
    var blank = function () { return { caught: 0, rank810NoFlag: 0, offered: 0, of: 0, noRanking: 0 }; };
    var cls = blank(), rows = {};
    var row = function (p) {
      if (!has(rows, p)) { rows[p] = blank(); rows[p].panel = p; rows[p].panelRank = null; rows[p].panelOffered = null; }
      return rows[p];
    };
    (individuals || []).forEach(function (s) {
      if (!s) return;
      var p = panelNo(s.panel), r = p === null ? null : row(p);
      var add = function (k) { cls[k]++; if (r) r[k]++; };
      if (!Array.isArray(s.order)) { add('noRanking'); return; }
      var op = openedSet_(s);
      var caught = triggers.some(function (t) { return countedMark_(s, op, t) === 'f'; });
      var rank = rankIn(s.order, fileId);
      add('of');
      if (caught) add('caught');
      if ((rank === 8 || rank === 9 || rank === 10) && !caught) add('rank810NoFlag');
      if (rank === 1 || rank === 2 || rank === 3) add('offered');
    });
    var seen = {};
    cls.panelsOffered = 0; cls.panelsOf = 0;
    (panels || []).forEach(function (sub) {
      if (!sub || !Array.isArray(sub.order)) return;
      var p = panelNo(sub.panel);
      if (p === null || has(seen, p)) return;
      seen[p] = true;
      var r = row(p), pr = rankIn(sub.order, fileId);
      r.panelRank = pr;
      r.panelOffered = pr !== null && pr <= 3;
      cls.panelsOf++;
      if (r.panelOffered) cls.panelsOffered++;
    });
    var list = Object.keys(rows).map(function (k) { return rows[k]; }).sort(function (a, b) { return a.panel - b.panel; });
    return { fileId: fileId, triggers: triggers.slice(), panels: list, class: cls };
  }

  /** §3 */
  function marksView(members, file) {
    var fid = file && file.id;
    var opened = [], notOpened = [], openedRecs = [];
    (members || []).forEach(function (m) {
      var op = openedSet_(m);
      if (has(op.set, String(fid))) { opened.push(m.name); openedRecs.push({ m: m, op: op }); } else notOpened.push(m && m.name);
    });
    var all = ((file && file.statement) || []).concat((file && file.activities) || []);
    var units = [];
    all.forEach(function (u, idx) {
      var marks = openedRecs.map(function (x) { return countedMark_(x.m, x.op, u.id); });
      var d = {};
      marks.forEach(function (v) { d[v] = true; });
      var distinct = Object.keys(d).length;
      if (distinct >= 2) units.push({ idx: idx, row: { id: u.id, text: u.text, distinct: distinct, flag: marks.indexOf('f') > -1, marks: marks } });
    });
    units.sort(function (a, b) {
      return (b.row.distinct - a.row.distinct) || ((b.row.flag ? 1 : 0) - (a.row.flag ? 1 : 0)) || (a.idx - b.idx);
    });
    return { fileId: fid, opened: opened, notOpened: notOpened, units: units.map(function (x) { return x.row; }) };
  }

  /** §4 */
  function agreement(spread) {
    if (typeof spread !== 'number' || !isFinite(spread)) return null;
    if (spread <= 2) return 'Agree';
    if (spread >= 6) return 'Split';
    return 'Mixed';
  }

  /** §5 */
  function points(order) {
    var out = {};
    if (!Array.isArray(order)) return out;
    for (var i = 0; i < order.length && i < 10; i++) if (!has(out, order[i])) out[order[i]] = 10 - i;
    return out;
  }

  /** §6 */
  function ownField(panels, content) {
    var seen = {}, subs = [];
    (panels || []).forEach(function (sub) {
      if (!sub || !Array.isArray(sub.order)) return;
      var p = panelNo(sub.panel);
      if (p === null || p > 10 || has(seen, p)) return;
      seen[p] = true;
      subs.push({ panel: p, order: sub.order });
    });
    subs.sort(function (a, b) { return a.panel - b.panel; });
    var files = (content && Array.isArray(content.files)) ? content.files : [];
    return subs.map(function (s) {
      var faculty = OWN_FIELD[s.panel];
      var f = files.filter(function (x) { return x && x.faculty === faculty; })[0];
      var fileId = f ? f.id : null;
      var sum = 0, count = 0;
      subs.forEach(function (o) {
        if (o.panel === s.panel) return;
        var r = rankIn(o.order, fileId);
        if (r !== null) { sum += r; count++; }
      });
      return { panel: s.panel, faculty: faculty, fileId: fileId, panelRank: rankIn(s.order, fileId),
        classAvg: count ? Math.round(sum / count * 10) / 10 : null };
    });
  }

  /** §7 */
  function lowFiles_(notes) {
    var files = (notes && notes.files) || {}, low = {};
    var ids = Object.keys(files);
    for (var r = 1; r <= 3; r++) {
      var m = ids.filter(function (f) { return files[f] && files[f].lowRank === r; });
      if (m.length !== 1) return null;
      low[r] = m[0];
    }
    return low;
  }
  function fixAssignment(panelNumbers, notes) {
    var low = lowFiles_(notes);
    if (!low) return null;
    var out = {};
    (Array.isArray(panelNumbers) ? panelNumbers : []).forEach(function (x) {
      var p = panelNo(x);
      if (p !== null) out[String(p)] = low[((p - 1) % 3) + 1];
    });
    return out;
  }
  function fixForSolo(name, notes) {
    var low = lowFiles_(notes);
    if (!low) return null;
    var len = String(name == null ? '' : name).trim().length;
    return low[1 + (len % 3)];
  }

  /** §8 checkFix */
  function checkFix(target, text, original, content) {
    var c = content || {};
    var matchers = clicheMatchers(c.banList);
    var tg = String(target == null ? '' : target);
    if (/^p[1-4]$/.test(tg)) {
      var r = checkRewrite(text, original, matchers, 6, true);
      var tooLong = r.words > 70;
      return { ok: r.ok && !tooLong, kind: 'para', words: r.words, tooLong: tooLong, banned: r.banned, same: r.same,
        short: r.short, noDetail: r.noDetail };
    }
    if (tg === 'a1' || tg === 'a2') {
      var lc = c.lineCheck || {};
      var maxWords = (typeof lc.maxWords === 'number' && lc.maxWords > 0) ? lc.maxWords : 22;
      var l = checkLine(text, makeVerbSet(c.verbBank), {
        number: numberTester(lc.numberPattern), result: resultTester(lc.resultMarkers), banned: matchers, maxWords: maxWords });
      var same = norm(String(text == null ? '' : text).trim()) === norm(original);
      return { ok: l.ok && !same, kind: 'line', words: l.words, tooLong: l.tooLong, banned: l.banned, same: same,
        slots: l.slots, missing: l.missing, firstWord: l.firstWord };
    }
    return { ok: false, kind: null, words: words(text), tooLong: false, error: 'target' };
  }

  return {
    // CONTRACTS §6
    words: words, clicheMatchers: clicheMatchers, findBanned: findBanned, hasDetail: hasDetail, checkRewrite: checkRewrite,
    verbKey: verbKey, makeVerbSet: makeVerbSet, resultClauseOk: resultClauseOk, resultTester: resultTester, checkLine: checkLine,
    checkFix: checkFix, clicheEye: clicheEye, flagCatch: flagCatch, marksView: marksView, agreement: agreement,
    ownField: ownField, fixAssignment: fixAssignment, fixForSolo: fixForSolo, points: points,
    // SCORING §0 / §8 extras
    numberTester: numberTester, norm: norm, reEsc: reEsc, hasNumber: hasNumber,
    fileOf: fileOf, panelNo: panelNo, rankIn: rankIn, unitCompare: unitCompare,
    NUMBER_WORDS: NUMBER_WORDS, DURATION: DURATION, RESULT: RESULT, EVALUATIVE: EVALUATIVE, PERFECT_OK: PERFECT_OK,
    OWN_FIELD: OWN_FIELD
  };
});
