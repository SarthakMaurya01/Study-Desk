import questionBank from './question-bank/all.json';
import { SUBJECTS, STARTER_DOCS, subjectById } from './data.js';
import { openDatabase, getAllDocuments, putDocument, removeDocument, getAllEvents, putEvent, removeEvent, readChatHistory, writeChatHistory, requestPersistentStorage } from './storage.js';
import { searchMaterials, buildAnswer, answerStyle } from './search.js';
import './styles.css';

const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const toastRegion = document.querySelector('#toast-region');
const state = {
  view: 'home',
  subject: 'all',
  docs: [],
  events: [],
  messages: readChatHistory(),
  month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  filter: 'all',
  chatFilters: { type: 'all', chapter: 'all' },
  searchText: '',
  pendingInstall: null,
  qbankQuery: '',
  qbankSubject: 'all',
  qbankSource: 'all',
};

const icon = `<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#e3b27c"/><path d="M8 13c6-2 11-1 16 2v22c-5-3-10-4-16-2V13Z" fill="#fffefa"/><path d="M40 13c-6-2-11-1-16 2v22c5-3 10-4 16-2V13Z" fill="#f4e2c9"/><path d="M24 15v22" stroke="#31584a" stroke-width="1.5"/><path d="m34 7 1.7 3.5 3.8 1.6-3.8 1.6-1.7 3.5-1.6-3.5-3.8-1.6 3.8-1.6L34 7Z" fill="#fffefa"/></svg>`;

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function formatDate(value, options = { month: 'short', day: 'numeric' }) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, options).format(date);
}

function toast(message) {
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  toastRegion.append(item);
  window.setTimeout(() => item.remove(), 4500);
}

function selectedSubjectOptions(selected = 'maths') {
  return SUBJECTS.map((subject) => `<option value="${subject.id}" ${subject.id === selected ? 'selected' : ''}>${escapeHTML(subject.label)}</option>`).join('');
}

function viewTitle() {
  if (state.view === 'home') return ['Your study desk', 'A quiet place for everything you’re learning.'];
  if (state.view === 'library') return ['Study library', 'Your notes and source material, kept on this device.'];
  if (state.view === 'chat') return ['Ask your study desk', 'Search your notes and the built-in quick-revision pack.'];
  if (state.view === 'question-bank') return ['Question bank', '1,000 answered practice questions across ten ICSE subjects.'];
  if (state.view === 'calendar') return ['Study calendar', 'Exams, revision sessions, and important dates in one place.'];
  if (state.view === 'subject') {
    const subject = subjectById(state.subject);
    return [subject?.label || 'Subject', 'Your notes and quick references for this subject.'];
  }
  return ['Your study desk', 'A quiet place for everything you’re learning.'];
}

function navButton(view, label, glyph) {
  return `<button class="nav-item ${state.view === view ? 'active' : ''}" data-view="${view}"><span class="nav-icon">${glyph}</span>${label}</button>`;
}

function renderShell() {
  const [title, subtitle] = viewTitle();
  const netLabel = navigator.onLine ? 'Local · online' : 'Working offline';
  app.innerHTML = `<div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="brand">${icon}<div><div class="brand-title">Study Desk</div><div class="brand-subtitle">ICSE · Class 10</div></div></div>
      <div class="nav-caption">Workspace</div>
      <nav class="nav-list" aria-label="Main navigation">
        ${navButton('home', 'Overview', '⌂')}
        ${navButton('library', 'Study library', '▤')}
        ${navButton('chat', 'AI study chatbot', '✳')}
        ${navButton('question-bank', 'Question bank · 1,000', '☷')}
        ${navButton('calendar', 'Study calendar', '▦')}
      </nav>
      <div class="nav-caption">Your subjects</div>
      <div class="subject-nav">${SUBJECTS.map((subject) => `<button class="subject-link ${state.view === 'subject' && state.subject === subject.id ? 'active' : ''}" data-subject="${subject.id}"><span class="subject-dot" style="background:${subject.color}"></span>${escapeHTML(subject.short)}</button>`).join('')}</div>
      <div class="sidebar-bottom">
        <div class="offline-card"><div class="offline-title"><span class="status-dot" style="display:inline-block;margin-right:7px"></span>${netLabel}</div><div class="offline-copy">Your notes, questions, and calendar stay in this browser on this computer.</div><div class="storage-meter"><span></span></div></div>
      <div class="sidebar-footnote"><button class="btn btn-ghost" style="color:#d2dccf" data-action="install-app">Install on this computer</button><br>Private by design · Stored on this device</div>
    </div>
  </aside>
    <button class="mobile-scrim" id="mobile-scrim" aria-label="Close navigation"></button>
    <main class="workspace">
      <header class="topbar">
        <button class="mobile-menu" id="menu-toggle" aria-label="Open navigation">☰</button>
        <div class="top-title">${escapeHTML(title)}<span class="top-subtitle">${escapeHTML(subtitle)}</span></div>
        <form class="global-search" id="global-search" role="search"><span class="search-symbol">⌕</span><input id="global-query" aria-label="Search your study materials" placeholder="Search your notes, chapters, or ask a question…" value="${escapeHTML(state.searchText)}" /><span class="key-hint">Enter ↵</span></form>
        <div class="status-pill" title="The study desk stores your materials locally"><span class="status-dot"></span>${netLabel}</div>
      </header>
      <section class="page" id="page-content"></section>
    </main>
  </div>`;
  renderCurrentPage();
}

function localDocs() {
  return state.docs;
}

function docById(id) {
  return STARTER_DOCS.find((item) => item.id === id) || state.docs.find((item) => item.id === id);
}

function imageUrl(document, index = 0) {
  const image = document.images?.[index]?.blob || (index === 0 ? document.imageBlob : null);
  if (!image) return '';
  const key = `${document.id}:${index}`;
  if (!image.__studyUrl) {
    try { image.__studyUrl = URL.createObjectURL(image); } catch { /* Blob may be frozen in some browsers. */ }
  }
  return image.__studyUrl || URL.createObjectURL(image);
}

function subjectCount(id) {
  return state.docs.filter((document) => document.subject === id).length + STARTER_DOCS.filter((document) => document.subject === id).length;
}

