import questionBank from './question-bank/all.json';
import { STARTER_DOCS, subjectById } from './data.js';
import { getAllDocuments } from './storage.js';

const STOPWORDS = new Set(['the','a','an','is','are','was','were','be','to','of','in','on','for','with','and','or','it','what','how','why','when','where','which','who','explain','tell','me','about','does','do','can','could','please','show','give','answer','define','write','compare','difference','between','solve','my','class','10','icse']);
const SYNONYMS = {
  maths: ['mathematics','math','algebra','geometry','trigonometry','equation','formula'],
  hindi: ['हिन्दी','हिंदी','पत्र','निबंध','गद्यांश','व्याकरण'],
  physics: ['electricity','light','force','energy','heat','current','resistance','refraction'],
  computer: ['java','programming','loop','array','method','code','computer applications'],
  chemistry: ['chemical','reaction','bond','acid','base','electrolysis','periodic'],
  biology: ['plant','human','photosynthesis','genetics','cell','circulation','excretion'],
  history: ['civics','parliament','supreme court','national movement','1857','constitution'],
  'english-language': ['letter','email','notice','composition','comprehension','summary','grammar'],
  'english-literature': ['poem','poetry','prose','drama','character','metaphor','simile'],
  geography: ['map','climate','monsoon','soil','resource','contour','rainfall'],
};

function words(value) {
  return String(value || '').toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function searchableText(document) {
  return `${document.title || ''} ${document.subject || ''} ${document.chapter || ''} ${document.kind || ''} ${document.text || ''}`.toLocaleLowerCase();
}

export async function searchMaterials(query, subjectId = 'all', filters = {}) {
  const localDocs = await getAllDocuments();
  const bankDocs = (questionBank.questions || []).map((q) => ({ id: `bank-${q.id}`, title: q.topic, subject: q.subject, chapter: q.chapter, kind: q.source?.type === 'pyq-adapted' ? 'past-paper-adapted' : 'question-bank', type: 'question', question: q.question, answer: q.answer, text: `Question: ${q.question}\nAnswer: ${q.answer}\nTopic: ${q.topic}\nChapter: ${q.chapter}`, source: q.source?.title || 'ICSE question bank' }));
  const docs = [...bankDocs, ...STARTER_DOCS, ...localDocs];
  const queryTokens = [...new Set(words(query).filter((word) => word.length > 1 && !STOPWORDS.has(word)))];
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase();
  const typeFilter = filters.type || 'all';
  const chapterFilter = filters.chapter || 'all';
  if (!queryTokens.length) return [];

  const ranked = docs
    .filter((document) => (subjectId === 'all' || document.subject === subjectId)
      && (typeFilter === 'all' || document.type === typeFilter)
      && (chapterFilter === 'all' || document.chapter === chapterFilter))
    .map((document) => {
      const haystack = searchableText(document);
      const title = `${document.title || ''} ${document.chapter || ''}`.toLocaleLowerCase();
      const matches = queryTokens.filter((token) => haystack.includes(token));
      const titleMatches = queryTokens.filter((token) => title.includes(token));
      const phraseBoost = normalizedQuery.length > 3 && haystack.includes(normalizedQuery) ? 1.6 : 0;
      const synonymBoost = (SYNONYMS[document.subject] || []).some((term) => normalizedQuery.includes(term)) ? 0.7 : 0;
      const coverage = matches.length / queryTokens.length;
      const score = coverage * 5 + titleMatches.length * 1.5 + phraseBoost + synonymBoost;
      return { document, score, coverage, matches };
    })
    .filter((result) => result.score >= 1.35 && result.coverage > 0)
    .sort((left, right) => right.score - left.score || new Date(right.document.updatedAt || 0) - new Date(left.document.updatedAt || 0))
    .slice(0, 5);
  return ranked;
}

export function buildAnswer(question, results) {
  if (!results.length) {
    return {
      text: 'I could not find a strong match in your saved materials or the built-in quick-revision pack. Try a subject or chapter keyword, or add the relevant PDF, image, or note first.',
      matched: false,
    };
  }
  const strong = results.filter(({ score, coverage }) => score >= 1.9 || coverage >= 0.45).slice(0, 3);
  const selected = strong.length ? strong : results.slice(0, 2);
  const sub = subjectById(selected[0].document.subject);
  const lead = selected[0].document.type === 'reference'
    ? `Here are the closest ${sub ? sub.label : 'subject'} notes I found for “${question.trim()}”. Use them as a starting point and check the exact wording in your class notes.`
    : `I found relevant material in your ${sub ? sub.label : 'study'} library for “${question.trim()}”. Here are the matching passages.`;
  const paragraphs = selected.map(({ document }) => {
    const text = String(document.text || '').trim();
    const excerpt = text.length > 920 ? `${text.slice(0, 920).trim()}…` : text;
    return `${document.title || document.name}\n${excerpt || 'This image has been saved. Its text could not be indexed; open the source to inspect it.'}`;
  });
  return { text: `${lead}\n\n${paragraphs.join('\n\n')}`, matched: true };
}

export function answerStyle(subjectId) {
  if (subjectId === 'maths' || subjectId === 'physics' || subjectId === 'chemistry') return 'Show formulas, substitutions, and units in your final working.';
  if (subjectId === 'computer') return 'When useful, include a short code example and trace values step by step.';
  if (subjectId === 'history' || subjectId === 'geography') return 'Organise long answers into points, and support them with named examples from your prescribed material.';
  if (subjectId === 'english-language' || subjectId === 'english-literature' || subjectId === 'hindi') return 'Follow the requested format, quote or refer to the relevant text, and check the prompt’s word limit.';
  if (subjectId === 'biology') return 'Define key terms, then explain the process in a clear sequence.';
  return 'Ask a more specific question or select a subject to narrow the matches.';
}
