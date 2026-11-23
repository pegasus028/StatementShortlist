/* The Statement Shortlist backend — Apps Script web app (Execute as: Me, Access: Anyone).
   Fork of The Shortlist backend. No Sheet: everything lives in Script Properties, one key per student and per panel.
   The designer's key lives in a second, PRIVATE script file Notes.gs (var NOTES = {...}); it is not in the repo.
   The CONTENT and CORE blocks below are pasted by tools/sync-gs.js from data/content.js and js/core.js: edit those, not here.

   Keys: state        {phase, endsAt, running, epoch, decision, notes, phaseMin, fixAssign}
         I:<name>     one student's Round 1 record {name, panel, order[10]|null, opened[], marks{unit:e|c|f}, concerns{unit:idx}, auto, at, sentAt}
         H:<panel>    head of panel's name
         P:<panel>    the panel's submission {panel, head, members[], order[10], reasons{s,o2,o3}, attach{s,o2,o3}, recs{id:[rid]}, auto, at}
         F:<panel>    Fix-it in class (head) · F:n:<name> Fix-it as homework or solo {panel, name, fileId, target, text, checks, at}

   GET  ?action=state | panel&panel=N | board | scores&name=X | fixFor&name=X&panel=N
   POST (text/plain JSON) register, setPanel, individual, claimHead, panel, fix,
        teacher: phase, stop, decision, notes, fixAssign, reset */
var P = PropertiesService.getScriptProperties();
var PHASES = ['lobby', 'preview', 'r1', 'r2', 'r3', 'fix', 'done'];
var LATE = ['r3', 'fix', 'done'];

