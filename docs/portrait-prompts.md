# Portrait prompts (Gemini, nano banana)

Made in the Gemini app (Create image, 3:4), one new chat each, cropped to 4:5 by `tools/fin-portrait.py`, saved as `art/applicants/<id>.jpg` (600 × 750 JPEG, 30–60 KB). Everything that could signal quality is held constant (framing, clothing, backdrop, light, expression); only hair, face shape, glasses (two of ten) and skin tone vary. Ten new people, none from the Shortlist.

Prompt core (the Shortlist's, with its Kong-fix lines built in from the start):

> Create an image: a photo-realistic ID-style portrait photograph of an 18-year-old Thai university applicant, **{description}**, calm friendly-neutral expression with a slight closed-mouth smile, looking straight at the camera, head and shoulders, centred, plain uniform mid-grey studio backdrop with no gradient, soft diffused frontal studio lighting with no harsh shadows, natural skin, clean neat appearance, no make-up beyond natural, no jewellery, no logo, no badge, no pin, no school uniform, no text, no watermark, same studio look as a professional passport photo. Portrait orientation, 3:4 aspect ratio.

| id | Name | Description |
|---|---|---|
| f01 | Mook | a young woman with shoulder-length wavy black hair tucked behind one ear, oval face, tanned medium skin tone, wearing a plain white blouse |
| f02 | Earth | a young man with short black hair in a neat side parting, square face, thin black round glasses, fair skin tone, wearing a plain white collared shirt |
| f03 | Kaew | a young woman with long straight black hair worn loose with a centre parting, slim face, medium skin tone, wearing a plain white blouse |
| f04 | Nont | a young man with closely cropped black hair, long face, deep tan medium-dark skin tone, relaxed brow, soft matte even skin with no shine or oily highlights, same gentle slight smile, wearing a plain white collared shirt with the top button undone and the collar open |
| f05 | Pim | a young woman with black hair in a neat low bun, round face, light skin tone, wearing a plain white blouse |
| f06 | Tee | a young man with short textured black hair and a slightly raised fringe, oval face, light-medium skin tone, wearing a plain white collared shirt |
| f07 | Nan | a young woman with dark-brown hair all tied back in one plain high ponytail, no loose hair over the shoulders, heart-shaped face, ordinary everyday student looks, fair skin tone, not a model, not glamorous, natural skin texture, head the same size in frame as a passport photo with clear space above the head, wearing a plain white blouse with a shirt collar |
| f08 | Oat | a young man with medium-length black hair parted in the middle, round face, medium skin tone, wearing a plain white collared shirt |
| f09 | Golf | a young man with short black hair brushed forward, broad face, light skin tone, wearing a plain white collared shirt |
| f10 | Noon | a young woman with a shoulder-length black bob and no fringe, tortoiseshell round glasses, oval face, medium-dark skin tone, clear space above the head, wearing a plain white blouse with a pointed shirt collar, top button undone, collar open (not a round-neck or collarless top) |

QA each image: no text or watermark, no uniform, badge or pin, same expression and framing as the others, nobody markedly more polished, younger or older than the rest. Three were regenerated after the first review (collar, framing, polish), and four were re-cropped or colour-corrected (`tools/fin-portrait2.py`). The pictures for f04 and f06 were swapped after the final review.