function renderCurrentPage() {
  const target = document.querySelector('#page-content');
  if (!target) return;
  if (state.view === 'home') target.innerHTML = renderHome();
  else if (state.view === 'library') target.innerHTML = renderLibrary();
  else if (state.view === 'chat') target.innerHTML = renderChat();
  else if (state.view === 'question-bank') target.innerHTML = renderQuestionBank();
  else if (state.view === 'calendar') target.innerHTML = renderCalendar();
  else if (state.view === 'subject') target.innerHTML = renderSubject();
  else target.innerHTML = renderHome();
  if (state.view === 'chat') scrollChatToBottom();
}

function renderHome() {
  const customCount = state.docs.length;
  const examCount = state.events.filter((event) => event.type === 'Exam').length;
  const nextEvent = state.events.filter((event) => event.date >= localDateToday()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const starterCount = STARTER_DOCS.length;
  const cards = [
    ['maths', 'M', 'Mathematics'], ['hindi', 'हि', 'Hindi'], ['physics', 'P', 'Physics'], ['computer', 'C', 'Computer'], ['chemistry', 'Ch', 'Chemistry'],
    ['biology', 'B', 'Biology'], ['history', 'H', 'History/Civics'], ['english-language', 'EL', 'English Language'], ['english-literature', 'ET', 'English Literature'], ['geography', 'G', 'Geography'],
  ];
  const quick = [
    ['Mathematics', 'What is the quadratic formula and how do I use the discriminant?', 'maths'],
    ['Physics', 'Explain Ohm’s law and series vs parallel resistance.', 'physics'],
    ['Biology', 'How does photosynthesis work?', 'biology'],
    ['Geography', 'How do contour lines show slope on a topo map?', 'geography'],
  ];
  return `<div class="hero"><div class="hero-content"><div class="eyebrow">Your own offline study space</div><h1>Small steps add up<br>to big understanding.</h1><p>Keep class notes, textbook pages, questions, and exam dates together. Ask a question and find the closest source in your own library.</p><div class="hero-actions"><button class="btn btn-light" data-action="open-add">＋ Add study material</button><button class="btn btn-outline" data-view="chat">✳ Ask a question</button></div></div></div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-label">Your materials</div><div class="stat-value">${customCount}</div><div class="stat-foot">saved on this device</div></div>
      <div class="stat-card"><div class="stat-label">Quick references</div><div class="stat-value">${starterCount}</div><div class="stat-foot">across all ten subjects</div></div>
      <div class="stat-card"><div class="stat-label">Study dates</div><div class="stat-value">${state.events.length}</div><div class="stat-foot">${examCount} exam ${examCount === 1 ? 'date' : 'dates'} added</div></div>
      <div class="stat-card"><div class="stat-label">Next on your calendar</div><div class="stat-value" style="font-size:17px">${nextEvent ? escapeHTML(formatDate(nextEvent.date)) : '—'}</div><div class="stat-foot">${nextEvent ? escapeHTML(nextEvent.title) : 'add an exam or revision task'}</div></div>
    </div>
    <div class="columns">
      <section class="card card-pad"><div class="card-head"><div><h2>Choose a subject</h2><p>Your starter notes and materials stay organised by subject.</p></div><button class="btn btn-ghost" data-view="library">Browse library →</button></div><div class="subject-grid">${cards.map(([id, abbr, label]) => { const subject = subjectById(id); return `<button class="subject-card" data-subject="${id}" style="--subject-color:${subject?.color}"><span class="subject-abbr">${abbr}</span><span class="subject-name">${escapeHTML(label)} <span style="color:#a2a397">· ${subjectCount(id)}</span></span></button>`; }).join('')}</div><div class="local-note"><span>✦</span><span><strong>Quick-revision pack:</strong> starter notes are general study pointers, not a complete or official ICSE syllabus. Add your prescribed textbook chapters and teacher notes for better answers.</span></div></section>
      <aside class="card card-pad"><div class="card-head"><div><h2>Try a question</h2><p>Answers point back to their source notes.</p></div></div><div class="quick-prompts">${quick.map(([subject, prompt, id]) => `<button class="prompt-card" data-prompt="${escapeHTML(prompt)}" data-prompt-subject="${id}"><span class="prompt-meta">${escapeHTML(subject)}</span>${escapeHTML(prompt)}</button>`).join('')}</div><div style="margin-top:13px"><button class="btn btn-outline btn-sm" data-action="open-add">＋ Add a PDF, image, or note</button></div></aside>
    </div>
    <div class="section-heading"><div><h2>Recently added</h2><p class="subtle">Your newest uploads and typed notes.</p></div><button class="btn btn-outline btn-sm" data-view="library">Open library</button></div>
    ${state.docs.length ? `<div class="document-list">${state.docs.toSorted((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0,4).map((doc) => documentRow(doc)).join('')}</div>` : `<div class="empty-state"><strong>Your library is ready for its first note.</strong>Add a PDF, image, or typed note to search it offline.</div>`}`;
}

function documentRow(document) {
  const subject = subjectById(document.subject);
  const typeLabel = document.type === 'pdf' ? 'PDF' : document.type === 'image' ? 'Image' : 'Note';
  const glyph = document.type === 'pdf' ? 'PDF' : document.type === 'image' ? 'IMG' : 'Aa';
  const fileName = document.name || document.title || 'Untitled note';
  return `<div class="document-row"><div class="document-icon">${glyph}</div><div><div class="document-title">${escapeHTML(document.title || fileName)}</div><div class="document-meta">${escapeHTML(subject?.short || 'Subject')} · ${escapeHTML(document.chapter || typeLabel)} · ${escapeHTML(formatDate((document.updatedAt || '').slice(0,10)))}</div></div><div class="doc-actions"><span class="type-tag">${typeLabel}</span><button class="icon-btn" data-action="open-doc" data-id="${escapeHTML(document.id)}" aria-label="Open ${escapeHTML(fileName)}">↗</button></div></div>`;
}

function renderLibrary() {
  const query = state.searchText.toLocaleLowerCase();
  const visible = state.docs.filter((document) => {
    const subjectMatch = state.subject === 'all' || document.subject === state.subject;
    const typeMatch = state.filter === 'all' || document.type === state.filter;
    const searchMatch = !query || `${document.title} ${document.chapter} ${document.name} ${document.text}`.toLocaleLowerCase().includes(query);
    return subjectMatch && typeMatch && searchMatch;
  }).sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const activeName = state.subject === 'all' ? 'All subjects' : subjectById(state.subject)?.label || 'All subjects';
  return `<div class="section-heading" style="margin-top:0"><div><div class="eyebrow">A library that stays yours</div><h1>Study library</h1><p class="subtle">Browse your files and notes. Everything here is stored in this browser on this computer.</p></div><button class="btn" data-action="open-add">＋ Add material</button></div>
    <div class="toolbar" style="margin-bottom:14px"><select class="select" id="library-subject" aria-label="Filter by subject"><option value="all">All subjects</option>${selectedSubjectOptions(state.subject === 'all' ? '' : state.subject)}</select><select class="select" id="library-type" aria-label="Filter by document type"><option value="all" ${state.filter === 'all' ? 'selected' : ''}>Every type</option><option value="pdf" ${state.filter === 'pdf' ? 'selected' : ''}>PDFs</option><option value="image" ${state.filter === 'image' ? 'selected' : ''}>Images</option><option value="note" ${state.filter === 'note' ? 'selected' : ''}>Typed notes</option></select><span class="subtle" style="font-size:11px">${visible.length} ${visible.length === 1 ? 'item' : 'items'} · ${escapeHTML(activeName)}</span></div>
    ${visible.length ? `<div class="document-list">${visible.map((doc) => `<div class="document-row"><div class="document-icon">${doc.type === 'pdf' ? 'PDF' : doc.type === 'image' ? 'IMG' : 'Aa'}</div><div><div class="document-title">${escapeHTML(doc.title || doc.name || 'Untitled')}</div><div class="document-meta">${escapeHTML(subjectById(doc.subject)?.short || 'Subject')} · ${escapeHTML(doc.chapter || (doc.type === 'pdf' ? 'PDF' : doc.type === 'image' ? 'Image' : 'Note'))} · ${doc.pageTexts?.length ? `${doc.pageTexts.length} pages indexed · ` : ''}${doc.ocrStatus === 'done' ? 'OCR indexed · ' : ''}${escapeHTML(formatDate((doc.updatedAt || '').slice(0,10)))}</div></div><div class="doc-actions"><span class="type-tag">${doc.type.toUpperCase()}</span><button class="icon-btn" data-action="open-doc" data-id="${escapeHTML(doc.id)}" aria-label="Open material">↗</button><button class="icon-btn" data-action="delete-doc" data-id="${escapeHTML(doc.id)}" aria-label="Delete material">×</button></div></div>`).join('')}</div>` : `<div class="empty-state"><strong>${state.docs.length ? 'No material matches those filters.' : 'Your library is empty so far.'}</strong>${state.docs.length ? 'Try another subject or search term.' : 'Add a PDF, image, or typed note and it will appear here.'}<div style="margin-top:13px"><button class="btn btn-sm" data-action="open-add">＋ Add material</button></div></div>`}
    <div class="local-note"><span>✦</span><span><strong>Privacy note:</strong> files and extracted text are stored only in this browser’s local database; they are not sent to an online AI service or synced to another device.</span></div>`;
}

function sourcePage(document, query) {
  if (!document.pageTexts?.length) return null;
  const tokens = String(query).toLocaleLowerCase().split(/\W+/).filter(Boolean);
  let best = document.pageTexts[0];
  let topScore = -1;
  for (const page of document.pageTexts) {
    const body = page.text.toLocaleLowerCase();
    const score = tokens.filter((token) => token.length > 1 && body.includes(token)).length;
    if (score > topScore) { best = page; topScore = score; }
  }
  return best?.page;
}

function renderMessageSources(message) {
  if (!message.sources?.length) return '';
  return `<div class="answer-sources">${message.sources.map((source) => {
    const document = docById(source.id);
    const pageIndex = document?.images?.findIndex((image) => image.page === source.page) ?? 0;
    const blobImage = document ? (document.imageBlob || (pageIndex >= 0 ? document.images?.[pageIndex]?.blob : null)) : null;
    const thumbnail = blobImage ? `<img src="${imageUrl(document, document.imageBlob ? 0 : Math.max(0,pageIndex))}" alt="Study source preview" />` : `<span class="document-icon">${document?.type === 'pdf' ? 'PDF' : document?.type === 'image' ? 'IMG' : 'Aa'}</span>`;
    return `<div class="source-card">${thumbnail}<div><button data-action="open-doc" data-id="${escapeHTML(source.id)}">${escapeHTML(source.title)}</button><small>${escapeHTML(source.chapter || 'Study material')}${source.page ? ` · page ${source.page}` : ''}</small></div></div>`;
  }).join('')}</div>`;
}

function renderChat() {
  const content = state.messages.length ? state.messages.map((message) => message.role === 'user'
    ? `<div class="message user">${escapeHTML(message.text)}</div>`
    : `<div class="message assistant"><div class="message-label">Study Desk · local notes</div><div class="answer-box">${escapeHTML(message.text)}${message.tip ? `\n\n${escapeHTML(message.tip)}` : ''}</div>${renderMessageSources(message)}</div>`).join('')
    : `<div class="chat-welcome"><div class="chat-welcome-mark">✳</div><h2>Ask what you’re working on.</h2><p>I search your saved notes and the built-in quick-revision pack, then show which sources matched. I work offline; this is not a cloud generative AI model.</p><button class="prompt-card" data-prompt="Explain photosynthesis and include its word equation." data-prompt-subject="biology"><span class="prompt-meta">Example · Biology</span>Explain photosynthesis and include its word equation.</button><button class="prompt-card" data-prompt="How does a formal letter differ from an email?" data-prompt-subject="english-language" style="margin-top:8px"><span class="prompt-meta">Example · English Language</span>How does a formal letter differ from an email?</button></div>`;
  const chapterDocs = [...STARTER_DOCS, ...state.docs].filter((document) => state.subject === 'all' || document.subject === state.subject);
  const chapters = [...new Set(chapterDocs.map((document) => document.chapter).filter(Boolean))].sort((a,b) => a.localeCompare(b));
  const types = [['all','Every type'],['pdf','PDFs'],['image','Images'],['note','Typed notes'],['reference','Quick references']];
  return `<div class="section-heading" style="margin-top:0"><div><div class="eyebrow">Offline answer desk</div><h1>Ask your study desk</h1><p class="subtle">Search by subject, material type, chapter, and keywords. Answers cite the closest source matches.</p></div><button class="btn btn-outline btn-sm" data-action="clear-chat">Clear chat</button></div>
    <div class="chat-layout"><section class="card chat-main"><div class="chat-messages" id="chat-messages">${content}</div>
      <div class="chat-filters" aria-label="Search filters"><select class="select" id="chat-subject" aria-label="Filter by subject"><option value="all" ${state.subject === 'all' ? 'selected' : ''}>All subjects</option>${SUBJECTS.map((subject) => `<option value="${subject.id}" ${state.subject === subject.id ? 'selected' : ''}>${escapeHTML(subject.short)}</option>`).join('')}</select><select class="select" id="chat-type" aria-label="Filter by document type">${types.map(([value,label]) => `<option value="${value}" ${state.chatFilters.type === value ? 'selected' : ''}>${label}</option>`).join('')}</select><select class="select" id="chat-chapter" aria-label="Filter by chapter"><option value="all">All chapters</option>${chapters.map((chapter) => `<option value="${escapeHTML(chapter)}" ${state.chatFilters.chapter === chapter ? 'selected' : ''}>${escapeHTML(chapter)}</option>`).join('')}</select></div>
      <form class="chat-composer" id="chat-form"><input id="chat-question" placeholder="Ask a question about your study material…" aria-label="Ask a question" required /><button class="btn" type="submit">Ask <span aria-hidden="true">↑</span></button></form></section>
      <aside class="card chat-side"><h3>Help it find the right note</h3><div class="quick-prompts"><button class="prompt-card" data-action="focus-chat">Name a chapter or key term.</button><button class="prompt-card" data-action="open-add">Add your class notes or textbook PDF first.</button><button class="prompt-card" data-view="library">See what is already indexed.</button></div><p class="answer-disclaimer">Starter pack notes are concise general refreshers, not an official or complete ICSE syllabus. Verify exact set-text details against your prescribed books.</p></aside></div>`;
}

function renderQuestionBank() {
  const query = state.qbankQuery.trim().toLocaleLowerCase();
  const all = questionBank.questions || [];
  const filtered = all.filter((q) => (state.qbankSubject === 'all' || q.subject === state.qbankSubject)
    && (state.qbankSource === 'all' || (q.source?.type || 'practice') === state.qbankSource)
    && (!query || `${q.question} ${q.answer} ${q.topic} ${q.chapter} ${q.id}`.toLocaleLowerCase().includes(query)));
  const shown = filtered.slice(0, 80);
  return `<div class="section-heading" style="margin-top:0"><div><div class="eyebrow">Offline · searchable · answered</div><h1>Question bank</h1><p class="subtle">${filtered.length.toLocaleString()} matching questions of ${all.length.toLocaleString()} total · show answers as you revise.</p></div><button class="btn" data-view="chat">✳ Ask chatbot</button></div>
    <section class="card card-pad" style="margin-bottom:18px"><div class="toolbar"><input class="input" id="qbank-query" value="${escapeHTML(state.qbankQuery)}" placeholder="Search question, answer, topic…" aria-label="Search question bank"><select class="select" id="qbank-subject"><option value="all">All subjects</option>${SUBJECTS.map(s=>`<option value="${s.id}" ${state.qbankSubject===s.id?'selected':''}>${escapeHTML(s.label)}</option>`).join('')}</select><select class="select" id="qbank-source"><option value="all" ${state.qbankSource==='all'?'selected':''}>All types</option><option value="practice" ${state.qbankSource==='practice'?'selected':''}>Practice questions</option><option value="pyq-adapted" ${state.qbankSource==='pyq-adapted'?'selected':''}>PYQ-style practice</option></select></div><p class="subtle" style="margin:12px 0 0">PYQ-style items are original practice adaptations, not claimed verbatim official past-paper questions. Upload your own official papers to search them too.</p></section>
    <div class="qbank-cards">${shown.map(q=>`<article class="question-card"><div class="question-card-meta"><span>${escapeHTML(SUBJECTS.find(s=>s.id===q.subject)?.short||q.subject)}</span><span>${escapeHTML(q.chapter||q.topic)}</span><span>${escapeHTML(q.difficulty||'Practice')}</span></div><div class="question-card-id">${escapeHTML(q.id)}</div><h3>${escapeHTML(q.question)}</h3><details class="question-answer-details"><summary>Show answer</summary><div class="question-answer">${escapeHTML(q.answer)}</div></details><div class="question-source-row"><span class="type-tag ${(q.source?.type==='pyq-adapted')?'pyq-tag':''}">${q.source?.type==='pyq-adapted'?'PYQ-style practice':'Original practice'}</span><button class="btn btn-outline btn-sm" data-action="ask-bank-question" data-question="${escapeHTML(q.question)}" data-subject="${escapeHTML(q.subject)}">Ask chatbot</button></div></article>`).join('')}</div>${filtered.length>80?`<p class="subtle" style="margin-top:16px">Showing first 80 results. Narrow your search to find more.</p>`:''}${!shown.length?'<div class="empty-state">No questions matched. Try another keyword or subject.</div>':''}`;
}

function localDateToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function renderCalendar() {
  const month = state.month;
  const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(month);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - offset);
  const endGrid = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 41);
  const keyOf = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const startKey = keyOf(start);
  const endKey = keyOf(endGrid);
  const calendarEvents = state.events.filter((event) => event.date >= startKey && event.date <= endKey);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const events = calendarEvents.filter((event) => event.date === dateKey);
    return `<div class="day-cell ${date.getMonth() !== month.getMonth() ? 'outside' : ''} ${dateKey === localDateToday() ? 'today' : ''}"><div class="day-num">${date.getDate()}</div>${events.slice(0,2).map((event) => `<div class="day-event" title="${escapeHTML(event.title)}">${escapeHTML(event.title)}</div>`).join('')}${events.length > 2 ? `<div class="day-event">+${events.length - 2} more</div>` : ''}</div>`;
  }).join('');
  const upcoming = state.events.filter((event) => event.date >= localDateToday()).sort((a,b) => a.date.localeCompare(b.date)).slice(0,12);
  return `<div class="section-heading" style="margin-top:0"><div><div class="eyebrow">Make room to revise</div><h1>Study calendar</h1><p class="subtle">Keep exams, datesheets, deadlines, and your own revision plans together.</p></div><div class="toolbar"><input id="datesheet-file" type="file" accept=".ics,.csv,.txt,text/calendar,text/csv" hidden /><button class="btn btn-outline" data-action="import-datesheet">Import datesheet</button><button class="btn" data-action="add-event">＋ Add date</button></div></div>
    <div class="calendar-layout"><section class="card calendar-card"><div class="calendar-head"><button class="icon-btn" data-action="month-prev" aria-label="Previous month">‹</button><div class="month-label">${escapeHTML(monthTitle)}</div><button class="icon-btn" data-action="month-next" aria-label="Next month">›</button></div><div class="calendar-grid"><div class="weekday">Mon</div><div class="weekday">Tue</div><div class="weekday">Wed</div><div class="weekday">Thu</div><div class="weekday">Fri</div><div class="weekday">Sat</div><div class="weekday">Sun</div>${days}</div><p class="calendar-help">Dates are kept on this device. Import a .ics or simple CSV datesheet, or add a date by hand.</p></section>
      <aside class="card card-pad"><div class="card-head"><div><h2>Coming up</h2><p>Next dates and revision tasks.</p></div></div>${upcoming.length ? `<div class="event-list">${upcoming.map((event) => { const date = new Date(`${event.date}T12:00:00`); return `<div class="event-row"><div class="event-date"><strong>${date.getDate()}</strong>${escapeHTML(new Intl.DateTimeFormat(undefined,{month:'short'}).format(date))}</div><div><div class="event-title">${escapeHTML(event.title)}</div><div class="event-meta">${escapeHTML(event.type)}${event.subject && event.subject !== 'all' ? ` · ${escapeHTML(subjectById(event.subject)?.short || '')}` : ''}</div></div><button class="icon-btn" data-action="delete-event" data-id="${escapeHTML(event.id)}" aria-label="Remove date">×</button></div>`; }).join('')}</div>` : `<div class="empty-state"><strong>No dates added yet.</strong>Add an exam or make a small revision plan.</div>`}<div style="margin-top:12px"><button class="btn btn-outline btn-sm" data-action="add-event">＋ Add exam or task</button></div></aside></div>`;
}

