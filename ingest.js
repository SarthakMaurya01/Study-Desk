import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker, OEM } from 'tesseract.js';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
const ocrWorkerPromises = new Map();

async function getOcrWorker(onProgress = () => {}, language = 'eng') {
  const hindiMode = language === 'hin';
  const cacheKey = hindiMode ? 'eng+hin' : 'eng';
  if (!ocrWorkerPromises.has(cacheKey)) {
    const workerLanguages = hindiMode ? ['eng', 'hin'] : 'eng';
    const workerPromise = createWorker(workerLanguages, OEM.LSTM_ONLY, {
      workerPath: '/tesseract/worker.min.js',
      corePath: '/tesseract/core/tesseract-core-lstm.wasm.js',
      langPath: '/tesseract/lang',
      gzip: false,
      cachePath: 'study-desk-ocr',
      cacheMethod: 'write',
      logger: (message) => onProgress(message),
    }).catch((error) => {
      ocrWorkerPromises.delete(cacheKey);
      throw error;
    });
    ocrWorkerPromises.set(cacheKey, workerPromise);
  }
  return ocrWorkerPromises.get(cacheKey);
}

export async function recognizeImage(image, onProgress = () => {}, language = 'eng') {
  const worker = await getOcrWorker(onProgress, language);
  const result = await worker.recognize(image);
  return result.data.text.trim();
}

function canvasBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.62));
}

export async function readPdf(file, onProgress = () => {}, language = 'eng') {
  const bytes = await file.arrayBuffer();
  const pdf = await getDocument({ data: bytes }).promise;
  const pageTexts = [];
  const images = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress({ status: 'page', current: pageNumber, total: pdf.numPages });
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    let text = content.items.map((item) => item.str).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    const needsOcr = text.length < 28;
    if (needsOcr || pageNumber <= 12) {
      try {
        const viewport = page.getViewport({ scale: needsOcr ? 1.15 : 0.55 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d', { alpha: false });
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (pageNumber <= 12) {
          const preview = await canvasBlob(canvas);
          if (preview) images.push({ page: pageNumber, blob: preview });
        }
        if (needsOcr) {
          try {
            const recognized = await recognizeImage(canvas, onProgress, language);
            if (recognized) text = recognized;
          } catch (error) {
            console.warn('Offline OCR could not process this PDF page:', error);
          }
        }
        canvas.width = 0;
        canvas.height = 0;
      } catch (error) {
        console.warn('Could not render scanned PDF page:', error);
      }
    }
    pageTexts.push({ page: pageNumber, text });
    page.cleanup();
  }
  await pdf.destroy();
  return { pageTexts, images, numPages: pageTexts.length };
}

export function pagesToText(pageTexts) {
  return pageTexts.map(({ page, text }) => `Page ${page}\n${text}`).join('\n\n').trim();
}
