/* node tools/content-check.js [--notes <Notes.gs>] — structure, word bands and leak checks for data/content.js (spec §11).
   With --notes <Notes.gs> it also runs private/key-check.js (not in the repo). */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
global.window = global; require(path.join(ROOT, 'data', 'content.js'));
const S = window.SL; let err = 0;
const fail = m => { console.log('FAIL', m); err++; };
const words = s => { s = String(s || '').trim(); return s ? s.split(/\s+/).length : 0; };
const norm = s => String(s).replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const ban = S.banList.map(b => ({ id: b.id, res: b.patterns.map(p => new RegExp(p, 'i')) }));
const hits = t => ban.filter(b => b.res.some(r => r.test(norm(t)))).map(b => b.id);
const FAC = ['Business', 'Medicine', 'Dentistry', 'Veterinary Science', 'Engineering', 'Accounting', 'Design', 'Humanities', 'Public Health', 'Computer Science'];
const US = /\b(color|colors|favorite|center|centers|organize[ds]?|organizing|organization|realize[ds]?|apologize[ds]?|analyze[ds]?|program\b|programs\b|behavior|honor|neighbor|traveled|traveling|labor|defense|license[ds]? to)\b/i;

if (S.files.length !== 10) fail('need 10 files');
if (S.recs.length !== 10) fail('need 10 advice options');
if (S.concernReasons.length !== 9) fail('need 9 concern reasons');
if (S.banList.length !== 30) fail('banList must have 30 items');
const brief = words(S.programme.brief);
if (brief < 60 || brief > 80) fail(`programme brief ${brief} words (60-80)`);
if ((S.programme.features || []).length !== 3) fail('programme needs 3 features');
if (/horizon/i.test(JSON.stringify(S.programme))) fail('programme must not reuse Horizon Scholars');

let f = 0, m = 0, total = brief; const facs = new Set(), names = new Set(), perFile = {};
S.files.forEach((x, i) => {
  const want = 'f' + String(i + 1).padStart(2, '0');
  if (x.id !== want) fail(`file ${i} id ${x.id} (want ${want})`);
  if (names.has(x.name)) fail('dup name ' + x.name); names.add(x.name);
  if (!FAC.includes(x.faculty)) fail(`${x.id} faculty "${x.faculty}" not in the list`); facs.add(x.faculty);
  x.gender === 'F' ? f++ : x.gender === 'M' ? m++ : fail(x.id + ' gender');
  const paras = new Set(x.statement.map(s => s.para));
  if (paras.size < 3 || paras.size > 4) fail(`${x.id} ${paras.size} paragraphs (3-4)`);
  let n = 0, last = 0;
  x.statement.forEach((s, k) => {
    if (s.id !== `${x.id}-s${String(k + 1).padStart(2, '0')}`) fail(`${x.id} sentence id ${s.id}`);
    if (s.para < last) fail(`${s.id} paragraph order`); last = s.para;
    const w = words(s.text); n += w; if (w > 30) fail(`${s.id} ${w} words (≤ 30)`);
  });
  if (n < 100 || n > 120) fail(`${x.id} statement ${n} words (100-120)`);
  if (x.activities.length !== 2 || x.activities[0].id !== x.id + '-a1' || x.activities[1].id !== x.id + '-a2') fail(x.id + ' needs activities a1, a2');
  const aw = x.activities.map(a => words(a.text)); aw.forEach((w, k) => { if (w > 22) fail(`${x.id}-a${k + 1} ${w} words (≤ 22)`); });
  const all = x.statement.map(s => s.text).concat(x.activities.map(a => a.text)).join(' ');
  if (US.test(all)) fail(`${x.id} American spelling: ${all.match(US)[0]}`);
  if (/\b\w+(n't|'re|'ve|'ll|'d)\b/i.test(all.replace(/’/g, "'"))) fail(`${x.id} contraction`);
  if (/satriwithaya|สตรีวิทยา|\bSWEP\b/i.test(all)) fail(`${x.id} names the school`);
  const h = new Set(); x.statement.concat(x.activities).forEach(u => hits(u.text).forEach(id => h.add(id)));
  perFile[x.id] = h.size; total += n + aw[0] + aw[1];
  console.log(`${x.id} ${x.name.padEnd(8)} ${x.gender} ${x.faculty.padEnd(18)} statement ${n} · lines ${aw.join('/')} · paras ${paras.size} · clichés ${h.size}${h.size ? ' (' + [...h].join(',') + ')' : ''}`);
});
if (f !== 5 || m !== 5) fail(`gender ${f}F ${m}M (need 5/5; change this check if T.Chris chooses an all-female pool)`);
if (facs.size !== 10) fail('each faculty once');
console.log(`reading load ${total} words incl. brief (target 1,350-1,550, fail > 1,600)`);
if (total > 1600) fail('reading load above 1,600 words');
if (total < 1350 || total > 1550) console.log('WARN reading load outside 1,350-1,550');

// leak check: no key-like field in public content
const pub = fs.readFileSync(path.join(ROOT, 'data', 'content.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const leak = /["']?\b(tier|key|label|notes|profile|designer|trigger|triggers|redflag|builtToShow|weakness|group|lowRank)\b["']?\s*:/;
const filesSrc = JSON.stringify(S.files);
if (leak.test(filesSrc)) fail('key-like field inside files[]: ' + filesSrc.match(leak)[0]);
if (/"(tier|triggers|builtToShow|lowRank|redflag)"\s*:|\b(tier|triggers|builtToShow|lowRank|redflag)\s*:/.test(pub)) fail('key-like field in content.js');
['art', 'data', 'js', 'index.html', 'board.html'].forEach(p => {
  const walk = q => { const st = fs.statSync(q); if (st.isDirectory()) fs.readdirSync(q).forEach(n => walk(path.join(q, n))); else if (/\.(js|html|json|gs)$/.test(q) && /var\s+NOTES\s*=|builtToShow\s*:\s*['"]|triggers\s*:\s*\[\s*['"]f/.test(fs.readFileSync(q, 'utf8'))) fail('key data in public file ' + path.relative(ROOT, q)); };
  if (fs.existsSync(path.join(ROOT, p))) walk(path.join(ROOT, p));
});

// with the private key: the rules that need the key live in a git-ignored file, so the public repo says nothing about it
const ni = process.argv.indexOf('--notes'), keyCheck = path.join(ROOT, 'private', 'key-check.js');
if (ni > -1) {
  if (!fs.existsSync(keyCheck)) fail('private/key-check.js not found');
  else require(keyCheck)({ S, fail, perFile, notesPath: process.argv[ni + 1], vm, fs });
}
console.log(err ? `${err} error(s)` : 'content OK');
process.exit(err ? 1 : 0);