function renderSubject() {
  const subject = subjectById(state.subject);
  if (!subject) { state.view = 'home'; return renderHome(); }
  const docs = state.docs.filter((document) => document.subject === subject.id).sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const refs = STARTER_DOCS.filter((document) => document.subject === subject.id);
  return `<div class="section-heading" style="margin-top:0"><div><div class="eyebrow">ICSE · Class 10</div><h1>${escapeHTML(subject.label)}</h1><p class="subtle">${docs.length} personal ${docs.length === 1 ? 'item' : 'items'} and ${refs.length} starter ${refs.length === 1 ? 'reference' : 'references'}.</p></div><div class="toolbar"><button class="btn btn-outline" data-action="ask-subject">✳ Ask about ${escapeHTML(subject.short)}</button><button class="btn" data-action="open-add">＋ Add material</button></div></div>
    <div class="columns"><section class="card card-pad"><div class="card-head"><div><h2>Your materials</h2><p>Private to this browser.</p></div></div>${docs.length ? `<div class="document-list">${docs.map((doc) => `<div class="document-row"><div class="document-icon">${doc.type === 'pdf' ? 'PDF' : doc.type === 'image' ? 'IMG' : 'Aa'}</div><div><div class="document-title">${escapeHTML(doc.title || doc.name || 'Untitled')}</div><div class="document-meta">${escapeHTML(doc.chapter || doc.type)}${doc.pageTexts?.length ? ` · ${doc.pageTexts.length} pages` : ''}</div></div><button class="icon-btn" data-action="open-doc" data-id="${escapeHTML(doc.id)}">↗</button></div>`).join('')}</div>` : `<div class="empty-state"><strong>No personal material here yet.</strong>Add the notes and prescribed chapters you want answers based on.</div>`}</section><section class="card card-pad"><div class="card-head"><div><h2>Quick references</h2><p>General study refreshers; verify with your class materials.</p></div></div><div class="document-list">${refs.map((doc) => `<div class="document-row"><div class="document-icon">✦</div><div><div class="document-title">${escapeHTML(doc.title)}</div><div class="document-meta">${escapeHTML(doc.chapter)} · Study Desk starter pack</div></div><button class="icon-btn" data-action="open-doc" data-id="${doc.id}">↗</button></div>`).join('')}</div></section></div>`;
}

