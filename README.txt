CZECH VERB TRAINER — VERSION 3

Unzip this package, then open index.html in Chrome or Edge.
The trainer works offline. Speech uses the Czech voice available in your browser/device.

WHAT IS NEW
- Four learner conjugation groups, as in the textbook: -á, -í, -uj, -e verbs.
- Choose one group or mix all four. Irregular verbs are marked and placed in the closest learner group; their actual forms must be learned individually.
- Aspect filter: imperfective, perfective, or both. Each exercise shows aspect and its meaning.
- A rules panel compares imperfective/perfective past and future with examples.
- 296 selected common combinations for all 97 verbs, with case numbers, Czech examples and English translations in Easy mode.
- A searchable reference for all verbs and their combinations.
- Corrected reflexive particles in alternative forms.

CONTROLS
Present, Past, Future, Conditional, Imperative, Mixed.
Conjugation or Fill in the sentence.
Mode: English (default) = English only. Easy = Czech + English. Normal = Czech only.
Tabs: Practice, Rules, Verb reference.
Practice steps: 1 write or say the form (🎙 puts speech in the answer box) · 2 Check / Hint · 3 Listen, Record, My voice · Show answer, Shuffle, Next.
Verb reference: click a verb and choose Present, Past, Future, Conditional or Imperative to see its full conjugation table.
Rules: endings you can rely on (ty always -š, vy always -te, on/ona the shortest form), how each tense and mood is formed, aspect rules, and the four groups. In Easy and English modes, Practice also has a "How to form" box for the current tense.
The button to press next glows yellow, with a hint line above. Enter checks; Enter again advances. Hint hides the answer; Show answer reveals it.
The group and aspect filters apply to both exercise modes. A selection can have no exercises, for example perfective + Present; change the filters in that case.

TEACHING NOTES
The four groups are learner categories, not the traditional five Czech morphological classes. The infinitive alone does not identify the group.
Czech aspect does not correspond exactly to English simple/progressive tenses.
Both aspects use the same past auxiliary system. Imperfective describes process, repetition or state without asserting completion; perfective presents an event as a whole or a result.
Perfective finite forms have future meaning, so Present practice includes only imperfective verbs.
Common combinations include verb complements and useful place/time/manner phrases. They are a selected everyday list, not an exhaustive dictionary of idioms or every possible complement.
Sentence practice retains the original 42 prompts. This update does not expand the verb inventory.

FILES
reference.js: conjugation tables, the Rules page and the Practice "How to form" box.
index.html: trainer page with embedded verb data. Keep voice-and-letters.js and the assets folder beside it.
verbs.json: readable editable data copy. Editing JSON alone does not update the HTML's embedded data.

REFERENCE
Original vocabulary levels and forms: Czech A1–A2 reference description, Wiktionary, Oxford Czech Lexicon for Learners.
Aspect/future reference: https://ujc.cas.cz/cs/zajimave-dotazy/vidime-se/
Motion future: https://prirucka.ujc.cas.cz/?slovo=j%C3%ADt
Selected combinations are curated teaching examples; they are not copied dictionary definitions.

VERSION 3 UPDATES
- Supplied star background and blue writing mascot.
- On-screen Czech letters á č ď é ě í ň ó ř š ť ú ů ý ž, with uppercase toggle. Buttons insert at the cursor or replace selected text. Available in both exercise modes.
- Normal mode hides automatic aspect/conjugation notes (the Rules tab is now shown in every mode). The searchable reference also hides aspect/conjugation notes in Normal. Deliberately requested hints and feedback remain available.
- Record voice, stop, and play back your recording. Recordings remain local to this open page and clear on changing the exercise. They are not uploaded by the trainer.
- Separate Czech dictation button inserts recognised speech in the answer field. Students can edit it and press Check; speech never automatically submits an answer. Dictation availability depends on the browser and may use its online speech service.
- Allow microphone access when prompted. Microphone recording needs a browser that supports MediaRecorder and microphone access in a secure context. For reliable access use an HTTPS-hosted page or localhost. Local-file permissions vary by browser.
- Keep the entire extracted folder together; opening just a copied index.html will omit the artwork and voice/letter controls.

VALIDATION
All 180 filter configurations checked. Browser verified at desktop and 390px phone width. Real MediaRecorder recording tested in Chromium with its simulated microphone. Dictation results and permission/error behaviour tested with mocks; actual user microphone and online speech recognition were not tested.

Browser API references:
https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

DATA FIX
- pomoct is now marked perfective (its imperfective partner is pomáhat), in both index.html and verbs.json.
- pít, napít se, žít, mýt se, umýt se moved to group 4 (-e verbs), matching the textbook.

