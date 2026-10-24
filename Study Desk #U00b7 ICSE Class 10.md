# Study Desk · ICSE Class 10

Study Desk is a computer-friendly, installable PWA for keeping ICSE Class 10 notes, PDFs, images, questions, and exam dates together. It includes 36 quick-reference notes across Maths, Hindi, Physics, Computer, Chemistry, Biology, History/Civics, English Language, English Literature, and Geography.

## Install and use

Open the website in a current desktop browser and choose **Install on this computer** in the app sidebar (or use the browser's Install option). After the app shell is installed and its first cache is complete, its library, search, answer desk, and calendar work offline. The same interface adapts to smaller screens.

## Add and find materials

Add typed notes or choose one or more PDFs/images, then assign a subject and optional chapter. PDF text is indexed page by page. Images and scanned PDF pages use the bundled offline English OCR model; the first 12 PDF pages also retain small local previews for answer source cards. The answer desk filters by subject, file type, and chapter, and retrieves passages by keyword. A CSV datesheet with `title,date` columns or an `.ics` calendar can be imported, or events can be entered by hand.

## Privacy and answer limits

Uploaded material, extracted text, page previews, calendar events, and chat history are stored in this browser's IndexedDB/local storage. They are not uploaded to an AI service and do not sync to another browser profile or device. Keep separate copies of irreplaceable source files. The bundled OCR model reads English; Hindi notes can be typed directly.

The bundled English traineddata file is from [tesseract-ocr/tessdata_fast](https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/eng.traineddata) and is licensed under [Apache-2.0](https://github.com/tesseract-ocr/tessdata_fast/blob/main/LICENSE).

Answers are produced by local relevance matching, not a generative AI model. The 36 built-in notes are concise general refreshers, not a complete or official ICSE syllabus, school datesheet, or set-text answer key. Add your prescribed books, class notes, and teacher materials for better source coverage, then verify answers against your course.

## Run the project locally

Install Node.js 22 or newer and pnpm 11.25.0, then run `pnpm install`, `pnpm dev`, and open `http://localhost:3000`. Create a production build with `pnpm build`.

## Desktop package

The delivered app is a browser-installable PWA. An APK is an Android package, not a Windows/macOS/Linux desktop installer. Native desktop packaging is a separate follow-on target and needs a target operating system choice.
