/* Runs apps-script/Code.gs (and optionally a Notes.gs) in Node with fake Apps Script services.
   handle(method, url, body) -> JSON string, used by the Playwright tests in place of the real /exec URL. */
const fs = require('fs'), vm = require('vm'), path = require('path');
function make(notesPath){
  const props = {};
  const ctx = {
    PropertiesService: { getScriptProperties: () => ({
      getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); },
      getProperties: () => Object.assign({}, props), deleteAllProperties: () => { for (const k in props) delete props[k]; } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ s, setMimeType(){ return this; } }) },
    LockService: { getScriptLock: () => ({ waitLock(){}, releaseLock(){} }) },
    Date, JSON, Math, String, Number, Object, parseInt
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8'), ctx);
  if (notesPath && fs.existsSync(notesPath)) vm.runInContext(fs.readFileSync(notesPath, 'utf8'), ctx);
  return {
    props,
    handle(method, url, body){
      const u = new URL(url), parameter = Object.fromEntries(u.searchParams);
      const r = method === 'POST' ? ctx.doPost({ postData: { contents: body || '{}' }, parameter }) : ctx.doGet({ parameter });
      return r.s;
    }
  };
}
module.exports = { make };
