CZECH VERB TRAINER — VERSION 3

Unzip this package, then open index.html in Chrome or Edge.
The trainer works offline. Speech uses the Czech voice available in your browser/device.

WHAT IS NEW
- Four practical learner conjugation groups: -ám, -ím, -uji/-uju, -u/-eš.
- Choose one group or mix all four. Irregular verbs are marked and placed in the closest learner group; their actual forms must be learned individually.
- Aspect filter: imperfective, perfective, or both. Each exercise shows aspect and its meaning.
- A rules panel compares imperfective/perfective past and future with examples.
- 296 selected common combinations for all 97 verbs, with case numbers, Czech examples and English translations in Easy mode.
- A searchable reference for all verbs and their combinations.
- Corrected reflexive particles in alternative forms.

CONTROLS
Present, Past, Future, Conditional, Imperative, Mixed.
Conjugation or Fill in the sentence.
Easy: Czech + English. Normal: Czech only.
Check, Next, Hint, Skip, Shuffle, Speak. Enter checks; Enter again advances.
The group and aspect filters apply to both exercise modes. A selection can have no exercises, for example perfective + Present; change the filters in that case.

TEACHING NOTES
The four groups are learner categories, not the traditional five Czech morphological classes. The infinitive alone does not identify the group.
Czech aspect does not correspond exactly to English simple/progressive tenses.
Both aspects use the same past auxiliary system. Imperfective describes process, repetition or state without asserting completion; perfective presents an event as a whole or a result.
Perfective finite forms have future meaning, so Present practice includes only imperfective verbs.
Common combinations include verb complements and useful place/time/manner phrases. They are a selected everyday list, not an exhaustive dictionary of idioms or every possible complement.
Sentence practice retains the original 42 prompts. This update does not expand the verb inventory.

FILES
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
- Normal mode hides automatic aspect/conjugation notes and the rules panel. The searchable reference also hides aspect/conjugation notes in Normal. Deliberately requested hints and feedback remain available.
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