function setView(view) {
  state.view = view;
  if (view !== 'subject') state.subject = 'all';
  renderShell();
  closeMobileMenu();
}

function openModal(content) {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`;
}

function closeModal() { modalRoot.innerHTML = ''; }

function openAddModal() {
  openModal(`<div class="modal-head"><div><div class="eyebrow">Add to your local library</div><h2>Bring your study material together</h2></div><button class="icon-btn" data-action="close-modal" aria-label="Close">×</button></div>
    <form id="add-form"><div class="field"><label class="field-label" for="add-title">Title or file label</label><input class="input" style="width:100%" id="add-title" name="title" placeholder="e.g. Light — chapter notes" /></div><div class="toolbar"><div class="field" style="flex:1"><label class="field-label" for="add-subject">Subject</label><select class="select" style="width:100%" id="add-subject" name="subject">${selectedSubjectOptions(state.subject === 'all' ? 'maths' : state.subject)}</select></div><div class="field" style="flex:1"><label class="field-label" for="add-chapter">Chapter / topic</label><input class="input" style="width:100%" id="add-chapter" name="chapter" placeholder="Optional" /></div></div>
    <div class="field"><label class="field-label" for="add-text">Type or paste notes (optional if uploading a file)</label><textarea class="textarea" id="add-text" name="text" placeholder="Add definitions, worked examples, teacher notes, or a short description of the image…"></textarea></div>
    <div class="field"><label class="field-label">Attach PDFs or images (optional)</label><div class="dropzone"><div class="dropzone-icon">＋</div><strong>Choose files from this computer</strong><span>PDF, PNG, JPG, WEBP · stored only in this browser</span><input id="add-files" name="files" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" multiple aria-label="Choose PDF or image files" /></div><div id="upload-status" class="subtle" style="margin-top:8px;font-size:10px"></div></div>
    <div class="local-note"><span>✦</span><span>PDF text is indexed page by page. Images and scanned pages can be read with the bundled offline English OCR model. Hindi handwriting/printed OCR needs a later language pack; Hindi notes can be typed directly.</span></div>
    <div class="toolbar" style="justify-content:flex-end"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn" type="submit" id="save-material">Save to this device</button></div></form>`);
}

