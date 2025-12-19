import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { ScheduleEvent, Improvement, GlossaryTerm, MagazineContent } from '@/types';
import {
  initialSchedule,
  initialImprovements,
  initialGlossary,
  initialMagazineContents,
} from './initialData';

// コレクション名
const COLLECTIONS = {
  schedule: 'schedule',
  improvements: 'improvements',
  glossary: 'glossary',
  magazine: 'magazine',
} as const;

// 汎用的なCRUD関数
async function getAll<T>(collectionName: string): Promise<T[]> {
  const q = query(collection(db, collectionName), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

async function update<T extends { id: string }>(
  collectionName: string,
  item: Partial<T> & { id: string }
): Promise<void> {
  const { id, ...data } = item;
  await updateDoc(doc(db, collectionName, id), data);
}

async function create<T>(collectionName: string, item: Omit<T, 'id'>): Promise<string> {
  const docRef = doc(collection(db, collectionName));
  await setDoc(docRef, item);
  return docRef.id;
}

async function remove(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

// 初期データ投入
async function initializeCollection<T>(
  collectionName: string,
  initialData: Omit<T, 'id'>[]
): Promise<void> {
  const existing = await getDocs(collection(db, collectionName));
  if (existing.empty) {
    const batch = writeBatch(db);
    initialData.forEach((item) => {
      const docRef = doc(collection(db, collectionName));
      batch.set(docRef, item);
    });
    await batch.commit();
    console.log(`Initialized ${collectionName} with default data`);
  }
}

// 初期化関数
export async function initializeDatabase(): Promise<void> {
  await initializeCollection(COLLECTIONS.schedule, initialSchedule);
  await initializeCollection(COLLECTIONS.improvements, initialImprovements);
  await initializeCollection(COLLECTIONS.glossary, initialGlossary);
  await initializeCollection(COLLECTIONS.magazine, initialMagazineContents);
}

// Schedule
export const scheduleApi = {
  getAll: () => getAll<ScheduleEvent>(COLLECTIONS.schedule),
  update: (item: Partial<ScheduleEvent> & { id: string }) =>
    update(COLLECTIONS.schedule, item),
  create: (item: Omit<ScheduleEvent, 'id'>) => create(COLLECTIONS.schedule, item),
  remove: (id: string) => remove(COLLECTIONS.schedule, id),
};

// Improvements
export const improvementsApi = {
  getAll: () => getAll<Improvement>(COLLECTIONS.improvements),
  update: (item: Partial<Improvement> & { id: string }) =>
    update(COLLECTIONS.improvements, item),
  create: (item: Omit<Improvement, 'id'>) => create(COLLECTIONS.improvements, item),
  remove: (id: string) => remove(COLLECTIONS.improvements, id),
};

// Glossary
export const glossaryApi = {
  getAll: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.glossary));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GlossaryTerm));
  },
  update: (item: Partial<GlossaryTerm> & { id: string }) =>
    update(COLLECTIONS.glossary, item),
  create: (item: Omit<GlossaryTerm, 'id'>) => create(COLLECTIONS.glossary, item),
  remove: (id: string) => remove(COLLECTIONS.glossary, id),
};

// Magazine
export const magazineApi = {
  getAll: () => getAll<MagazineContent>(COLLECTIONS.magazine),
  update: (item: Partial<MagazineContent> & { id: string }) =>
    update(COLLECTIONS.magazine, item),
  create: (item: Omit<MagazineContent, 'id'>) => create(COLLECTIONS.magazine, item),
  remove: (id: string) => remove(COLLECTIONS.magazine, id),
  updateOrder: async (items: { id: string; order: number }[]) => {
    const batch = writeBatch(db);
    items.forEach(({ id, order }) => {
      batch.update(doc(db, COLLECTIONS.magazine, id), { order });
    });
    await batch.commit();
  },
};
