/* Assembles data/content.js from data/content-base.js (coordinator's fixed parts + ui) and a files JSON.
   node tools/assemble-content.js <programme.json> <files.json>
   Files JSON = array of files in the CONTRACTS §2 shape, f01–f10 in id order. Keeps everything outside the markers. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), file = path.join(ROOT, 'data', 'content.js');
const [prog, files] = process.argv.slice(2).map(p => JSON.parse(fs.readFileSync(p, 'utf8')));
let src = fs.readFileSync(file, 'utf8');
const put = (tag, val) => {
  const re = new RegExp('/\\* @@' + tag + '-BEGIN@@ \\*/[\\s\\S]*?/\\* @@' + tag + '-END@@ \\*/');
  if (!re.test(src)) throw new Error('marker ' + tag + ' missing');
  src = src.replace(re, '/* @@' + tag + '-BEGIN@@ */ ' + val + ' /* @@' + tag + '-END@@ */');
};
const clean = f => ({ id: f.id, name: f.name, gender: f.gender, faculty: f.faculty, portrait: 'art/applicants/' + f.id + '.jpg',
  statement: f.statement.map(s => ({ id: s.id, text: s.text, para: s.para })), activities: f.activities.map(a => ({ id: a.id, text: a.text })) });
put('PROGRAMME', JSON.stringify({ name: prog.name, university: prog.university, brief: prog.brief, features: prog.features }, null, 2));
put('FILES', JSON.stringify(files.map(clean), null, 2));
fs.writeFileSync(file, src); console.log('content.js assembled:', files.length, 'files');
