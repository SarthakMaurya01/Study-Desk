import { SUBJECTS, subjectById } from './data.js';
import { questionSourceLabel } from './question-bank.js';

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function safeHttpsUrl(value) {
  try {
    const parsed = new URL(String(value || ''));
    return parsed.protocol === 'https:' ? parsed.href : '';
  } catch {
    return '';
  }
}

export function renderQuestionBankView(questions, filters = {}) {
  const subjectFilter = filters.subject || 'all';
  const sourceFilter = filters.sourceKind || 'all';
  const topicFilter = filters.topic || 'all';
  const query = String(filters.query || '').trim().toLocaleLowerCase();
  const subjectQuestions = questions.filter((question) => subjectFilter === 'all' || question.subject === subjectFilter);
  const topics = [...new Set(subjectQuestions.flatMap((question) => [question.chapter, question.topic]).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
  const filtered = subjectQuestions.filter((question) => {
    const sourceKind = question.source?.type || 'practice';
    if (sourceFilter !== 'all' && sourceKind !== sourceFilter) return false;
    if (topicFilter !== 'all' && question.chapter !== topicFilter && question.topic !== topicFilter) return false;
    if (!query) return true;
    return `${question.question} ${question.answer} ${question.chapter} ${question.topic} ${question.id}`.toLocaleLowerCase().includes(query);
  });
  const pageSize = 24;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(pages, Math.max(1, Number(filters.page) || 1));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeSubjectName = subjectFilter === 'all' ? 'All subjects' : subjectById(subjectFilter)?.label || 'All subjects';
  const subjectOptions = SUBJECTS.map((subject) => `<option value="${subject.id}" ${subject.id === subjectFilter ? 'selected' : ''}>${escapeHTML(subject.label)} · ${questions.filter((question) => question.subject === subject.id).length}</option>`).join('');
  const topicOptions = topics.map((topic) => `<option value="${escapeHTML(topic)}" ${topic === topicFilter ? 'selected' : ''}>${escapeHTML(topic)}</option>`).join('');
  const cards = visible.map((question) => {
    const source = question.source || { type: 'practice' };
    const sourceUrl = safeHttpsUrl(source.url);
    const subject = subjectById(question.subject);
    const sourceLabel = questionSourceLabel(question);
    const paper = source.type === 'pyq-adapted' && sourceUrl
      ? `<a class="question-source-link" href="${escapeHTML(sourceUrl)}" target="_blank" rel="noopener noreferrer">Source paper ↗</a>`
      : '';
    return `<article class="question-card"><div class="question-card-meta"><span>${escapeHTML(subject?.short || question.subject)}</span><span>${escapeHTML(question.chapter || question.topic || 'General')}</span><span>${escapeHTML(question.difficulty || 'Practice')}</span></div><div class="question-card-id">${escapeHTML(question.id)}</div><h3>${escapeHTML(question.question)}</h3><details class="question-answer-details"><summary>Show answer</summary><div class="question-answer">${escapeHTML(question.answer)}</div></details><div class="question-source-row"><span class="type-tag ${source.type === 'pyq-adapted' ? 'pyq-tag' : ''}">${escapeHTML(sourceLabel)}</span>${paper}</div></article>`;
  }).join('');
  const counts = SUBJECTS.map((subject) => `${subject.short} ${questions.filter((question) => question.subject === subject.id).length}`).join(' · ');
  return `<div class="section-heading question-bank-heading" style="margin-top:0"><div><div class="eyebrow">Offline · searchable answers</div><h1>Question bank</h1><p class="subtle">${questions.length.toLocaleString()} answered questions · ${escapeHTML(activeSubjectName)} · organized by subject and topic.</p></div><button class="btn btn-outline" data-view="chat">✳ Open Chatbot</button></div>
    <section class="card qbank-toolbar-wrap"><form class="qbank-toolbar" id="question-bank-search"><input class="input qbank-search-input" id="question-bank-query" type="search" value="${escapeHTML(filters.query || '')}" placeholder="Search questions and answers…" aria-label="Search the question bank"><select class="select" id="question-bank-subject" aria-label="Filter questions by subject"><option value="all" ${subjectFilter === 'all' ? 'selected' : ''}>All subjects</option>${subjectOptions}</select><select class="select" id="question-bank-source" aria-label="Filter original practice or past-paper adaptations"><option value="all" ${sourceFilter === 'all' ? 'selected' : ''}>All question types</option><option value="pyq-adapted" ${sourceFilter === 'pyq-adapted' ? 'selected' : ''}>Past-paper adaptations</option><option value="practice" ${sourceFilter === 'practice' ? 'selected' : ''}>Original practice</option></select><select class="select" id="question-bank-topic" aria-label="Filter questions by topic"><option value="all" ${topicFilter === 'all' ? 'selected' : ''}>All topics</option>${topicOptions}</select><button class="btn btn-sm" type="submit">Search</button></form><div class="qbank-subject-counts">${escapeHTML(counts)}</div></section>
    ${visible.length ? `<div class="question-bank-grid">${cards}</div><div class="qbank-pagination"><span>${filtered.length.toLocaleString()} matches · page ${page} of ${pages}</span><div><button class="btn btn-outline btn-sm" data-action="question-bank-page" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Previous</button><button class="btn btn-outline btn-sm" data-action="question-bank-page" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>Next</button></div></div>` : `<div class="empty-state"><strong>No questions match those filters.</strong>Try a different subject, topic, or search phrase.</div>`}
    <div class="local-note"><span>✦</span><span><strong>Source labels matter:</strong> past-paper adaptations include the year and paper link when verified. Other items are original practice, not PYQs. Answers are study aids; check your prescribed syllabus and teacher's marking guidance.</span></div>`;
}