/* @@CONTENT-BEGIN@@ */ var CONTENT = {"units":{"f01-s01":{"file":"f01","text":"Placeholder sentence 1 of paragraph 1 for Mook, written only to test the layout of the reader on a phone screen.","para":1},"f01-s02":{"file":"f01","text":"Placeholder sentence 2 of paragraph 1 for Mook, written only to test the layout of the reader on a phone screen.","para":1},"f01-s03":{"file":"f01","text":"Placeholder sentence 3 of paragraph 2 for Mook, written only to test the layout of the reader on a phone screen.","para":2},"f01-s04":{"file":"f01","text":"Placeholder sentence 4 of paragraph 2 for Mook, written only to test the layout of the reader on a phone screen.","para":2},"f01-s05":{"file":"f01","text":"Placeholder sentence 5 of paragraph 3 for Mook, written only to test the layout of the reader on a phone screen.","para":3},"f01-s06":{"file":"f01","text":"Placeholder sentence 6 of paragraph 3 for Mook, written only to test the layout of the reader on a phone screen.","para":3},"f01-s07":{"file":"f01","text":"Placeholder sentence 7 of paragraph 4 for Mook, written only to test the layout of the reader on a phone screen.","para":4},"f01-a1":{"file":"f01","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f01-a2":{"file":"f01","text":"Helped at a placeholder event, which was great."},"f02-s01":{"file":"f02","text":"Placeholder sentence 1 of paragraph 1 for Earth, written only to test the layout of the reader on a phone screen.","para":1},"f02-s02":{"file":"f02","text":"Placeholder sentence 2 of paragraph 1 for Earth, written only to test the layout of the reader on a phone screen.","para":1},"f02-s03":{"file":"f02","text":"Placeholder sentence 3 of paragraph 2 for Earth, written only to test the layout of the reader on a phone screen.","para":2},"f02-s04":{"file":"f02","text":"Placeholder sentence 4 of paragraph 2 for Earth, written only to test the layout of the reader on a phone screen.","para":2},"f02-s05":{"file":"f02","text":"Placeholder sentence 5 of paragraph 3 for Earth, written only to test the layout of the reader on a phone screen.","para":3},"f02-s06":{"file":"f02","text":"Placeholder sentence 6 of paragraph 3 for Earth, written only to test the layout of the reader on a phone screen.","para":3},"f02-s07":{"file":"f02","text":"Placeholder sentence 7 of paragraph 4 for Earth, written only to test the layout of the reader on a phone screen.","para":4},"f02-a1":{"file":"f02","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f02-a2":{"file":"f02","text":"Helped at a placeholder event, which was great."},"f03-s01":{"file":"f03","text":"One evening in 2024 I found a week of my grandmother's diabetes tablets still in their box.","para":1},"f03-s02":{"file":"f03","text":"I drew sun-and-moon picture labels, one dot per tablet, and Nurse Somjit tried them at our health centre.","para":2},"f03-s03":{"file":"f03","text":"Among 18 elderly patients, the leftover tablets she counted fell from 61 to 22 in 12 weeks.","para":2},"f03-s04":{"file":"f03","text":"That result turned my interest into a passion for medicine.","para":2},"f03-s05":{"file":"f03","text":"In the Year 1 Bridge Project I would test the labels at a clinic for migrant workers who cannot read Thai.","para":3},"f03-s06":{"file":"f03","text":"In the Crossing Seminars, a design student could draw them better than I did.","para":3},"f03-s07":{"file":"f03","text":"After the Year 3 internship, I hope to give back to my community as a family doctor.","para":4},"f03-a1":{"file":"f03","text":"Designed picture labels for 18 elderly diabetes patients, cutting leftover tablets from 61 to 22 in 12 weeks."},"f03-a2":{"file":"f03","text":"Researched salt in 20 instant-noodle brands, winning second prize among 31 projects at a 2025 science fair."},"f04-s01":{"file":"f04","text":"Placeholder sentence 1 of paragraph 1 for Nont, written only to test the layout of the reader on a phone screen.","para":1},"f04-s02":{"file":"f04","text":"Placeholder sentence 2 of paragraph 1 for Nont, written only to test the layout of the reader on a phone screen.","para":1},"f04-s03":{"file":"f04","text":"Placeholder sentence 3 of paragraph 2 for Nont, written only to test the layout of the reader on a phone screen.","para":2},"f04-s04":{"file":"f04","text":"Placeholder sentence 4 of paragraph 2 for Nont, written only to test the layout of the reader on a phone screen.","para":2},"f04-s05":{"file":"f04","text":"Placeholder sentence 5 of paragraph 3 for Nont, written only to test the layout of the reader on a phone screen.","para":3},"f04-s06":{"file":"f04","text":"Placeholder sentence 6 of paragraph 3 for Nont, written only to test the layout of the reader on a phone screen.","para":3},"f04-s07":{"file":"f04","text":"Placeholder sentence 7 of paragraph 4 for Nont, written only to test the layout of the reader on a phone screen.","para":4},"f04-a1":{"file":"f04","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f04-a2":{"file":"f04","text":"Helped at a placeholder event, which was great."},"f05-s01":{"file":"f05","text":"In June 2026 my cousin broke his jaw in a motorbike crash outside our school; he had no helmet.","para":1},"f05-s02":{"file":"f05","text":"Two friends and I then counted riders at the gate for 10 mornings: only 97 of 412 wore one.","para":2},"f05-s03":{"file":"f05","text":"The deputy director saw our numbers and agreed to a helmet rack.","para":2},"f05-s04":{"file":"f05","text":"A month later, 131 of 405 wore one: better, but not enough.","para":2},"f05-s05":{"file":"f05","text":"I am applying because the first-year community project in the Kingsmead Scholars Programme would let me study this problem with a partner organisation.","para":3},"f05-s06":{"file":"f05","text":"In the mixed-faculty seminars, I want an engineer to tell me why our rack stayed half empty.","para":3},"f05-s07":{"file":"f05","text":"To me, public health means counting carefully, then changing one small thing.","para":4},"f05-a1":{"file":"f05","text":"Led 24 volunteers in a 2026 helmet count at my school gate, which persuaded the school to add a rack."},"f05-a2":{"file":"f05","text":"Wrote 6 health columns for the school newsletter in 2025, which the health room printed for parents."},"f06-s01":{"file":"f06","text":"Placeholder sentence 1 of paragraph 1 for Tee, written only to test the layout of the reader on a phone screen.","para":1},"f06-s02":{"file":"f06","text":"Placeholder sentence 2 of paragraph 1 for Tee, written only to test the layout of the reader on a phone screen.","para":1},"f06-s03":{"file":"f06","text":"Placeholder sentence 3 of paragraph 2 for Tee, written only to test the layout of the reader on a phone screen.","para":2},"f06-s04":{"file":"f06","text":"Placeholder sentence 4 of paragraph 2 for Tee, written only to test the layout of the reader on a phone screen.","para":2},"f06-s05":{"file":"f06","text":"Placeholder sentence 5 of paragraph 3 for Tee, written only to test the layout of the reader on a phone screen.","para":3},"f06-s06":{"file":"f06","text":"Placeholder sentence 6 of paragraph 3 for Tee, written only to test the layout of the reader on a phone screen.","para":3},"f06-s07":{"file":"f06","text":"Placeholder sentence 7 of paragraph 4 for Tee, written only to test the layout of the reader on a phone screen.","para":4},"f06-a1":{"file":"f06","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f06-a2":{"file":"f06","text":"Helped at a placeholder event, which was great."},"f07-s01":{"file":"f07","text":"Placeholder sentence 1 of paragraph 1 for Nan, written only to test the layout of the reader on a phone screen.","para":1},"f07-s02":{"file":"f07","text":"Placeholder sentence 2 of paragraph 1 for Nan, written only to test the layout of the reader on a phone screen.","para":1},"f07-s03":{"file":"f07","text":"Placeholder sentence 3 of paragraph 2 for Nan, written only to test the layout of the reader on a phone screen.","para":2},"f07-s04":{"file":"f07","text":"Placeholder sentence 4 of paragraph 2 for Nan, written only to test the layout of the reader on a phone screen.","para":2},"f07-s05":{"file":"f07","text":"Placeholder sentence 5 of paragraph 3 for Nan, written only to test the layout of the reader on a phone screen.","para":3},"f07-s06":{"file":"f07","text":"Placeholder sentence 6 of paragraph 3 for Nan, written only to test the layout of the reader on a phone screen.","para":3},"f07-s07":{"file":"f07","text":"Placeholder sentence 7 of paragraph 4 for Nan, written only to test the layout of the reader on a phone screen.","para":4},"f07-a1":{"file":"f07","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f07-a2":{"file":"f07","text":"Helped at a placeholder event, which was great."},"f08-s01":{"file":"f08","text":"Placeholder sentence 1 of paragraph 1 for Oat, written only to test the layout of the reader on a phone screen.","para":1},"f08-s02":{"file":"f08","text":"Placeholder sentence 2 of paragraph 1 for Oat, written only to test the layout of the reader on a phone screen.","para":1},"f08-s03":{"file":"f08","text":"Placeholder sentence 3 of paragraph 2 for Oat, written only to test the layout of the reader on a phone screen.","para":2},"f08-s04":{"file":"f08","text":"Placeholder sentence 4 of paragraph 2 for Oat, written only to test the layout of the reader on a phone screen.","para":2},"f08-s05":{"file":"f08","text":"Placeholder sentence 5 of paragraph 3 for Oat, written only to test the layout of the reader on a phone screen.","para":3},"f08-s06":{"file":"f08","text":"Placeholder sentence 6 of paragraph 3 for Oat, written only to test the layout of the reader on a phone screen.","para":3},"f08-s07":{"file":"f08","text":"Placeholder sentence 7 of paragraph 4 for Oat, written only to test the layout of the reader on a phone screen.","para":4},"f08-a1":{"file":"f08","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f08-a2":{"file":"f08","text":"Helped at a placeholder event, which was great."},"f09-s01":{"file":"f09","text":"Placeholder sentence 1 of paragraph 1 for Golf, written only to test the layout of the reader on a phone screen.","para":1},"f09-s02":{"file":"f09","text":"Placeholder sentence 2 of paragraph 1 for Golf, written only to test the layout of the reader on a phone screen.","para":1},"f09-s03":{"file":"f09","text":"Placeholder sentence 3 of paragraph 2 for Golf, written only to test the layout of the reader on a phone screen.","para":2},"f09-s04":{"file":"f09","text":"Placeholder sentence 4 of paragraph 2 for Golf, written only to test the layout of the reader on a phone screen.","para":2},"f09-s05":{"file":"f09","text":"Placeholder sentence 5 of paragraph 3 for Golf, written only to test the layout of the reader on a phone screen.","para":3},"f09-s06":{"file":"f09","text":"Placeholder sentence 6 of paragraph 3 for Golf, written only to test the layout of the reader on a phone screen.","para":3},"f09-s07":{"file":"f09","text":"Placeholder sentence 7 of paragraph 4 for Golf, written only to test the layout of the reader on a phone screen.","para":4},"f09-a1":{"file":"f09","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f09-a2":{"file":"f09","text":"Helped at a placeholder event, which was great."},"f10-s01":{"file":"f10","text":"Placeholder sentence 1 of paragraph 1 for Noon, written only to test the layout of the reader on a phone screen.","para":1},"f10-s02":{"file":"f10","text":"Placeholder sentence 2 of paragraph 1 for Noon, written only to test the layout of the reader on a phone screen.","para":1},"f10-s03":{"file":"f10","text":"Placeholder sentence 3 of paragraph 2 for Noon, written only to test the layout of the reader on a phone screen.","para":2},"f10-s04":{"file":"f10","text":"Placeholder sentence 4 of paragraph 2 for Noon, written only to test the layout of the reader on a phone screen.","para":2},"f10-s05":{"file":"f10","text":"Placeholder sentence 5 of paragraph 3 for Noon, written only to test the layout of the reader on a phone screen.","para":3},"f10-s06":{"file":"f10","text":"Placeholder sentence 6 of paragraph 3 for Noon, written only to test the layout of the reader on a phone screen.","para":3},"f10-s07":{"file":"f10","text":"Placeholder sentence 7 of paragraph 4 for Noon, written only to test the layout of the reader on a phone screen.","para":4},"f10-a1":{"file":"f10","text":"Organised 3 placeholder workshops for 40 students, resulting in a new reading club at school."},"f10-a2":{"file":"f10","text":"Helped at a placeholder event, which was great."}},"files":{"f01":{"paras":["Placeholder sentence 1 of paragraph 1 for Mook, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Mook, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Mook, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Mook, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Mook, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Mook, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Mook, written only to test the layout of the reader on a phone screen."],"units":["f01-s01","f01-s02","f01-s03","f01-s04","f01-s05","f01-s06","f01-s07","f01-a1","f01-a2"]},"f02":{"paras":["Placeholder sentence 1 of paragraph 1 for Earth, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Earth, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Earth, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Earth, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Earth, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Earth, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Earth, written only to test the layout of the reader on a phone screen."],"units":["f02-s01","f02-s02","f02-s03","f02-s04","f02-s05","f02-s06","f02-s07","f02-a1","f02-a2"]},"f03":{"paras":["One evening in 2024 I found a week of my grandmother's diabetes tablets still in their box.","I drew sun-and-moon picture labels, one dot per tablet, and Nurse Somjit tried them at our health centre. Among 18 elderly patients, the leftover tablets she counted fell from 61 to 22 in 12 weeks. That result turned my interest into a passion for medicine.","In the Year 1 Bridge Project I would test the labels at a clinic for migrant workers who cannot read Thai. In the Crossing Seminars, a design student could draw them better than I did.","After the Year 3 internship, I hope to give back to my community as a family doctor."],"units":["f03-s01","f03-s02","f03-s03","f03-s04","f03-s05","f03-s06","f03-s07","f03-a1","f03-a2"]},"f04":{"paras":["Placeholder sentence 1 of paragraph 1 for Nont, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Nont, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Nont, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Nont, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Nont, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Nont, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Nont, written only to test the layout of the reader on a phone screen."],"units":["f04-s01","f04-s02","f04-s03","f04-s04","f04-s05","f04-s06","f04-s07","f04-a1","f04-a2"]},"f05":{"paras":["In June 2026 my cousin broke his jaw in a motorbike crash outside our school; he had no helmet.","Two friends and I then counted riders at the gate for 10 mornings: only 97 of 412 wore one. The deputy director saw our numbers and agreed to a helmet rack. A month later, 131 of 405 wore one: better, but not enough.","I am applying because the first-year community project in the Kingsmead Scholars Programme would let me study this problem with a partner organisation. In the mixed-faculty seminars, I want an engineer to tell me why our rack stayed half empty.","To me, public health means counting carefully, then changing one small thing."],"units":["f05-s01","f05-s02","f05-s03","f05-s04","f05-s05","f05-s06","f05-s07","f05-a1","f05-a2"]},"f06":{"paras":["Placeholder sentence 1 of paragraph 1 for Tee, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Tee, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Tee, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Tee, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Tee, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Tee, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Tee, written only to test the layout of the reader on a phone screen."],"units":["f06-s01","f06-s02","f06-s03","f06-s04","f06-s05","f06-s06","f06-s07","f06-a1","f06-a2"]},"f07":{"paras":["Placeholder sentence 1 of paragraph 1 for Nan, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Nan, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Nan, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Nan, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Nan, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Nan, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Nan, written only to test the layout of the reader on a phone screen."],"units":["f07-s01","f07-s02","f07-s03","f07-s04","f07-s05","f07-s06","f07-s07","f07-a1","f07-a2"]},"f08":{"paras":["Placeholder sentence 1 of paragraph 1 for Oat, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Oat, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Oat, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Oat, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Oat, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Oat, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Oat, written only to test the layout of the reader on a phone screen."],"units":["f08-s01","f08-s02","f08-s03","f08-s04","f08-s05","f08-s06","f08-s07","f08-a1","f08-a2"]},"f09":{"paras":["Placeholder sentence 1 of paragraph 1 for Golf, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Golf, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Golf, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Golf, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Golf, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Golf, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Golf, written only to test the layout of the reader on a phone screen."],"units":["f09-s01","f09-s02","f09-s03","f09-s04","f09-s05","f09-s06","f09-s07","f09-a1","f09-a2"]},"f10":{"paras":["Placeholder sentence 1 of paragraph 1 for Noon, written only to test the layout of the reader on a phone screen. Placeholder sentence 2 of paragraph 1 for Noon, written only to test the layout of the reader on a phone screen.","Placeholder sentence 3 of paragraph 2 for Noon, written only to test the layout of the reader on a phone screen. Placeholder sentence 4 of paragraph 2 for Noon, written only to test the layout of the reader on a phone screen.","Placeholder sentence 5 of paragraph 3 for Noon, written only to test the layout of the reader on a phone screen. Placeholder sentence 6 of paragraph 3 for Noon, written only to test the layout of the reader on a phone screen.","Placeholder sentence 7 of paragraph 4 for Noon, written only to test the layout of the reader on a phone screen."],"units":["f10-s01","f10-s02","f10-s03","f10-s04","f10-s05","f10-s06","f10-s07","f10-a1","f10-a2"]}},"banList":[{"id":"c01","cliche":"passion / passionate","patterns":["\\bpassion(s|ate|ately)?\\b"]},{"id":"c02","cliche":"ever since I was a child","patterns":["\\b(ever )?since i was (a )?(child|kid|little|young)\\b"]},{"id":"c03","cliche":"from a young age","patterns":["\\bfrom a (very )?young age\\b","\\bat a young age\\b"]},{"id":"c04","cliche":"dream (my dream, dream job, dream university)","patterns":["\\bdream(s|ed|ing|y)?\\b"]},{"id":"c05","cliche":"I have always wanted / always been interested","patterns":["\\balways (wanted|been interested|loved|been fascinated|had an interest)\\b"]},{"id":"c06","cliche":"broaden my horizons","patterns":["\\bbroaden(ing)? (my|our|her|their) horizons?\\b"]},{"id":"c07","cliche":"make a difference","patterns":["\\bmake a (real |big |positive )?difference\\b"]},{"id":"c08","cliche":"make the world a better place","patterns":["\\bmake the world a better place\\b","\\bchange the world\\b"]},{"id":"c09","cliche":"I want to help people","patterns":["\\bhelp(ing)? (other )?people\\b","\\bhelp(ing)? others\\b"]},{"id":"c10","cliche":"hard-working","patterns":["\\bhard[- ]?working\\b"]},{"id":"c11","cliche":"team player","patterns":["\\bteam player\\b"]},{"id":"c12","cliche":"people person","patterns":["\\bpeople person\\b"]},{"id":"c13","cliche":"strong leadership skills","patterns":["\\b(strong|excellent|good) leadership skills\\b"]},{"id":"c14","cliche":"think outside the box","patterns":["\\bthink(ing)? outside (of )?the box\\b"]},{"id":"c15","cliche":"step out of my comfort zone","patterns":["\\b(step(ped|ping)? (out of|outside) (my|her|your) )?comfort zone\\b"]},{"id":"c16","cliche":"give back to society / the community","patterns":["\\bgive back to (the |my |our )?(society|community)\\b"]},{"id":"c17","cliche":"a perfect fit","patterns":["\\b(a )?perfect fit\\b"]},{"id":"c18","cliche":"world-class / prestigious","patterns":["\\bworld[- ]class\\b","\\bprestigious\\b"]},{"id":"c19","cliche":"life-changing","patterns":["\\blife[- ]chang(ing|er)\\b"]},{"id":"c20","cliche":"eye-opening","patterns":["\\beye[- ]open(ing|er)\\b"]},{"id":"c21","cliche":"I learned so much","patterns":["\\blearn(ed|t) so much\\b","\\blearn(ed|t) a lot\\b"]},{"id":"c22","cliche":"once-in-a-lifetime / unique opportunity","patterns":["\\bonce[- ]in[- ]a[- ]lifetime\\b","\\bunique opportunity\\b"]},{"id":"c23","cliche":"go above and beyond","patterns":["\\babove and beyond\\b"]},{"id":"c24","cliche":"my journey","patterns":["\\bjourney\\b"]},{"id":"c25","cliche":"in today's fast-paced world","patterns":["\\bin today'?s (fast[- ]paced |modern |changing )?world\\b","\\bin this modern (era|age|world)\\b"]},{"id":"c26","cliche":"at the end of the day","patterns":["\\bat the end of the day\\b"]},{"id":"c27","cliche":"reach my full potential","patterns":["\\b(reach|fulfil|fulfill|achieve) (my|her|your) (full )?potential\\b"]},{"id":"c28","cliche":"I am a perfectionist","patterns":["\\bperfectionist\\b"]},{"id":"c29","cliche":"the dictionary defines…","patterns":["\\bdictionary defines\\b","\\baccording to the dictionary\\b"]},{"id":"c30","cliche":"the rest is history","patterns":["\\bthe rest is history\\b"]}],"verbBank":["Led","Organised","Coordinated","Chaired","Managed","Directed","Founded","Launched","Captained","Hosted","Designed","Built","Created","Developed","Wrote","Produced","Programmed","Illustrated","Composed","Prototyped","Improved","Reduced","Increased","Raised","Cut","Fixed","Streamlined","Redesigned","Solved","Doubled","Researched","Analysed","Surveyed","Measured","Tested","Investigated","Interviewed","Tracked","Compared","Calculated","Taught","Tutored","Mentored","Trained","Coached","Guided","Supported","Assisted","Volunteered","Translated","Presented","Pitched","Negotiated","Persuaded","Explained","Published","Edited","Debated","Represented","Promoted"],"lineCheck":{"numberPattern":"\\d","resultMarkers":["resulting in","which","so that","leading to","earning","helping","cutting","raising","saving","winning"],"maxWords":22,"verb":"The first word must be a verb from the bank (past form).","number":"The line must contain a number (digits), e.g. 3, 120, 2025, 6 weeks.","result":"The line must contain a result clause."}}; /* @@CONTENT-END@@ */
/* @@CORE-BEGIN@@ */ 
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

var CORE = (typeof SSCore !== "undefined") ? SSCore : null;
 /* @@CORE-END@@ */

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function st_() {
  var s = P.getProperty('state');
  s = s ? JSON.parse(s) : {phase: 'lobby', endsAt: 0, running: false, epoch: '1', decision: null, notes: false, fixAssign: null};
  if (s.running && s.endsAt && Date.now() > s.endsAt) s.running = false;
  return s;
}
function save_(s) { P.setProperty('state', JSON.stringify(s)); }
function key_(name) { return 'I:' + String(name).toLowerCase(); }
function clean_(t, n) { return String(t == null ? '' : t).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); }
function panelNo_(p) { p = String(parseInt(p, 10)); return /^(10|[1-9])$/.test(p) ? p : ''; }
function fileId_(x) { x = String(x); return /^f(0[1-9]|10)$/.test(x) && CONTENT.files[x] ? x : ''; }
function order_(a) {
  if (!a || a.length !== 10) return null;
  var seen = {}, o = [];
  for (var i = 0; i < 10; i++) { var id = fileId_(a[i]); if (!id || seen[id]) return null; seen[id] = 1; o.push(id); }
  return o;
}
function ids_(a, max) { var o = []; arr_(a).forEach(function (x) { x = fileId_(x); if (x && o.indexOf(x) < 0) o.push(x); }); return o.slice(0, max); }
function words_(t) { t = String(t || '').trim(); return t ? t.split(/\s+/).length : 0; }
function unit_(u) { u = String(u || ''); return Object.prototype.hasOwnProperty.call(CONTENT.units, u) ? u : ''; }
var GRACE_MS = 30000, MAX_NAMES = 60, MAX_FIX = 60;
function grace_(s, phase) { return s.phase === phase && Date.now() - (s.phaseAt || 0) < GRACE_MS; }   // auto-send window after a phase change
function count_(prefix) { var n = 0, all = P.getProperties(); for (var k in all) if (k.indexOf(prefix) === 0) n++; return n; }
function arr_(a) { return Array.isArray(a) ? a : []; }
function marks_(m, c) {
  var marks = {}, concerns = {}, n = 0;
  for (var u in (m || {})) {
    if (n >= 150) break;
    var id = unit_(u), v = String(m[u]);
    if (!id || ['e', 'c', 'f'].indexOf(v) < 0) continue;
    marks[id] = v; n++;
    if (v === 'f') {
      var r = parseInt((c || {})[u], 10);
      concerns[id] = (r >= 0 && r <= 8) ? r : null;   // a 🚩 without a reason stays a 🚩, with no reason
    }
  }
  return {marks: marks, concerns: concerns};
}
function all_() {
  var all = P.getProperties(), ind = [], pan = [], heads = {}, fixes = [];
  for (var k in all) {
    try {
      if (k.indexOf('I:') === 0) ind.push(JSON.parse(all[k]));
      else if (k.indexOf('P:') === 0) pan.push(JSON.parse(all[k]));
      else if (k.indexOf('H:') === 0) heads[k.slice(2)] = all[k];
      else if (k.indexOf('F:') === 0) fixes.push(JSON.parse(all[k]));
    } catch (err) {}
  }
  return {ind: ind, pan: pan, heads: heads, fixes: fixes};
}
function notes_() { return typeof NOTES !== 'undefined' ? NOTES : null; }
function eye_(rec, withMissed) {
  var N = notes_();
  if (!N || !CORE) return null;
  var r = CORE.clicheEye(rec, N, CONTENT);
  if (!withMissed) delete r.missed;
  return r;
}
function lowFor_(s, name, panel) {
  if (!s.fixAssign) return null;
  if (panel && s.fixAssign.panels[panel]) return s.fixAssign.panels[panel];   // in class and as homework: the panel's file
  var N = notes_();
  return N && CORE ? CORE.fixForSolo(name, N) : null;                       // solo practice (no panel)
}

function doGet(e) {
  var p = (e && e.parameter) || {}, a = p.action || 'state', s = st_();
  if (a === 'state') return out({ok: true, state: s, now: Date.now()});
  if (a === 'scores') {
    if (LATE.indexOf(s.phase) < 0) return out({ok: true, score: null, locked: true, now: Date.now()});
    var raw = P.getProperty(key_(clean_(p.name, 20)));
    if (!raw) return out({ok: true, score: null, now: Date.now()});
    var rec0 = JSON.parse(raw);
    if (!rec0.order) return out({ok: true, score: null, noRanking: true, now: Date.now()});   // only a student who sent a ranking gets a score (and names are capped at 60), so probe names cannot read the key
    var sc = eye_(rec0, true), missed = sc ? sc.missed : null;
    if (sc) delete sc.missed;
    return out(s.notes ? {ok: true, score: sc, missed: missed, now: Date.now()} : {ok: true, score: sc, now: Date.now()});
  }
  if (a === 'fixFor') {
    if (s.phase !== 'fix' || !s.fixAssign) return out({ok: true, fileId: null, now: Date.now()});
    var fid = lowFor_(s, clean_(p.name, 20), panelNo_(p.panel));
    return out({ok: true, fileId: fid, homework: !!s.fixAssign.homework, now: Date.now()});
  }
  var A = all_();
  if (a === 'panel') {
    var pn = panelNo_(p.panel);
    var members = A.ind.filter(function (m) { return String(m.panel) === pn; });
    var sub = A.pan.filter(function (x) { return String(x.panel) === pn; })[0] || null;
    return out({ok: true, panel: pn, members: members, head: A.heads[pn] || null, submission: sub, state: s, now: Date.now()});
  }
  if (a === 'board') {
    var scores = null;
    if (LATE.indexOf(s.phase) > -1 && notes_() && CORE) {
      scores = {};
      A.ind.forEach(function (r) {
        var x = eye_(r, false);
        if (r.order) scores[String(r.name).toLowerCase()] = x;
      });
    }
    return out({ok: true, state: s, individuals: A.ind, panels: A.pan, heads: A.heads, fixes: A.fixes, scores: scores,
                notes: s.notes ? notes_() : null, now: Date.now()});
  }
  return out({ok: false, error: 'unknown action'});
}

function doPost(e) {
  try { return post_(e); } catch (err) { return out({ok: false, error: 'server error'}); }   // never an HTML error page, never a stack
}
function post_(e) {
  var b = {};
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ok: false, error: 'bad json'}); }
  if (!b || typeof b !== 'object') return out({ok: false, error: 'bad json'});
  var a = b.action, s = st_();
  // student actions carry the game epoch; a stale phone is told to start again
  if (['individual', 'setPanel', 'claimHead', 'panel', 'fix'].indexOf(a) > -1 && String(b.epoch) !== String(s.epoch) && !(a === 'fix' && b.epoch == null))
    return out({ok: true, stale: true, state: s, now: Date.now()});

  if (a === 'register' || a === 'setPanel') {
    var name = clean_(b.name, 20), pn = panelNo_(b.panel);
    if (!name || !pn) return out({ok: false, error: 'name and panel 1-10 needed'});
    var k = key_(name), cur = P.getProperty(k), rec = cur ? JSON.parse(cur) : {name: name, order: null, opened: [], marks: {}, concerns: {}};
    if (!cur && count_('I:') >= MAX_NAMES) return out({ok: false, error: 'the class is full'});
    rec.name = name; rec.panel = pn; rec.at = rec.at || Date.now();
    P.setProperty(k, JSON.stringify(rec));
    return out({ok: true, state: s, now: Date.now(), saved: rec});
  }
  if (a === 'individual') {
    var nm = clean_(b.name, 20), pn2 = panelNo_(b.panel);
    if (!nm) return out({ok: false, error: 'name needed'});
    var k2 = key_(nm), old = P.getProperty(k2);
    if (!old) return out({ok: false, error: 'join first', state: s});            // only register creates a student key (capped there)
    var r2 = JSON.parse(old);
    var late = !!b.auto && grace_(s, 'r2');                                       // the auto-send that follows Stop / Start Round 2
    var marksOpen = s.phase === 'preview' || s.phase === 'r1' || late;
    var rankOpen = s.phase === 'r1' || late;
    if (b.order != null) {
      var o = order_(b.order);
      if (!o) return out({ok: false, error: 'bad ranking'});
      if (!rankOpen) return out({ok: false, error: 'ranking is closed', state: s});
      r2.order = o; r2.sentAt = Date.now(); r2.auto = !!b.auto;
    }
    if (marksOpen && b.marks && typeof b.marks === 'object' && !Array.isArray(b.marks)) {
      var mk = marks_(b.marks, b.concerns);
      r2.marks = mk.marks; r2.concerns = mk.concerns;
      var op = ids_(b.opened, 10);
      (r2.opened || []).forEach(function (x) { if (op.indexOf(x) < 0) op.push(x); });
      r2.opened = op;
    } else if (!marksOpen && b.order == null) return out({ok: false, error: 'marking is closed', state: s});
    r2.name = nm; r2.panel = pn2 || r2.panel; r2.at = Date.now();
    P.setProperty(k2, JSON.stringify(r2));
    return out({ok: true, now: Date.now()});
  }
  if (a === 'claimHead') {
    var pn3 = panelNo_(b.panel), who = clean_(b.name, 20);
    if (!pn3 || !who) return out({ok: false, error: 'panel and name needed'});
    var lock = LockService.getScriptLock(); lock.waitLock(8000);
    try {
      var h = P.getProperty('H:' + pn3);
      if (h && h.toLowerCase() !== who.toLowerCase()) return out({ok: false, head: h});
      P.setProperty('H:' + pn3, who);
      return out({ok: true, head: who});
    } finally { lock.releaseLock(); }
  }
  if (a === 'panel') {
    var pn4 = panelNo_(b.panel), hd = clean_(b.head, 20), o4 = order_(b.order);
    if (!pn4 || !hd || !o4) return out({ok: false, error: 'bad panel submission'});
    if (!(s.phase === 'r2' || (b.auto && grace_(s, 'r3')))) return out({ok: false, error: 'the panel form is closed', state: s});
    var cur4 = P.getProperty('H:' + pn4);
    if (cur4 && cur4.toLowerCase() !== hd.toLowerCase()) return out({ok: false, head: cur4});
    if (!cur4) P.setProperty('H:' + pn4, hd);
    var rs = b.reasons || {}, at = b.attach || {}, recs = {}, rin = b.recs || {}, slots = ['s', 'o2', 'o3'];
    var reasons = {}, attach = {};
    for (var i = 0; i < 3; i++) {
      var sl = slots[i], txt = clean_(rs[sl], 600), u = unit_(at[sl]);
      if (u && CONTENT.units[u].file !== o4[i]) u = '';
      if (!b.auto && words_(txt) < 15) return out({ok: false, error: 'each reason needs at least 15 words', slot: sl});
      if (!b.auto && !u) return out({ok: false, error: 'attach one sentence from that file to each reason', slot: sl});
      reasons[sl] = txt; attach[sl] = u;
    }
    o4.slice(7).forEach(function (id) { recs[id] = arr_(rin[id]).map(String).filter(function (x) { return /^r([1-9]|10)$/.test(x); }).slice(0, 2); });
    var sub = {panel: pn4, head: hd, members: arr_(b.members).map(function (m) { return clean_(m, 20); }).filter(String).slice(0, 4),
               order: o4, reasons: reasons, attach: attach, recs: recs, auto: !!b.auto, at: Date.now()};
    P.setProperty('P:' + pn4, JSON.stringify(sub));
    return out({ok: true, now: Date.now()});
  }
  if (a === 'fix') {
    if (s.phase !== 'fix' || !s.fixAssign) return out({ok: false, error: 'Fix-it is not open'});
    var fn = clean_(b.name, 20), me = fn ? P.getProperty(key_(fn)) : null;
    var fp = me ? panelNo_(JSON.parse(me).panel) : '';                            // the panel she joined, never the one in the request; no record = solo practice
    var want = lowFor_(s, fn, fp), fid2 = fileId_(b.fileId);
    if (!fn || !want || fid2 !== want) return out({ok: false, error: 'not your file'});
    var tg = String(b.target || ''), file = CONTENT.files[fid2], original = '';
    if (/^p[1-4]$/.test(tg)) original = file.paras[Number(tg.slice(1)) - 1] || '';
    else if (/^a[12]$/.test(tg)) original = CONTENT.units[fid2 + '-' + tg] ? CONTENT.units[fid2 + '-' + tg].text : '';
    if (!original) return out({ok: false, error: 'bad target'});
    var text = clean_(b.text, 900), cap = tg.charAt(0) === 'p' ? 70 : 22;
    if (!text) return out({ok: false, error: 'too long or empty'});
    if (b.auto) text = text.split(/\s+/).slice(0, cap).join(' ');               // an unfinished draft is kept, cut at the word cap
    var checks = CORE ? CORE.checkFix(tg, text, original, CONTENT) : {ok: false};
    if (checks.tooLong) return out({ok: false, error: 'too long or empty', checks: checks});
    var homeworkOrSolo = s.fixAssign.homework || !fp;
    var fk = homeworkOrSolo ? 'F:n:' + fn.toLowerCase() : 'F:' + fp;
    if (!homeworkOrSolo) {
      var hd5 = P.getProperty('H:' + fp);
      if (!hd5) P.setProperty('H:' + fp, fn);                                     // first sender becomes head, as in 'panel'
      else if (hd5.toLowerCase() !== fn.toLowerCase()) return out({ok: false, error: 'only the head of panel sends Fix-it in class', head: hd5});
    } else if (P.getProperty(fk) === null && count_('F:n:') >= MAX_FIX) return out({ok: false, error: 'the class is full'});
    var rec5 = {panel: fp, name: fn, fileId: fid2, target: tg, text: text, checks: checks, auto: !!b.auto, at: Date.now()};
    P.setProperty(fk, JSON.stringify(rec5));
    return out({ok: true, checks: checks, now: Date.now()});
  }
  // ---- teacher actions (no PIN, as the Shortlist: never show the board address) ----
  if (a === 'phase') {
    if (PHASES.indexOf(b.phase) < 0) return out({ok: false, error: 'bad phase'});
    var m = Math.max(0, Math.min(60, Number(b.minutes) || 0));
    if (s.phase !== b.phase) s.phaseAt = Date.now();
    s.phase = b.phase; s.phaseMin = m; s.running = m > 0; s.endsAt = m > 0 ? Date.now() + m * 60000 : 0;
    save_(s); return out({ok: true, state: s, now: Date.now()});
  }
  if (a === 'stop') { s.running = false; s.endsAt = Math.min(s.endsAt || Date.now(), Date.now()); save_(s); return out({ok: true, state: s, now: Date.now()}); }
  if (a === 'decision') {
    var offers = ids_(b.offers, 3), sch = String(b.scholar || '');
    if (offers.length && offers.indexOf(sch) < 0) return out({ok: false, error: 'scholar must be one of the offers'});
    s.decision = offers.length ? {offers: offers, scholar: sch} : null; save_(s); return out({ok: true, state: s});
  }
  if (a === 'notes') { s.notes = !!b.on; save_(s); return out({ok: true, state: s}); }
  if (a === 'fixAssign') {
    var N = notes_();
    if (!s.notes || !N || !CORE) return out({ok: false, error: 'reveal the designer\'s notes first'});
    var panels = CORE.fixAssignment([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], N);
    if (!panels || !panels['1']) return out({ok: false, error: 'the key has no low files 1-3'});
    s.fixAssign = {panels: panels, homework: !!b.homework};
    s.phase = 'fix'; s.phaseAt = Date.now(); s.phaseMin = Math.max(0, Math.min(60, Number(b.minutes) || 0)); s.running = s.phaseMin > 0;
    s.endsAt = s.running ? Date.now() + s.phaseMin * 60000 : 0;
    save_(s); return out({ok: true, state: s, now: Date.now()});
  }
  if (a === 'reset') {
    var ep = String(Number(s.epoch || 1) + 1);
    P.deleteAllProperties();
    save_({phase: 'lobby', endsAt: 0, running: false, epoch: ep, decision: null, notes: false, fixAssign: null});
    return out({ok: true});
  }
  return out({ok: false, error: 'unknown action'});
}