async function refreshData() {
  [state.docs, state.events] = await Promise.all([getAllDocuments(), getAllEvents()]);
  renderCurrentPage();
}

function newId() { return crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

function progressLabel(progress, name) {
  if (progress?.status === 'page') return `Reading ${escapeHTML(name)} · page ${progress.current} of ${progress.total}…`;
  if (progress?.status === 'recognizing text') return `Reading ${escapeHTML(name)} · offline OCR ${Math.round((progress.progress || 0) * 100)}%…`;
  if (progress?.status === 'loading language traineddata') return 'Preparing the offline English reading model…';
  if (progress?.status === 'loading tesseract core') return 'Starting the offline OCR engine…';
  return `Indexing ${escapeHTML(name)}…`;
}

async function handleAddMaterial(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const files = Array.from(form.querySelector('#add-files').files || []);
  const typedText = String(formData.get('text') || '').trim();
  if (!files.length && !typedText) { toast('Add some typed notes or choose at least one PDF/image.'); return; }
  const button = form.querySelector('#save-material');
  const status = form.querySelector('#upload-status');
  button.disabled = true;
  form.querySelectorAll('input, textarea, select').forEach((field) => { field.disabled = true; });
  const subject = String(formData.get('subject'));
  const chapter = String(formData.get('chapter') || '').trim();
  const titleInput = String(formData.get('title') || '').trim();
  let saved = 0;
  try {
    const ingestion = files.length ? await import('./ingest.js') : null;
    if (typedText) {
      status.textContent = 'Saving your typed note…';
      const now = new Date().toISOString();
      await putDocument({ id: newId(), title: titleInput || chapter || 'Untitled study note', name: '', subject, chapter, text: typedText, type: 'note', source: 'Your typed note', createdAt: now, updatedAt: now, pageTexts: [], images: [], ocrStatus: 'not-needed' });
      saved += 1;
    }
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const type = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : file.type.startsWith('image/') ? 'image' : '';
      if (!type) { toast(`Skipped ${file.name}: choose a PDF or image file.`); continue; }
      const now = new Date().toISOString();
      const document = {
        id: newId(), title: titleInput || file.name.replace(/\.[^.]+$/, ''), name: file.name, subject, chapter,
        text: typedText, type, source: `Your ${type === 'pdf' ? 'PDF' : 'image'} · ${file.name}`, createdAt: now, updatedAt: now, pageTexts: [], images: [],
        ocrStatus: type === 'image' ? 'pending' : 'not-needed',
      };
      status.innerHTML = `<div class="upload-progress"><span></span></div>${escapeHTML(file.name)} · ${index + 1} of ${files.length}`;
      if (type === 'pdf') {
        try {
          const result = await ingestion.readPdf(file, (message) => { status.innerHTML = `<div class="upload-progress"><span></span></div>${progressLabel(message, file.name)}`; });
          document.pageTexts = result.pageTexts;
          document.images = result.images;
          document.text = [typedText, ingestion.pagesToText(result.pageTexts)].filter(Boolean).join('\n\n');
          document.ocrStatus = result.pageTexts.some((page) => page.text) ? 'done' : 'no-text';
          document.pageCount = result.numPages;
        } catch (error) {
          console.error(error);
          toast(`Could not read ${file.name}. It may be password protected or damaged.`);
          continue;
        }
      } else {
        document.imageBlob = file;
        try {
          const recognized = await ingestion.recognizeImage(file, (message) => { status.innerHTML = `<div class="upload-progress"><span></span></div>${progressLabel(message, file.name)}`; });
          document.text = [typedText, recognized].filter(Boolean).join('\n\n');
          document.ocrStatus = recognized ? 'done' : 'no-text';
        } catch (error) {
          console.warn('Image saved without OCR text:', error);
          document.ocrStatus = 'unavailable';
          toast('Image was saved, but OCR could not start. The image is still available to open.');
        }
      }
      await putDocument(document);
      saved += 1;
    }
    await refreshData();
    closeModal();
    toast(`${saved} ${saved === 1 ? 'item' : 'items'} saved on this device.`);
  } catch (error) {
    console.error(error);
    toast(error?.name === 'QuotaExceededError' ? 'Browser storage is full. Remove a large item or export your original file elsewhere.' : 'Could not save this material. Check browser storage permissions and try again.');
    button.disabled = false;
    form.querySelectorAll('input, textarea, select').forEach((field) => { field.disabled = false; });
  }
}

