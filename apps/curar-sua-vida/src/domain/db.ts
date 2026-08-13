import type { Reflection, ChatMessage } from './types'

const DB_NAME = 'curar-vida-db'
const DB_VERSION = 1
const STORE_REFLECTIONS = 'reflections'
const STORE_CHAT = 'chat-history'
const STORE_PREFS = 'prefs'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_REFLECTIONS)) {
        const s = db.createObjectStore(STORE_REFLECTIONS, { keyPath: 'day' })
        s.createIndex('day', 'day', { unique: true })
      }
      if (!db.objectStoreNames.contains(STORE_CHAT)) {
        const s = db.createObjectStore(STORE_CHAT, { keyPath: 'id', autoIncrement: true })
        s.createIndex('day', 'day')
      }
      if (!db.objectStoreNames.contains(STORE_PREFS)) {
        db.createObjectStore(STORE_PREFS, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

// === Reflections ===
export async function getReflection(day: number): Promise<Reflection | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REFLECTIONS, 'readonly')
    const req = tx.objectStore(STORE_REFLECTIONS).get(day)
    req.onsuccess = () => resolve((req.result as Reflection) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function saveReflection(reflection: Reflection): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REFLECTIONS, 'readwrite')
    tx.objectStore(STORE_REFLECTIONS).put({ ...reflection, updatedAt: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllReflections(): Promise<Reflection[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REFLECTIONS, 'readonly')
    const req = tx.objectStore(STORE_REFLECTIONS).getAll()
    req.onsuccess = () => resolve(req.result as Reflection[])
    req.onerror = () => reject(req.error)
  })
}

export async function clearAllReflections(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REFLECTIONS, 'readwrite')
    tx.objectStore(STORE_REFLECTIONS).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// === Chat ===
export async function getChatForDay(day: number): Promise<ChatMessage[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAT, 'readonly')
    const idx = tx.objectStore(STORE_CHAT).index('day')
    const req = idx.getAll(day)
    req.onsuccess = () => resolve((req.result as ChatMessage[]) ?? [])
    req.onerror = () => reject(req.error)
  })
}

export async function saveChatMessage(day: number, msg: ChatMessage): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAT, 'readwrite')
    tx.objectStore(STORE_CHAT).put({ ...msg, day })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// === Preferences (som de voz, etc) ===
export async function getPref<T = any>(key: string): Promise<T | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PREFS, 'readonly')
    const req = tx.objectStore(STORE_PREFS).get(key)
    req.onsuccess = () => resolve(req.result ? (req.result.value as T) : null)
    req.onerror = () => reject(req.error)
  })
}

export async function setPref<T = any>(key: string, value: T): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PREFS, 'readwrite')
    tx.objectStore(STORE_PREFS).put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
