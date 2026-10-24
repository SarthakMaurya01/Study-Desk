# ICSE Class 10 Study Desk — upgraded source project

## Included
- 1,000 searchable question-and-answer entries across the 10 configured subjects.
- 200 clearly labelled **PYQ-style practice adaptations**. These are not claimed to be verbatim official CISCE past-paper questions; upload your own official papers to index those.
- Sidebar Question Bank and AI Study Chatbot views. Chatbot search includes the built-in Q&A bank plus your saved notes and uploaded material.
- Local PDF text extraction and image OCR (Tesseract.js), with scanned PDF pages processed using OCR when selectable text is missing.
- Source previews for uploaded images and PDF pages; subject filters, searchable library, and local browser storage.
- Installable PWA support in compatible browsers.

## Run on Windows
1. Install Node.js 20 or newer from https://nodejs.org/ (needed only to run/build the project).
2. Extract this ZIP to a normal folder.
3. Double-click `START-STUDY-DESK.bat`. It installs dependencies the first time, then starts the local app.
4. Open the address printed in the terminal (normally `http://localhost:3000`). Keep the terminal open while using it.
5. In Chrome or Edge, use the install icon in the address bar or menu → **Install Study Desk** to install it like an app.

For a production build, run `BUILD-STUDY-DESK.bat`; the generated site is placed in `dist/`.

## Important notes
- This is an offline-first local search/retrieval study assistant, **not a newly trained large language model**. It finds relevant stored passages and Q&A and gives source-backed answers. It does not guarantee correct answers for every possible question.
- Uploaded documents are stored in the browser's local database on that computer. Export/backup your important notes separately before clearing browser data.
- OCR depends on legibility, language packs, and the PDF's layout; always verify OCR text against the source.
- An Android `.apk` installs on Android devices, not Windows PCs. For this Windows computer use the PWA install flow above. This source ZIP does not include a signed Android APK or Windows `.exe` installer.
- Official past papers and copyrighted textbook scans are not bundled. The PYQ-style practice entries are original adaptations; check the current CISCE syllabus and prescribed books.
