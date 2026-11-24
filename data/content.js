/* The Statement Shortlist — public content. All on-screen wording lives here (ui at the end).
   The designer's key (tiers, which file is which, the evidence/cliché/concern key) is NOT in this file: it lives in the
   Apps Script project (Notes.gs) and reaches the teacher board only when the teacher reveals it.
   Programme and files are written by tools/assemble-content.js between the @@ markers. */
window.SL = {
  meta: {
    title: 'The Statement Shortlist',
    programme: 'Lotus Bridge Scholarship',
    blurb: 'An international university in Bangkok is choosing the first students for its Lotus Bridge Scholarship. Ten applicants sent a short personal statement and two activity lines. There are three places, and the best of the three also wins the full scholarship.',
    version: '1.0.0',
    audio: true
  },

  purposes: [
  "Read a statement as an admissions reader does: evidence first, clichés and claims second.",
  "Check that the statement and the activity list tell the same story.",
  "Agree a decision with people who read it differently, and point to the sentence that decided it.",
  "Fix a weak paragraph using the Module 2 tools (activity-line formula, cliché list)."
],

  programme: /* @@PROGRAMME-BEGIN@@ */ {
  "name": "Lotus Bridge Scholarship",
  "university": "Bang Rak International University",
  "brief": "The Lotus Bridge Scholarship at Bang Rak International University is open to applicants from all ten faculties. Readers look for a real reason for choosing your subject, evidence of what you did yourself, and honest reflection. Show how you would use three features: the Year 1 Bridge Project, a community project with a partner organisation; the weekly Crossing Seminars, taught in English with students from every faculty; and the required ten-week internship in Year 3.",
  "features": [
    "Year 1 Bridge Project: a year-long community project with a partner organisation in Bangkok, such as a clinic, a school or a small business.",
    "Crossing Seminars: weekly English-medium seminars in which students from every faculty work on one problem together.",
    "Year 3 internship: a required ten-week placement in Thailand or another ASEAN country."
  ]
} /* @@PROGRAMME-END@@ */,

  /* What a strong file shows. Briefing, help sheet and debrief. */
  criteria: [
  {
    "id": "motivation",
    "name": "Genuine motivation",
    "look": "A real, specific reason for applying, shown by something that happened, not a slogan."
  },
  {
    "id": "evidence",
    "name": "Specific evidence",
    "look": "Names, numbers and dates, and what the applicant did personally."
  },
  {
    "id": "fit",
    "name": "Fit with the programme",
    "look": "Links to the programme's real features, not to any university."
  },
  {
    "id": "reflection",
    "name": "Reflection",
    "look": "What the applicant learned and now does differently."
  },
  {
    "id": "honesty",
    "name": "Honesty and consistency",
    "look": "The statement and the activity list tell the same story; nothing is copied or inflated."
  },
  {
    "id": "clarity",
    "name": "Clear writing",
    "look": "The meaning is clear to an international reader. Content matters more than perfect grammar."
  }
],

  /* Round 1 sentence marks: one per sentence or activity line. */
  markTypes: [
  {
    "id": "e",
    "label": "Evidence",
    "icon": "✓",
    "look": "A fact a reader could check: a name, a number, a date, a result, what the applicant did personally."
  },
  {
    "id": "c",
    "label": "Cliché",
    "icon": "✗",
    "look": "A phrase from the Module 2 cliché list (Help shows all 30)."
  },
  {
    "id": "f",
    "label": "Concern",
    "icon": "🚩",
    "look": "Something a careful reader should question. Choose one reason."
  }
],

  /* Reasons for a 🚩 Concern: the six Shortlist red flags, then three for written files. Index 0–8 is stored. */
  concernReasons: [
  "Chooses a dishonest or unethical action",
  "Blames other people",
  "Disrespectful or judgemental language",
  "Avoids the question or never decides",
  "Sounds memorised, not real",
  "Bluffs about something they do not know",
  "Claim does not match the activity list",
  "Wrong programme or copied text",
  "Sounds generic or AI-written"
],

  /* Advice the panel gives to its bottom three (two per file). */
  recs: [
  {
    "id": "r1",
    "text": "Add a number, a date or a name to your evidence."
  },
  {
    "id": "r2",
    "text": "Show what you did yourself, not only the team."
  },
  {
    "id": "r3",
    "text": "Explain why this programme, not any university."
  },
  {
    "id": "r4",
    "text": "Cut the clichés and say what actually happened."
  },
  {
    "id": "r5",
    "text": "Make your activity list match your statement."
  },
  {
    "id": "r6",
    "text": "Say what you learned and what you do now."
  },
  {
    "id": "r7",
    "text": "Use your own words: it sounds generic."
  },
  {
    "id": "r8",
    "text": "Check every name in your statement before you send it."
  },
  {
    "id": "r9",
    "text": "Start with a real moment, not a slogan."
  },
  {
    "id": "r10",
    "text": "Give one example instead of a list of titles."
  }
],

  /* Module 2 tools, copied (not fetched) from ELF Studio. */
  banSource: {
  "from": "pegasus028/ELF elf-content.json rooms.clicheHunter.banList, rewriteRule; rooms.lineUpgrader.verbBank, formula, check",
  "elfVersion": "1.0.0",
  "elfIssued": "2026-10-27",
  "copied": "2026-11-24"
},
  banList: [
  {
    "id": "c01",
    "cliche": "passion / passionate",
    "example": "I have a passion for… / I am passionate about…",
    "patterns": [
      "\\bpassion(s|ate|ately)?\\b"
    ],
    "replacement": "Say what you did and how often: 'I have spent every Saturday since May 2025 at the clinic desk.'"
  },
  {
    "id": "c02",
    "cliche": "ever since I was a child",
    "example": "Ever since I was a child, I have…",
    "patterns": [
      "\\b(ever )?since i was (a )?(child|kid|little|young)\\b"
    ],
    "replacement": "Give the date and the event: 'In Grade 9, when my grandmother had a stroke…'"
  },
  {
    "id": "c03",
    "cliche": "from a young age",
    "example": "From a young age, I…",
    "patterns": [
      "\\bfrom a (very )?young age\\b",
      "\\bat a young age\\b"
    ],
    "replacement": "Name the age and what happened: 'At 13, I took apart our broken fan.'"
  },
  {
    "id": "c04",
    "cliche": "dream (my dream, dream job, dream university)",
    "example": "It has always been my dream to…",
    "patterns": [
      "\\bdream(s|ed|ing|y)?\\b"
    ],
    "replacement": "State the goal plainly: 'I want to train as a dentist and work in a provincial hospital.'"
  },
  {
    "id": "c05",
    "cliche": "I have always wanted / always been interested",
    "example": "I have always been interested in…",
    "patterns": [
      "\\balways (wanted|been interested|loved|been fascinated|had an interest)\\b"
    ],
    "replacement": "Show when the interest started and what you did about it: 'After the 2025 floods, I started measuring…'"
  },
  {
    "id": "c06",
    "cliche": "broaden my horizons",
    "example": "This programme will broaden my horizons.",
    "patterns": [
      "\\bbroaden(ing)? (my|our|her|their) horizons?\\b"
    ],
    "replacement": "Name what you want to learn: 'learn how Australian hospitals train nurses to triage.'"
  },
  {
    "id": "c07",
    "cliche": "make a difference",
    "example": "I want to make a difference.",
    "patterns": [
      "\\bmake a (real |big |positive )?difference\\b"
    ],
    "replacement": "Say who will be better off and how: 'cut waiting times for elderly patients in my district.'"
  },
  {
    "id": "c08",
    "cliche": "make the world a better place",
    "example": "…to make the world a better place.",
    "patterns": [
      "\\bmake the world a better place\\b",
      "\\bchange the world\\b"
    ],
    "replacement": "Pick one place and one problem: 'reduce plastic waste at Chatuchak market stalls.'"
  },
  {
    "id": "c09",
    "cliche": "I want to help people",
    "example": "I want to become a doctor because I want to help people.",
    "patterns": [
      "\\bhelp(ing)? (other )?people\\b",
      "\\bhelp(ing)? others\\b"
    ],
    "replacement": "Say which people and what help: 'explain a diagnosis to patients who only speak Isan.'"
  },
  {
    "id": "c10",
    "cliche": "hard-working",
    "example": "I am a hard-working student.",
    "patterns": [
      "\\bhard[- ]?working\\b"
    ],
    "replacement": "Show the effort with a number: 'I rebuilt the prototype 14 times in 6 weeks.'"
  },
  {
    "id": "c11",
    "cliche": "team player",
    "example": "I am a team player.",
    "patterns": [
      "\\bteam player\\b"
    ],
    "replacement": "Say what you did in the team: 'I wrote the code; my two partners built the frame.'"
  },
  {
    "id": "c12",
    "cliche": "people person",
    "example": "I am a people person.",
    "patterns": [
      "\\bpeople person\\b"
    ],
    "replacement": "Give one example of working with people: 'I calmed 30 anxious children before their check-ups.'"
  },
  {
    "id": "c13",
    "cliche": "strong leadership skills",
    "example": "I have strong leadership skills.",
    "patterns": [
      "\\b(strong|excellent|good) leadership skills\\b"
    ],
    "replacement": "Show a time you led: 'I led 6 volunteers and set the weekly rota.'"
  },
  {
    "id": "c14",
    "cliche": "think outside the box",
    "example": "I like to think outside the box.",
    "patterns": [
      "\\bthink(ing)? outside (of )?the box\\b"
    ],
    "replacement": "Describe the unusual idea itself: 'I used ice-cream sticks to test bridge shapes.'"
  },
  {
    "id": "c15",
    "cliche": "step out of my comfort zone",
    "example": "This made me step out of my comfort zone.",
    "patterns": [
      "\\b(step(ped|ping)? (out of|outside) (my|her|your) )?comfort zone\\b"
    ],
    "replacement": "Say what was new and hard: 'I gave my first talk in English to 200 parents.'"
  },
  {
    "id": "c16",
    "cliche": "give back to society / the community",
    "example": "I want to give back to society.",
    "patterns": [
      "\\bgive back to (the |my |our )?(society|community)\\b"
    ],
    "replacement": "Name who benefits and how: 'run free screening days at my old primary school.'"
  },
  {
    "id": "c17",
    "cliche": "a perfect fit",
    "example": "This programme is a perfect fit for me.",
    "patterns": [
      "\\b(a )?perfect fit\\b"
    ],
    "replacement": "Name one feature of the programme and one thing you have done that matches it."
  },
  {
    "id": "c18",
    "cliche": "world-class / prestigious",
    "example": "…your prestigious, world-class university.",
    "patterns": [
      "\\bworld[- ]class\\b",
      "\\bprestigious\\b"
    ],
    "replacement": "Name the specific feature: 'the year of study at a partner university abroad.'"
  },
  {
    "id": "c19",
    "cliche": "life-changing",
    "example": "It was a life-changing experience.",
    "patterns": [
      "\\blife[- ]chang(ing|er)\\b"
    ],
    "replacement": "Say what changed: 'Afterwards I switched my elective from art to biology.'"
  },
  {
    "id": "c20",
    "cliche": "eye-opening",
    "example": "The trip was eye-opening.",
    "patterns": [
      "\\beye[- ]open(ing|er)\\b"
    ],
    "replacement": "Say what you saw that you had not known: 'I had never seen a dentist work without electricity.'"
  },
  {
    "id": "c21",
    "cliche": "I learned so much",
    "example": "I learned so much from this experience.",
    "patterns": [
      "\\blearn(ed|t) so much\\b",
      "\\blearn(ed|t) a lot\\b"
    ],
    "replacement": "Name one thing you learned: 'I learned to check a dog's gums for dehydration.'"
  },
  {
    "id": "c22",
    "cliche": "once-in-a-lifetime / unique opportunity",
    "example": "It was a once-in-a-lifetime opportunity.",
    "patterns": [
      "\\bonce[- ]in[- ]a[- ]lifetime\\b",
      "\\bunique opportunity\\b"
    ],
    "replacement": "Say what the opportunity was: 'a 5-day placement at a district hospital.'"
  },
  {
    "id": "c23",
    "cliche": "go above and beyond",
    "example": "I always go above and beyond.",
    "patterns": [
      "\\babove and beyond\\b"
    ],
    "replacement": "Say what you did beyond the task, with a number: 'I added 2 extra Saturday sessions.'"
  },
  {
    "id": "c24",
    "cliche": "my journey",
    "example": "My journey to medicine began…",
    "patterns": [
      "\\bjourney\\b"
    ],
    "replacement": "Use the event itself: 'My interest in medicine began in a hospital car park in 2024.'"
  },
  {
    "id": "c25",
    "cliche": "in today's fast-paced world",
    "example": "In today's fast-paced world, technology…",
    "patterns": [
      "\\bin today'?s (fast[- ]paced |modern |changing )?world\\b",
      "\\bin this modern (era|age|world)\\b"
    ],
    "replacement": "Start with your own story, not the world: 'Last March, our school's air sensor read 95.'"
  },
  {
    "id": "c26",
    "cliche": "at the end of the day",
    "example": "At the end of the day, what matters is…",
    "patterns": [
      "\\bat the end of the day\\b"
    ],
    "replacement": "Delete it and state the point."
  },
  {
    "id": "c27",
    "cliche": "reach my full potential",
    "example": "…to reach my full potential.",
    "patterns": [
      "\\b(reach|fulfil|fulfill|achieve) (my|her|your) (full )?potential\\b"
    ],
    "replacement": "Name the skill you want to build: 'learn to read a balance sheet quickly.'"
  },
  {
    "id": "c28",
    "cliche": "I am a perfectionist",
    "example": "I am a perfectionist.",
    "patterns": [
      "\\bperfectionist\\b"
    ],
    "replacement": "Describe one standard you set and how you checked it: 'I tested every sensor twice before each reading.'"
  },
  {
    "id": "c29",
    "cliche": "the dictionary defines…",
    "example": "The Oxford dictionary defines leadership as…",
    "patterns": [
      "\\bdictionary defines\\b",
      "\\baccording to the dictionary\\b"
    ],
    "replacement": "Start with your own moment, not a definition."
  },
  {
    "id": "c30",
    "cliche": "the rest is history",
    "example": "…and the rest is history.",
    "patterns": [
      "\\bthe rest is history\\b"
    ],
    "replacement": "End with what you will do next: 'Next, I want to study how vets in Taiwan control rabies.'"
  }
],
  rewriteRule: "Accept a rewrite when it matches no banList pattern and contains a digit or a capitalised name/place.",
  formula: [
  "Verb",
  "What",
  "Scale/Result",
  "So what"
],
  verbBank: [
  "Led",
  "Organised",
  "Coordinated",
  "Chaired",
  "Managed",
  "Directed",
  "Founded",
  "Launched",
  "Captained",
  "Hosted",
  "Designed",
  "Built",
  "Created",
  "Developed",
  "Wrote",
  "Produced",
  "Programmed",
  "Illustrated",
  "Composed",
  "Prototyped",
  "Improved",
  "Reduced",
  "Increased",
  "Raised",
  "Cut",
  "Fixed",
  "Streamlined",
  "Redesigned",
  "Solved",
  "Doubled",
  "Researched",
  "Analysed",
  "Surveyed",
  "Measured",
  "Tested",
  "Investigated",
  "Interviewed",
  "Tracked",
  "Compared",
  "Calculated",
  "Taught",
  "Tutored",
  "Mentored",
  "Trained",
  "Coached",
  "Guided",
  "Supported",
  "Assisted",
  "Volunteered",
  "Translated",
  "Presented",
  "Pitched",
  "Negotiated",
  "Persuaded",
  "Explained",
  "Published",
  "Edited",
  "Debated",
  "Represented",
  "Promoted"
],
  lineCheck: {
  "numberPattern": "\\d",
  "resultMarkers": [
    "resulting in",
    "which",
    "so that",
    "leading to",
    "earning",
    "helping",
    "cutting",
    "raising",
    "saving",
    "winning"
  ],
  "maxWords": 22,
  "verb": "The first word must be a verb from the bank (past form).",
  "number": "The line must contain a number (digits), e.g. 3, 120, 2025, 6 weeks.",
  "result": "The line must contain a result clause."
},

  files: /* @@FILES-BEGIN@@ */ [
  {
    "id": "f01",
    "name": "Mook",
    "gender": "F",
    "faculty": "Design",
    "portrait": "art/applicants/f01.jpg",
    "statement": [
      {
        "id": "f01-s01",
        "text": "In July 2025 an old man missed his stop because our songthaew's map was too small.",
        "para": 1
      },
      {
        "id": "f01-s02",
        "text": "I redrew it with larger names and landmark colours, and Khun Prasert, the driver, displayed it.",
        "para": 2
      },
      {
        "id": "f01-s03",
        "text": "I asked 40 passengers to find one stop on each map within 30 seconds.",
        "para": 2
      },
      {
        "id": "f01-s04",
        "text": "Only 11 found it on the old map, and 21 found it on mine.",
        "para": 2
      },
      {
        "id": "f01-s05",
        "text": "Older riders still struggled, because my pale yellow faded in the sun.",
        "para": 2
      },
      {
        "id": "f01-s06",
        "text": "The Year 1 Bridge Project would let me design bus-stop signs for a Bangkok partner school.",
        "para": 3
      },
      {
        "id": "f01-s07",
        "text": "In the Crossing Seminars I would ask engineering students which inks survive the sun, and then reprint Khun Prasert's map.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f01-a1",
        "text": "Redesigned a songthaew route map in 2025, raising correct stop searches from 11 to 21 among 40 passengers."
      },
      {
        "id": "f01-a2",
        "text": "Helped at many school events and art activities over the years, which was really good practice for me."
      }
    ]
  },
  {
    "id": "f02",
    "name": "Earth",
    "gender": "M",
    "faculty": "Accounting",
    "portrait": "art/applicants/f02.jpg",
    "statement": [
      {
        "id": "f02-s01",
        "text": "I have chosen accounting because I am good at mathematics and enjoy working with numbers.",
        "para": 1
      },
      {
        "id": "f02-s02",
        "text": "My grade average over the last three years is 3.92, and I rank second in a class of 41.",
        "para": 1
      },
      {
        "id": "f02-s03",
        "text": "In 2025 I was elected class treasurer, and in 2026 I was elected again.",
        "para": 2
      },
      {
        "id": "f02-s04",
        "text": "I also served as vice-president of the mathematics club and secretary of the sports committee.",
        "para": 2
      },
      {
        "id": "f02-s05",
        "text": "In addition, I received a gold medal in the 2025 provincial mathematics olympiad and a bookkeeping certificate in 2026.",
        "para": 2
      },
      {
        "id": "f02-s06",
        "text": "The Lotus Bridge Scholarship would be a further achievement and would support my goal of becoming an accountant.",
        "para": 3
      },
      {
        "id": "f02-s07",
        "text": "I hope the committee will consider my record for this scholarship.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f02-a1",
        "text": "Class treasurer for 2 years, 2025 to 2026, elected by a class of 41 students both times."
      },
      {
        "id": "f02-a2",
        "text": "Vice-president of the mathematics club, and gold medal winner in the 2025 provincial mathematics olympiad."
      }
    ]
  },
  {
    "id": "f03",
    "name": "Kaew",
    "gender": "F",
    "faculty": "Medicine",
    "portrait": "art/applicants/f03.jpg",
    "statement": [
      {
        "id": "f03-s01",
        "text": "One evening in 2024 I found a week of my grandmother's diabetes tablets still in their box.",
        "para": 1
      },
      {
        "id": "f03-s02",
        "text": "I drew sun-and-moon picture labels, one dot per tablet, and Nurse Somjit tried them at our health centre.",
        "para": 2
      },
      {
        "id": "f03-s03",
        "text": "Among 18 elderly patients, the leftover tablets she counted fell from 61 to 22 in 12 weeks.",
        "para": 2
      },
      {
        "id": "f03-s04",
        "text": "That result turned my interest into a passion for medicine.",
        "para": 2
      },
      {
        "id": "f03-s05",
        "text": "In the Year 1 Bridge Project I would test the labels at a clinic for migrant workers who cannot read Thai.",
        "para": 3
      },
      {
        "id": "f03-s06",
        "text": "In the Crossing Seminars, a design student could draw them better than I did.",
        "para": 3
      },
      {
        "id": "f03-s07",
        "text": "After the Year 3 internship, I hope to give back to my community as a family doctor.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f03-a1",
        "text": "Designed picture labels for 18 elderly diabetes patients, cutting leftover tablets from 61 to 22 in 12 weeks."
      },
      {
        "id": "f03-a2",
        "text": "Researched salt in 20 instant-noodle brands, winning second prize among 31 projects at a 2025 science fair."
      }
    ]
  },
  {
    "id": "f04",
    "name": "Nont",
    "gender": "M",
    "faculty": "Computer Science",
    "portrait": "art/applicants/f04.jpg",
    "statement": [
      {
        "id": "f04-s01",
        "text": "In July 2025 my school van reached Bang Bua Thong 45 minutes late, and no parent knew why.",
        "para": 1
      },
      {
        "id": "f04-s02",
        "text": "My friend Arm drew the screens, and I wrote the code for a timetable page for our vans.",
        "para": 2
      },
      {
        "id": "f04-s03",
        "text": "Drivers tap one button at each stop, so parents see where the van is.",
        "para": 2
      },
      {
        "id": "f04-s04",
        "text": "Khun Wichai, who manages the vans, says 84 families now use it.",
        "para": 2
      },
      {
        "id": "f04-s05",
        "text": "Calls to his office about late pick-ups fell from 35 to 16 a week.",
        "para": 2
      },
      {
        "id": "f04-s06",
        "text": "For my Year 1 Bridge Project, I could adapt the page for a partner clinic's waiting times, then test it in the Crossing Seminars.",
        "para": 3
      },
      {
        "id": "f04-s07",
        "text": "This term I am adding text-message alerts for the 19 families without smartphones.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f04-a1",
        "text": "Programmed a van timetable page with one friend, cutting calls about late pick-ups from 35 to 16 a week."
      },
      {
        "id": "f04-a2",
        "text": "Taught 4 Saturday coding lessons to 15 younger pupils, helping 13 of them finish a simple maze game."
      }
    ]
  },
  {
    "id": "f05",
    "name": "Pim",
    "gender": "F",
    "faculty": "Public Health",
    "portrait": "art/applicants/f05.jpg",
    "statement": [
      {
        "id": "f05-s01",
        "text": "In June 2026 my cousin broke his jaw in a motorbike crash outside our school; he had no helmet.",
        "para": 1
      },
      {
        "id": "f05-s02",
        "text": "My friend Fai and I then counted riders at the gate for 10 mornings: only 97 of 412 wore one.",
        "para": 2
      },
      {
        "id": "f05-s03",
        "text": "The deputy director saw our numbers and agreed to a helmet rack.",
        "para": 2
      },
      {
        "id": "f05-s04",
        "text": "A month later, 131 of 405 wore one: better, but not enough.",
        "para": 2
      },
      {
        "id": "f05-s05",
        "text": "I am applying because the first-year community project at Kingsmead would let me study this problem with a partner organisation.",
        "para": 3
      },
      {
        "id": "f05-s06",
        "text": "In the mixed-faculty seminars, I want an engineer to tell me why our rack stayed half empty.",
        "para": 3
      },
      {
        "id": "f05-s07",
        "text": "To me, public health means counting carefully, then changing one small thing.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f05-a1",
        "text": "Led a 12-member volunteer team in a 2026 helmet count, which persuaded the school to add a rack."
      },
      {
        "id": "f05-a2",
        "text": "Wrote 6 health columns for the school newsletter in 2025, which the health room printed for parents."
      }
    ]
  },
  {
    "id": "f06",
    "name": "Tee",
    "gender": "M",
    "faculty": "Veterinary Science",
    "portrait": "art/applicants/f06.jpg",
    "statement": [
      {
        "id": "f06-s01",
        "text": "In June 2025 many of our 300 ducks got sick, and my father blamed the heat.",
        "para": 1
      },
      {
        "id": "f06-s02",
        "text": "Every morning for 8 weeks, I kept record of how many duck were sick.",
        "para": 2
      },
      {
        "id": "f06-s03",
        "text": "Khun Anan, the livestock officer, matched my record to rain days and explained me about mouldy feed.",
        "para": 2
      },
      {
        "id": "f06-s04",
        "text": "We move the feed under a roof, and a month later weekly sick ducks fell from 33 to 14.",
        "para": 2
      },
      {
        "id": "f06-s05",
        "text": "I am interested to make record cards with a Bangkok animal clinic for the Year 1 Bridge Project.",
        "para": 3
      },
      {
        "id": "f06-s06",
        "text": "In the Year 3 internship, I want to work on small duck farms in Vietnam.",
        "para": 3
      },
      {
        "id": "f06-s07",
        "text": "I missed the rain myself, so now I write the weather beside every count.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f06-a1",
        "text": "Tracked sick ducks among 300 on our farm for 8 weeks, helping cut weekly cases from 33 to 14."
      },
      {
        "id": "f06-a2",
        "text": "Measured water temperature in our 4 duck pond for 5 weeks, which showed my father the coolest one."
      }
    ]
  },
  {
    "id": "f07",
    "name": "Nan",
    "gender": "F",
    "faculty": "Business",
    "portrait": "art/applicants/f07.jpg",
    "statement": [
      {
        "id": "f07-s01",
        "text": "Business interests me because it combines creativity, responsibility and a clear sense of what people need.",
        "para": 1
      },
      {
        "id": "f07-s02",
        "text": "Supporting my family's business has given me not only practical skills but also a deeper understanding of how organisations adapt.",
        "para": 1
      },
      {
        "id": "f07-s03",
        "text": "I analysed customer feedback, suggested thoughtful improvements and gained valuable insight into the challenges that small businesses face.",
        "para": 2
      },
      {
        "id": "f07-s04",
        "text": "I am confident that this programme offers the ideal environment to develop the knowledge, skills and mindset of a modern professional.",
        "para": 3
      },
      {
        "id": "f07-s05",
        "text": "Its focus on interdisciplinary learning, community engagement and practical experience would allow me to apply theory in meaningful ways.",
        "para": 3
      },
      {
        "id": "f07-s06",
        "text": "In the future, I hope to create lasting value for businesses and communities alike.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f07-a1",
        "text": "Supported a family business with customer feedback analysis, leading to several practical improvements in service and presentation."
      },
      {
        "id": "f07-a2",
        "text": "Volunteered in a range of community and school activities, which was a valuable experience for my personal growth."
      }
    ]
  },
  {
    "id": "f08",
    "name": "Oat",
    "gender": "M",
    "faculty": "Engineering",
    "portrait": "art/applicants/f08.jpg",
    "statement": [
      {
        "id": "f08-s01",
        "text": "In August 2025 the hand pump at our village temple in Roi Et took 3 minutes to fill a bucket.",
        "para": 1
      },
      {
        "id": "f08-s02",
        "text": "Uncle Kasem, a retired mechanic, showed me how to open it, and I found a worn seal.",
        "para": 2
      },
      {
        "id": "f08-s03",
        "text": "I cut a new seal from an old tyre and replaced a cracked joint.",
        "para": 2
      },
      {
        "id": "f08-s04",
        "text": "My first seal was too wide and leaked within a week, so I measured the second twice.",
        "para": 2
      },
      {
        "id": "f08-s05",
        "text": "Now a bucket takes 50 seconds, and 26 families use the pump.",
        "para": 2
      },
      {
        "id": "f08-s06",
        "text": "I am applying to Bang Rak International University for its experienced teachers, modern laboratories and teaching in English.",
        "para": 3
      },
      {
        "id": "f08-s07",
        "text": "Next, I want to design pumps that villagers can repair with hardware-shop parts.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f08-a1",
        "text": "Fixed a temple hand pump, cutting the time to fill one bucket from 3 minutes to 50 seconds."
      },
      {
        "id": "f08-a2",
        "text": "Measured power use of 21 classroom fans for 4 weeks, which led the school to replace the 5 oldest."
      }
    ]
  },
  {
    "id": "f09",
    "name": "Golf",
    "gender": "M",
    "faculty": "Dentistry",
    "portrait": "art/applicants/f09.jpg",
    "statement": [
      {
        "id": "f09-s01",
        "text": "From a young age, I have noticed how a smile changes the way people feel.",
        "para": 1
      },
      {
        "id": "f09-s02",
        "text": "My uncle makes false teeth in Nakhon Pathom, and I helped in his lab for a week.",
        "para": 1
      },
      {
        "id": "f09-s03",
        "text": "That week was once-in-a-lifetime, and it made dentistry my dream career.",
        "para": 1
      },
      {
        "id": "f09-s04",
        "text": "I also have strong leadership skills, and teachers often ask me to organise group work.",
        "para": 2
      },
      {
        "id": "f09-s05",
        "text": "Whatever the task is, I go above and beyond, because details matter in dentistry.",
        "para": 2
      },
      {
        "id": "f09-s06",
        "text": "I am applying because Bang Rak International University is prestigious and has world-class teachers.",
        "para": 3
      },
      {
        "id": "f09-s07",
        "text": "This scholarship would broaden my horizons and prepare me for life as a dentist.",
        "para": 3
      },
      {
        "id": "f09-s08",
        "text": "With this support, I know that I can reach my full potential.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f09-a1",
        "text": "Assisted my uncle in his Nakhon Pathom dental lab for 1 week, watching him make false teeth."
      },
      {
        "id": "f09-a2",
        "text": "Took part in the school English camp in 2025, which was a great experience for my career."
      }
    ]
  },
  {
    "id": "f10",
    "name": "Noon",
    "gender": "F",
    "faculty": "Humanities",
    "portrait": "art/applicants/f10.jpg",
    "statement": [
      {
        "id": "f10-s01",
        "text": "On an ordinary evening in November 2025, while we were sitting on the porch in Lampang, my grandmother sang me a lullaby I had never heard.",
        "para": 1
      },
      {
        "id": "f10-s02",
        "text": "With my teacher, Khru Duangjai, I recorded 23 lullabies from 17 grandmothers in three villages.",
        "para": 2
      },
      {
        "id": "f10-s03",
        "text": "What I found was that eight songs were sung in all three villages, but with different words in each, so the same lullaby had changed from village to village.",
        "para": 2
      },
      {
        "id": "f10-s04",
        "text": "My first recordings were noisy, so I now record indoors.",
        "para": 2
      },
      {
        "id": "f10-s05",
        "text": "Since the Crossing Seminars put students from many faculties in one room, I hope to work with a computer science student on a searchable song archive.",
        "para": 3
      },
      {
        "id": "f10-s06",
        "text": "In my Year 3 internship, I would compare these songs with lullabies in Laos.",
        "para": 4
      }
    ],
    "activities": [
      {
        "id": "f10-a1",
        "text": "Compared 23 lullabies from 17 grandmothers in 3 villages, which showed 8 songs had changed."
      },
      {
        "id": "f10-a2",
        "text": "Translated 9 Northern Thai folk tales into English for a library display, which 140 students visited."
      }
    ]
  }
] /* @@FILES-END@@ */,

  /* On-screen strings for the student app and the board (WS-E / WS-F add keys here only). */
  ui: {
    /* WS-E: student phone app (index.html). */
    student: {
      joinKicker: 'Admissions reading game',
      joinNote: 'Read on your phone. Your marks are saved on this phone as you go.',
      footer: 'The applicants, the university and the scholarship are fictional. Portraits are AI-generated.',
      briefTitle: 'You are the admissions panel',
      briefWhy: 'Why we play',
      rounds: [
        { title: 'Preview · At home (optional)', text: 'Open, read and mark the files before class. Ranking stays locked until Round 1.' },
        { title: 'Round 1 · Alone (15 min)', text: 'Read all ten files and mark sentences as you read. Then rank the files 1–10 and send your ranking.' },
        { title: 'Round 2 · Panel (12 min)', text: 'Compare rankings and marks with your two panel members. Agree your three nominations and attach the sentence that decided each one.' },
        { title: 'Round 3 · Committee (10 min)', text: 'The board shows every panel’s choices and the marked text. The class agrees the final three.' },
        { title: 'Fix-it (5 min or homework)', text: 'Your panel repairs one weak file: one paragraph or one activity line.' }
      ],
      marksIntro: 'Tap a sentence or an activity line to mark it. One mark per sentence. Marks are optional; your ranking is not.',
      places: 'There are three places. Your 1st choice gets the scholarship and a place. Your 2nd and 3rd choices get places.',
      points: 'Each rank gives the file points: 1st = 10, 2nd = 9 … 10th = 1. Everyone’s points make the class leaderboard.',
      lobbyWait: 'Waiting for your teacher to start. Read your briefing now.',
      previewNote: 'Preview: read and mark the files now. Ranking opens in class when Round 1 starts.',
      rankLocked: 'Ranking opens in class.',
      listHint: 'Open each file, read it to the end and mark what you notice.',
      rankHint: 'Use ▲ ▼ to put the ten files in order. Tap a name to read the file again.',
      markHint: 'Tap a sentence to mark it.',
      concernAsk: 'Why? Choose one reason.',
      concernNeed: 'Choose a reason for this concern.',
      concernKept: 'Concern kept with no reason yet. Tap the sentence again to choose one.',
      noReasonYet: 'No reason yet: tap to choose one',
      noReasonGiven: 'no reason given',
      startOrder: 'Starting order: not ranked yet. Move the files to make your ranking.',
      reasonKept: 'The order changed. Your reason for {name} is kept and comes back if {name} returns to the top 3.',
      reasonMoved: 'The order changed. Each reason stays with its applicant: check them.',
      eyeNoRanking: 'No score: you did not send a ranking in Round 1.',
      careful: 'In a real admissions round, one serious concern can outweigh a strong file. Read every file to the end.',
      marksViewIntro: 'Sentences where your marks differ. The biggest disagreements come first. Talk about these before you decide.',
      marksViewNone: 'You marked this file the same way. Choose another file.',
      marksViewNeed: 'Tick your panel members to compare your marks.',
      attachHint: 'Attach the sentence from this file that decided it.',
      eyeTitle: 'Your Cliché eye',
      eyeWhat: 'Cliché eye compares your ✗ Cliché marks with the designer’s key, in the files you opened. Each cliché you found counts for you. Each cliché you missed and each ✗ on a sentence that is not a cliché counts against you. 100 = every cliché found and no false marks.',
      eyeLocked: 'Your score appears in Round 3.',
      eyeNotYet: 'Your score is not ready yet. Look again in a minute.',
      eyeNoMarks: 'No score: you made no ✗ Cliché marks.',
      eyeNoKeyed: 'No score: the files you opened hold no clichés from the key.',
      eyeMissedWait: 'The clichés you missed appear here when your teacher reveals the designer’s notes.',
      eyeMissedTitle: 'Clichés you did not mark',
      eyeMissedNone: 'You did not miss any clichés in the files you opened.',
      fixIntro: 'Choose one paragraph or one activity line from this file and rewrite it. Use the Module 2 tools: the activity-line formula and the cliché list. Type your own words: paste is turned off.',
      fixClass: 'In class, the head of panel types and sends your panel’s version. Help her choose the words.',
      fixHomework: 'Homework: each student sends her own version.',
      fixClosed: 'Fix-it opens after the class reveal.',
      fixSoloName: 'Type your nickname to get your Fix-it file.',
      fixPaste: 'Paste is turned off. Type your own version.',
      chk: {
        noCliche: 'No cliché from the list',
        minWords: 'At least 6 words',
        detail: 'A concrete detail: a number or a name',
        maxPara: 'At most 70 words',
        notSame: 'Not the same as the original',
        verb: 'Starts with a verb from the bank',
        number: 'Contains a number (digits)',
        result: 'Has a result clause that says what changed',
        maxLine: 'At most 22 words'
      },
      formulaIntro: 'Start with a verb from the bank, add a number, and end with a result.',
      verbGroups: ['Lead and organise', 'Create and build', 'Improve and solve', 'Research and analyse', 'Teach and support', 'Communicate and persuade']
    }
  }
};