VERSION 4 UPDATES
- Accent check: an answer that differs only in háček/čárka gets "Almost!" with the letters marked, and the student can fix it and check again.
- Past and conditional now practise every person (já/ty man and woman, on, ona, my, vy, oni). Imperative also practises the my form (dělejme).
- Czech voice: the trainer picks the best Czech voice on the device (Microsoft Edge's natural Czech voices first) and never reads with an English voice. If no Czech voice exists, it explains how to add one.
- My mistakes: wrong answers are collected (saved in this browser). The "My mistakes" button practises only those; correct answers remove them. Footer shows answers and % correct on this computer, with a reset link.
- New exercises (Exercise menu): Aspect (which verb is perfective/imperfective), Verbs of motion (jít/chodit, jet/jezdit… in sentences), Which group? (with exceptions explained).
FILES: practice-plus.js holds these additions; keep it beside index.html.

VERSION 5 — LEVELS A, B, C (1,496 verbs)
- Level menu in Practice (A / B / C / All levels; remembered on this computer) and in the Verb reference (with A/B/C badges).
- Level A (493 verbs) = the verbs in the official appendix "Soupis lexikálních jednotek úrovně A1, A2" (Referenční popis češtiny,
  NÚV): 190 A1 + 303 A2. Variants listed separately there (bavit / bavit se, negative forms like nevědět) count as the same verb.
  Not included because they exist only in the 3rd person (no full table possible): pršet, sněžit, dít se.
  The list is stored in tools/official_A.txt; each A verb also carries "official": "A1" or "A2" in verbs.json.
- Level B (378) and Level C (625): the next most frequent Czech verbs in the Universal Dependencies Czech corpora (PDT-C, FicTree)
  and a Czech subtitle frequency list, with their aspect partners. B/C are frequency-based and approximate — there is no free official B/C list.
- Every new verb has: full present, past, future, conditional and imperative forms, aspect and partner, English meaning, conjugation group,
  and 1–2 example phrases with case numbers and translation.
- Forms were generated from a short source line per verb and checked automatically against the forms found in the corpus and in the
  UniMorph/Wiktionary dataset; disagreements were reviewed by hand.
- "Fill in the sentence" keeps its 42 sentences (level A). "Aspect" and "Verbs of motion" exercises are not split by level.
FILES
- tools/src/*.txt: one line per verb (aspect, partner, English, present forms, imperative, past, phrases). Edit or add lines here.
- tools/official_A.txt: the official A1/A2 verb list that decides level A.
- tools/build_verbs.py: after editing any file in tools/src, open a terminal in the trainer folder and run
      python tools/build_verbs.py
  It checks the verbs and updates verbs.json and the data inside index.html. Then reload the trainer (Ctrl+F5).
  ("python tools/build_verbs.py . build" only checks and does NOT change the trainer.)
  The original 97 verbs are marked "original" and never overwritten.

VERSION 6 — HINTS AND COMMON PATTERNS
- Hint gives a clue without the answer: the group and a model verb in the same person, another form of the same verb,
  the past form of the other gender, or the starting form for the imperative.
- Every verb now has at least 3 common patterns (case question + example + English), replacing the single phrase.
  They live in tools/src/patterns_*.txt, one line per verb:  verb || pattern = example = English || ...
  After editing, run "python tools/build_verbs.py" (no extra words) and reload the trainer with Ctrl+F5.

VERSION 7 — MANY MORE "FILL IN THE SENTENCE" EXERCISES
- 631 sentences instead of 42: level A 331, B 150, C 150, about the same number for each tense.
- The Level menu now works in this exercise too.
- The sentences live in tools/src/sentences_A.txt, sentences_B.txt, sentences_C.txt, one per line:
    Tense | sentence with ___ | English | verb | person | answer | tip
  Tense: Present, Past, Future, Conditional or Imperative.  Person: 1sg 2sg 3sg 1pl 2pl 3pl.
  One answer is enough: spoken/written variants (pracuju/pracuji) are added automatically.
  Past and Conditional: the blank is the WHOLE verb, helper included (jsem psal, ses narodil, bych chtěl,
  kdybych měla). The check makes sure the helper matches the person.
- "python tools/build_verbs.py" checks every answer against the verb tables and prints SENTENCE PROBLEM
  if an answer is not a correct form (or the verb is not in the trainer).

VERSION 8 — ASPECT FOR ALL VERBS
- Exercise "Aspect: imperfective × perfective" now uses every verb pair in the trainer (about 800 pairs; the ones
  marked aspect_partner in the data plus the textbook pairs) and has the same menus as the other exercises:
  Level, Tense, Conjugation group, Verb aspect.
- Tense decides the question:  Mixed = "Which verb is perfective / imperfective?" + all the others;
  Present = which form means "now";  Past / Conditional / Future = a signal word (Každý den / Konečně / Hned ___)
  decides the aspect, and Future offers the wrong "budu + perfective" as a trap;  Imperative = negative commands.
- A "How to form" box with the aspect rules for that tense opens under each question.
