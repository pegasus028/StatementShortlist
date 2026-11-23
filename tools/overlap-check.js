/* node tools/overlap-check.js [--heldout <path>]… [--extra <path>]… [--elf <elf-content.json>] [--verbose]
   Fails when any 6-word sequence of the ten files or the programme brief also appears in a held-out midterm file,
   in an extra source (e.g. the WS-D model statements) or in ELF Studio's elf-content.json.
   Held-out files are read from the paths given only; nothing is copied. The report says only "pass / n overlaps"
   unless --verbose is given (never use --verbose output in the QA report or the Project). */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global; require(path.join(ROOT, 'data', 'content.js'));
const S = window.SL, args = process.argv.slice(2), N = 6;
const take = flag => args.flatMap((a, i) => a === flag ? [args[i + 1]] : []);
const verbose = args.includes('--verbose');
const toks = t => String(t).toLowerCase().replace(/[‘’ʼ]/g, "'").replace(/[^a-z0-9'฀-๿]+/g, ' ').trim().split(' ').filter(Boolean);
const grams = t => { const w = toks(t), g = new Set(); for (let i = 0; i + N <= w.length; i++) g.add(w.slice(i, i + N).join(' ')); return g; };
const readText = p => {
  const raw = fs.readFileSync(p, 'utf8');
  if (/\.json$/i.test(p)) { const out = []; (function walk(o) { if (typeof o === 'string') out.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(walk); })(JSON.parse(raw)); return out.join('\n'); }
  return raw;
};
const mine = [{ src: 'programme', text: S.programme.brief + ' ' + S.programme.features.join(' ') }]
  .concat(S.files.flatMap(f => f.statement.concat(f.activities).map(u => ({ src: u.id, text: u.text }))));
// whole files too, so a sequence across two sentences is caught
S.files.forEach(f => mine.push({ src: f.id + ' (whole)', text: f.statement.map(s => s.text).join(' ') }));
const sources = [];
take('--heldout').forEach(p => sources.push({ kind: 'heldout', p }));
take('--extra').forEach(p => sources.push({ kind: 'extra', p }));
const elf = take('--elf')[0] || '/home/claude/pegasus028/elf/elf-content.json';
if (fs.existsSync(elf)) sources.push({ kind: 'elf', p: elf }); else console.log('note: elf-content.json not found at ' + elf);
const shortlist = '/home/claude/pegasus028/shortlist/data/content.js';
if (fs.existsSync(shortlist)) sources.push({ kind: 'shortlist', p: shortlist });
let n = 0; const byKind = {};
for (const s of sources) {
  const g = grams(readText(s.p)); let k = 0;
  for (const m of mine) for (const x of grams(m.text)) if (g.has(x)) { k++; if (verbose) console.log(`${s.kind}: ${m.src}: "${x}"`); }
  byKind[s.kind] = (byKind[s.kind] || 0) + k; n += k;
}
const held = take('--heldout').length;
console.log(`overlap check: ${n ? 'FAIL' : 'pass'} / ${n} overlaps (${Object.entries(byKind).map(([k, v]) => k + ' ' + v).join(', ') || 'no sources'}; held-out files given: ${held})`);
process.exit(n ? 1 : 0);
