const DB_NAME = 'icse-study-desk';
const DB_VERSION = 1;
let database;

export function openDatabase() {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local study storage.'));
  });
  return database;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Local storage operation failed.'));
  });
}

export async function getAllDocuments() {
  const db = await openDatabase();
  return requestResult(db.transaction('documents', 'readonly').objectStore('documents').getAll());
}

export async function getDocument(id) {
  const db = await openDatabase();
  return requestResult(db.transaction('documents', 'readonly').objectStore('documents').get(id));
}

export async function putDocument(document) {
  const db = await openDatabase();
  return requestResult(db.transaction('documents', 'readwrite').objectStore('documents').put(document));
}

export async function removeDocument(id) {
  const db = await openDatabase();
  return requestResult(db.transaction('documents', 'readwrite').objectStore('documents').delete(id));
}

export async function getAllEvents() {
  const db = await openDatabase();
  return requestResult(db.transaction('events', 'readonly').objectStore('events').getAll());
}

export async function putEvent(event) {
  const db = await openDatabase();
  return requestResult(db.transaction('events', 'readwrite').objectStore('events').put(event));
}

export async function removeEvent(id) {
  const db = await openDatabase();
  return requestResult(db.transaction('events', 'readwrite').objectStore('events').delete(id));
}

export function readChatHistory() {
  try {
    return JSON.parse(localStorage.getItem('icse-study-chat-v1') || '[]');
  } catch {
    return [];
  }
}

export function writeChatHistory(messages) {
  localStorage.setItem('icse-study-chat-v1', JSON.stringify(messages.slice(-40)));
}

export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
    return navigator.storage?.estimate ? navigator.storage.estimate() : null;
  } catch {
    return null;
  }
}
