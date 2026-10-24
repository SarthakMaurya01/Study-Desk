const bankModules = import.meta.glob('./question-bank/*.json', { import: 'default' });

const modulePromises = new Map();

function subjectIdFromPath(path) {
  return path.split('/').at(-1)?.replace(/\.json$/i, '') || '';
}

async function loadBank(path, loader) {
  if (!modulePromises.has(path)) {
    modulePromises.set(path, Promise.resolve().then(loader).catch((error) => {
      modulePromises.delete(path);
      throw error;
    }));
  }
  return modulePromises.get(path);
}

export async function loadQuestionBank(subjectId = 'all') {
  const entries = Object.entries(bankModules)
    .filter(([path]) => subjectId === 'all' || subjectIdFromPath(path) === subjectId)
    .sort(([left], [right]) => left.localeCompare(right));
  const banks = await Promise.all(entries.map(([path, loader]) => loadBank(path, loader)));
  return banks.flatMap((bank) => Array.isArray(bank?.questions) ? bank.questions : []);
}

export function questionToDocument(question) {
  const citation = question.source || { type: 'practice' };
  const title = `${question.topic || question.chapter || 'Practice'} · ${question.id}`;
  return {
    id: `question-${question.id}`,
    title,
    name: question.id,
    subject: question.subject,
    chapter: question.chapter || question.topic || 'General',
    topic: question.topic || '',
    kind: citation.type === 'pyq-adapted' ? 'past-paper-adapted' : 'original-practice',
    type: 'question',
    question: question.question,
    answer: question.answer,
    text: `Question: ${question.question}\nAnswer: ${question.answer}\nTopic: ${question.topic || ''}\nChapter: ${question.chapter || ''}`,
    sourceKind: citation.type,
    sourceCitation: citation,
    source: citation.title || (citation.type === 'pyq-adapted' ? 'Past-paper adaptation' : 'Study Desk practice question'),
    createdAt: '',
    updatedAt: '',
    pageTexts: [],
    images: [],
  };
}

export function questionSourceLabel(question) {
  const source = question.source || {};
  if (source.type !== 'pyq-adapted') return 'Original practice';
  const paper = [source.year, source.paper, source.reference].filter(Boolean).join(' · ');
  return `Past-paper adaptation${paper ? ` · ${paper}` : ''}`;
}
