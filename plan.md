# Study Desk upgrade plan

Extend the existing ICSE Class 10 Study Desk without reinitializing it or changing its established desktop visual design. Keep the current mobile-responsive behavior and verify new navigation and question views on narrow screens as well.

## Question-bank content and provenance

Create ten separate structured question-bank datasets, one for each existing subject ID: maths, hindi, physics, computer, chemistry, biology, history, english-language, english-literature, and geography. The delivered target is at least 1,000 complete question-and-answer records total, aiming for 100 per subject. Keep practice items distinct from questions adapted from verifiable public past papers. For each past-paper-derived item, record the exam year, paper/number and page or question reference when available, and a direct source URL. Paraphrase question stems rather than copying long spans of exam text. Never infer a past-paper year or paper reference; if it cannot be verified, label that entry as original practice. Every entry needs a worked or explanatory answer and a concise topic/chapter tag. For English Literature, avoid year-sensitive prescribed-text facts unless verified against the current syllabus/paper.

The bank lives as JSON modules under `src/question-bank/`; validate schema, subject totals, answer completeness, source links and aggregate count in a deterministic script. Import banks as split modules so the app remains maintainable; Vite's generated asset manifest must include them in the offline precache.

## App experience and local retrieval

Add persistent sidebar navigation labeled **Chatbot** and **Question bank**. The question bank page provides filters for subject, original practice versus past-paper adaptation, topic and text search; users can expand answers and follow sources. Chat retrieval combines the 1,000+ Q&A bank with starter references and user-uploaded, locally indexed materials. Preserve source labels and URLs in answers; match results by relevant question and answer text, not solely question wording. Uploads remain grouped by subject and accessible from the Study Library.

Continue indexing PDFs and images on import. Extract PDF page text, OCR image/scanned-page text locally, and show uploaded images or the cited PDF page preview beside answer sources when available. If a Hindi OCR language asset can be sourced, bundle it locally and select it for Hindi-subject uploads; keep language limitations visible otherwise. No study-file upload or cloud model call is introduced.

This is an offline retrieval chatbot whose answers come from its authored bank and the student's locally saved material. Do not claim that a generative model was trained or fine-tuned. Clearly disclose when no strong source match exists and cite the records used.

## Windows desktop build

Package the existing built website, question-bank data, OCR models/workers and icon resources in a Windows x64 installer. Use an Electron desktop shell with a loopback-only local HTTP server so browser IndexedDB and the app's same-origin service worker continue to work offline. The server binds to 127.0.0.1 on an ephemeral port and serves only packaged static assets. Do not expose a network backend or require sign-in. Produce a directly downloadable `.exe` installer; do not call it an APK. Keep the Manus website static build declaration independent from the desktop packaging build. Document the unsigned-installer/Windows SmartScreen caveat if applicable.

## Project structure

- `src/question-bank/*.json`: one provenance-rich bank per subject.
- `src/question-bank.js`: split-module loading, subject/type/chapter filtering and total-count helpers.
- `src/search.js`: local ranking across question bank, starter notes and IndexedDB uploads; answer construction with citations.
- `src/main.js` and `src/styles.css`: Chatbot and Question bank sidebar entries, list/detail/search layouts, answer citations, existing desktop styles and responsive mobile additions.
- `public/sw.js` and `vite.config.js`: offline-precache support for generated question chunks and any added local OCR data.
- `desktop/main.cjs` and the root build configuration: local-only Electron shell and Windows installer settings.
- `TODO.md` and `README.md`: acceptance evidence, provenance/limitations, local install and Windows use.