function openEventModal() {
  const today = localDateToday();
  openModal(`<div class="modal-head"><div><div class="eyebrow">Keep a date in view</div><h2>Add an exam or study task</h2></div><button class="icon-btn" data-action="close-modal" aria-label="Close">×</button></div><form id="event-form"><div class="field"><label class="field-label" for="event-title">What is coming up?</label><input class="input" style="width:100%" name="title" id="event-title" maxlength="120" placeholder="e.g. Physics revision — Light" required /></div><div class="toolbar"><div class="field" style="flex:1"><label class="field-label" for="event-date">Date</label><input class="input" style="width:100%" type="date" name="date" id="event-date" value="${today}" required /></div><div class="field" style="flex:1"><label class="field-label" for="event-type">Type</label><select class="select" style="width:100%" name="type" id="event-type"><option>Exam</option><option>Revision</option><option>Deadline</option><option>Personal</option></select></div></div><div class="field"><label class="field-label" for="event-subject">Subject (optional)</label><select class="select" style="width:100%" name="subject" id="event-subject"><option value="all">No subject</option>${selectedSubjectOptions('maths')}</select></div><div class="field"><label class="field-label" for="event-details">Notes (optional)</label><textarea class="textarea" style="min-height:80px" name="details" id="event-details" placeholder="What to revise or remember…"></textarea></div><div class="toolbar" style="justify-content:flex-end"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn" type="submit">Save date</button></div></form>`);
}

async function submitEvent(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const record = { id: newId(), title: String(formData.get('title')).trim(), date: String(formData.get('date')), type: String(formData.get('type')), subject: String(formData.get('subject') || 'all'), details: String(formData.get('details') || '').trim(), createdAt: new Date().toISOString() };
  await putEvent(record);
  state.month = new Date(Number(record.date.slice(0,4)), Number(record.date.slice(5,7)) - 1, 1);
  await refreshData();
  closeModal();
  toast('Date added to your local study calendar.');
}

function parseCsv(text) {
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(value.trim()); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; value = '';
    } else value += char;
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows.shift().map((header) => header.toLowerCase().replace(/[^a-z]/g,''));
  const titleIndex = headers.findIndex((header) => ['title','event','exam','name','subject'].includes(header));
  const dateIndex = headers.findIndex((header) => ['date','startdate','examdate','dtstart'].includes(header));
  const typeIndex = headers.findIndex((header) => ['type','category'].includes(header));
  const datePattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const dayFirstPattern = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/;
  return rows.map((cells) => {
    const rawDate = (cells[dateIndex >= 0 ? dateIndex : 1] || '').trim();
    let date = rawDate;
    let match = rawDate.match(datePattern);
    if (match) date = `${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`;
    else if ((match = rawDate.match(dayFirstPattern))) date = `${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`;
    return { title: (cells[titleIndex >= 0 ? titleIndex : 0] || 'Study date').trim(), date, type: cells[typeIndex] || 'Exam' };
  }).filter((item) => item.title && /^\d{4}-\d{2}-\d{2}$/.test(item.date));
}

