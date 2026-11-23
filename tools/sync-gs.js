/* Pastes the CONTENT block (unit ids and texts, ban list, verb bank, line check) from data/content.js and the CORE block
   (js/core.js, the shared scoring and checking functions) into apps-script/Code.gs.
   node tools/sync-gs.js   — run after any change to data/content.js or js/core.js, then paste Code.gs into Apps Script. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global; require(path.join(ROOT, 'data', 'content.js')); const S = window.SL;
const units = {}, files = {};
for (const f of S.files) {
  const paras = [];
  f.statement.forEach(x => { units[x.id] = { file: f.id, text: x.text, para: x.para }; paras[x.para - 1] = (paras[x.para - 1] ? paras[x.para - 1] + ' ' : '') + x.text; });
  f.activities.forEach(x => { units[x.id] = { file: f.id, text: x.text }; });
  files[f.id] = { paras, units: f.statement.map(x => x.id).concat(f.activities.map(x => x.id)) };
}
const CONTENT = { units, files, banList: S.banList.map(b => ({ id: b.id, cliche: b.cliche, patterns: b.patterns })), verbBank: S.verbBank, lineCheck: S.lineCheck };
const gsPath = path.join(ROOT, 'apps-script', 'Code.gs');
let gs = fs.readFileSync(gsPath, 'utf8');
const put = (tag, body) => {
  const re = new RegExp('/\\* @@' + tag + '-BEGIN@@ \\*/[\\s\\S]*?/\\* @@' + tag + '-END@@ \\*/');
  if (!re.test(gs)) throw new Error('marker ' + tag + ' missing in Code.gs');
  gs = gs.replace(re, () => '/* @@' + tag + '-BEGIN@@ */ ' + body + ' /* @@' + tag + '-END@@ */');
};
put('CONTENT', 'var CONTENT = ' + JSON.stringify(CONTENT) + ';');
const corePath = path.join(ROOT, 'js', 'core.js');
if (fs.existsSync(corePath)) put('CORE', '\n' + fs.readFileSync(corePath, 'utf8') + '\nvar CORE = (typeof SSCore !== "undefined") ? SSCore : null;\n');
fs.writeFileSync(gsPath, gs);
console.log('Code.gs synced:', Object.keys(units).length, 'units,', fs.existsSync(corePath) ? 'core pasted' : 'no core yet', '·', gs.length, 'bytes');