function parseIcs(text) {
  const lines = text.replace(/\r?\n[ \t]/g,'').split(/\r?\n/);
  const events = [];
  let current = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') current = {};
    else if (line === 'END:VEVENT' && current) {
      if (current.date && current.title) events.push({ title: current.title, date: current.date, type: 'Exam', details: current.description || '' });
      current = null;
    } else if (current) {
      const separator = line.indexOf(':');
      if (separator < 0) continue;
      const key = line.slice(0, separator).split(';')[0].toUpperCase();
      const value = line.slice(separator + 1).replace(/\\n/g,' ').replace(/\\,/g,',').replace(/\\;/g,';');
      if (key === 'SUMMARY') current.title = value;
      if (key === 'DESCRIPTION') current.description = value;
      if (key === 'DTSTART') {
        const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
        if (match) current.date = `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
  }
  return events;
}

async function importDatesheet(file) {
  try {
    const text = await file.text();
    const events = file.name.toLowerCase().endsWith('.ics') || text.includes('BEGIN:VCALENDAR') ? parseIcs(text) : parseCsv(text);
    if (!events.length) { toast('No dates recognised. CSV needs a header row such as title,date,subject; .ics files are also supported.'); return; }
    let count = 0;
    for (const event of events) {
      const day = new Date(`${event.date}T12:00:00`);
      if (Number.isNaN(day.getTime())) continue;
      await putEvent({ id: newId(), title: event.title, date: event.date, type: event.type || 'Exam', subject: 'all', details: event.details || '', createdAt: new Date().toISOString() });
      count += 1;
    }
    await refreshData();
    toast(`${count} ${count === 1 ? 'date' : 'dates'} imported to this device.`);
  } catch (error) {
    console.error(error);
    toast('Could not import that datesheet. Try a .ics file or CSV with title and date columns.');
  }
}

function closeMobileMenu() {
  document.querySelector('#sidebar')?.classList.remove('open');
  document.querySelector('#mobile-scrim')?.classList.remove('open');
}

function scrollChatToBottom() {
  const container = document.querySelector('#chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

async function askQuestion(question, subjectId = 'all', filters = { type: 'all', chapter: 'all' }) {
  const cleaned = String(question || '').trim();
  if (!cleaned) return;
  state.searchText = cleaned;
  state.subject = subjectId;
  state.chatFilters = { type: filters.type || 'all', chapter: filters.chapter || 'all' };
  state.view = 'chat';
  state.messages.push({ role: 'user', text: cleaned });
  renderShell();
  const box = document.querySelector('#chat-messages');
  if (box) box.insertAdjacentHTML('beforeend', '<div class="message assistant" id="thinking"><div class="message-label">Study Desk · local search</div><div class="answer-box">Looking across your locally saved notes…</div></div>');
  scrollChatToBottom();
  try {
    const results = await searchMaterials(cleaned, subjectId, state.chatFilters);
    const answer = buildAnswer(cleaned, results);
    const chosenSubject = subjectId !== 'all' ? subjectId : results[0]?.document.subject;
    const message = {
      role: 'assistant', text: answer.text, tip: answer.matched ? answerStyle(chosenSubject) : '',
      sources: results.slice(0,3).map(({ document }) => ({ id: document.id, title: document.title || document.name || 'Study source', chapter: document.chapter || document.source || '', page: sourcePage(document, cleaned) })),
    };
    state.messages.push(message);
    writeChatHistory(state.messages);
    const thinking = document.querySelector('#thinking');
    if (thinking) thinking.outerHTML = `<div class="message assistant"><div class="message-label">Study Desk · local notes</div><div class="answer-box">${escapeHTML(message.text)}${message.tip ? `\n\n${escapeHTML(message.tip)}` : ''}</div>${renderMessageSources(message)}</div>`;
    else renderCurrentPage();
    scrollChatToBottom();
  } catch (error) {
    console.error(error);
    document.querySelector('#thinking')?.remove();
    state.messages.push({ role: 'assistant', text: 'I could not read the local library just now. Please check that this browser allows local storage, then try again.', sources: [] });
    renderCurrentPage();
  }
}

async function openDocument(id) {
  let document = docById(id);
  if (!document) document = await getDocument(id);
  if (!document) { toast('That source is no longer in the library.'); return; }
  const subject = subjectById(document.subject);
  const imageBlob = document.imageBlob || document.images?.[0]?.blob;
  const image = imageBlob ? `<img class="modal-image" src="${imageUrl(document, document.imageBlob ? 0 : 0)}" alt="Uploaded study image or scanned page preview" />` : '';
  const removable = !document.immutable;
  openModal(`<div class="modal-head"><div><div class="eyebrow">${escapeHTML(subject?.label || 'Study material')} · ${escapeHTML(document.type || 'reference')}</div><h2>${escapeHTML(document.title || document.name || 'Untitled')}</h2><p class="subtle" style="font-size:11px;margin:6px 0 0">${escapeHTML(document.chapter || document.source || '')}${document.name ? ` · ${escapeHTML(document.name)}` : ''}${document.pageTexts?.length ? ` · ${document.pageTexts.length} pages` : ''}</p></div><button class="icon-btn" data-action="close-modal" aria-label="Close">×</button></div>${image}<div class="detail-text">${escapeHTML(document.text || 'No searchable text was extracted. This file is still saved locally and can be opened from your library.')}</div><div class="toolbar" style="justify-content:space-between;margin-top:12px"><span class="type-tag">${document.ocrStatus === 'done' ? 'Text indexed' : document.ocrStatus === 'unavailable' ? 'Saved · OCR unavailable' : 'Source material'}</span><div>${removable ? `<button class="btn btn-danger btn-sm" data-action="delete-doc" data-id="${escapeHTML(document.id)}">Delete</button>` : ''}<button class="btn btn-outline btn-sm" data-action="close-modal">Close</button></div></div>`);
}

async function deleteDocument(id) {
  const document = docById(id);
  if (document?.immutable) { toast('Built-in starter references cannot be removed.'); return; }
  if (!document) return;
  if (!window.confirm(`Remove “${document.title || document.name}” from this browser? This cannot be undone.`)) return;
  await removeDocument(id);
  state.docs = state.docs.filter((item) => item.id !== id);
  state.messages = state.messages.map((message) => ({ ...message, sources: message.sources?.filter((source) => source.id !== id) || [] }));
  writeChatHistory(state.messages);
  closeModal();
  renderCurrentPage();
  toast('Material removed from this browser.');
}

function startChatWithPrompt(prompt, subject) {
  state.subject = subject || 'all';
  state.chatFilters = { type: 'all', chapter: 'all' };
  askQuestion(prompt, state.subject, state.chatFilters);
}

app.addEventListener('click', async (event) => {
  const viewButton = event.target.closest('[data-view]');
  const subjectButton = event.target.closest('[data-subject]');
  const actionButton = event.target.closest('[data-action]');
  const promptButton = event.target.closest('[data-prompt]');
  if (viewButton) { setView(viewButton.dataset.view); return; }
  if (subjectButton) { state.view = 'subject'; state.subject = subjectButton.dataset.subject; renderShell(); closeMobileMenu(); return; }
  if (promptButton) { startChatWithPrompt(promptButton.dataset.prompt, promptButton.dataset.promptSubject || 'all'); return; }
  if (!actionButton) return;
  const { action, id } = actionButton.dataset;
  if (action === 'open-add') openAddModal();
  else if (action === 'ask-bank-question') { askQuestion(actionButton.dataset.question, actionButton.dataset.subject || 'all'); }
  else if (action === 'install-app') {
    if (state.pendingInstall) {
      const installEvent = state.pendingInstall;
      state.pendingInstall = null;
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      toast(choice?.outcome === 'accepted' ? 'Study Desk is being installed.' : 'You can install it later from your browser menu.');
    } else toast('In Chrome or Edge, use the Install icon in the address bar or choose “Install Study Desk” from the browser menu.');
  }
  else if (action === 'close-modal') closeModal();
  else if (action === 'backdrop-close' && event.target === actionButton) closeModal();
  else if (action === 'open-doc') openDocument(id);
  else if (action === 'delete-doc') deleteDocument(id);
  else if (action === 'add-event') openEventModal();
  else if (action === 'delete-event') {
    if (window.confirm('Remove this date from your local calendar?')) { await removeEvent(id); await refreshData(); toast('Date removed.'); }
  } else if (action === 'month-prev') { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderCurrentPage(); }
  else if (action === 'month-next') { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderCurrentPage(); }
  else if (action === 'import-datesheet') document.querySelector('#datesheet-file')?.click();
  else if (action === 'clear-chat') {
    if (state.messages.length && window.confirm('Clear the saved conversation from this browser?')) { state.messages = []; writeChatHistory([]); renderCurrentPage(); }
  } else if (action === 'focus-chat') document.querySelector('#chat-question')?.focus();
  else if (action === 'ask-subject') { const subject = state.subject; state.view = 'chat'; state.chatFilters = { type: 'all', chapter: 'all' }; renderShell(); document.querySelector('#chat-subject').value = subject; document.querySelector('#chat-question')?.focus(); }
});

app.addEventListener('submit', (event) => {
  if (event.target.id === 'global-search') {
    event.preventDefault();
    const query = document.querySelector('#global-query')?.value || '';
    askQuestion(query, 'all');
  } else if (event.target.id === 'chat-form') {
    event.preventDefault();
    const question = document.querySelector('#chat-question')?.value || '';
    const subject = document.querySelector('#chat-subject')?.value || 'all';
    const type = document.querySelector('#chat-type')?.value || 'all';
    const chapter = document.querySelector('#chat-chapter')?.value || 'all';
    document.querySelector('#chat-question').value = '';
    askQuestion(question, subject, { type, chapter });
  } else if (event.target.id === 'add-form') handleAddMaterial(event);
  else if (event.target.id === 'event-form') submitEvent(event);
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'qbank-subject') { state.qbankSubject = event.target.value; renderCurrentPage(); }
  if (event.target.id === 'qbank-source') { state.qbankSource = event.target.value; renderCurrentPage(); }
  if (event.target.id === 'library-subject') { state.subject = event.target.value; renderCurrentPage(); }
  if (event.target.id === 'library-type') { state.filter = event.target.value; renderCurrentPage(); }
  if (event.target.id === 'chat-subject') { state.subject = event.target.value; state.chatFilters.chapter = 'all'; renderCurrentPage(); }
  if (event.target.id === 'chat-type') state.chatFilters.type = event.target.value;
  if (event.target.id === 'chat-chapter') state.chatFilters.chapter = event.target.value;
  if (event.target.id === 'datesheet-file' && event.target.files?.[0]) importDatesheet(event.target.files[0]);
});

app.addEventListener('input', (event) => {
  if (event.target.id === 'global-query') state.searchText = event.target.value;
  if (event.target.id === 'qbank-query') { state.qbankQuery = event.target.value; const pos = event.target.selectionStart; renderCurrentPage(); const input = document.querySelector('#qbank-query'); input?.focus(); input?.setSelectionRange(pos, pos); }
});

app.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

app.addEventListener('click', (event) => {
  if (event.target.id === 'menu-toggle') {
    document.querySelector('#sidebar')?.classList.toggle('open');
    document.querySelector('#mobile-scrim')?.classList.toggle('open');
  }
  if (event.target.id === 'mobile-scrim') closeMobileMenu();
});

modalRoot.addEventListener('submit', (event) => {
  if (event.target.id === 'add-form') handleAddMaterial(event);
  else if (event.target.id === 'event-form') submitEvent(event);
});

modalRoot.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'close-modal') closeModal();
  else if (action === 'backdrop-close' && event.target === button) closeModal();
  else if (action === 'delete-doc') deleteDocument(id);
});

window.addEventListener('online', () => renderShell());
window.addEventListener('offline', () => renderShell());
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); state.pendingInstall = event; });

async function init() {
  try {
    await openDatabase();
    await requestPersistentStorage();
    await refreshData();
    renderShell();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Offline app-shell registration unavailable:', error));
    }
  } catch (error) {
    console.error(error);
    app.innerHTML = `<main class="page"><div class="empty-state"><strong>Local storage is unavailable.</strong>Study Desk needs IndexedDB in this browser to save notes, files, and dates. Try a current version of Chrome, Edge, Firefox, or Safari with site storage enabled.</div></main>`;
  }
}

init();
