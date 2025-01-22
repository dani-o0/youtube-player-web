import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { VideoDocument, ListDocument } from '@/types/database';

// Videos
export async function getUserVideos(userId: string) {
  const q = query(
    collection(db, 'videos'),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VideoDocument[];
}

export async function getFavoriteVideos(userId: string) {
  const q = query(
    collection(db, 'videos'),
    where('userId', '==', userId),
    where('isFavorite', '==', true)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VideoDocument[];
}

export async function toggleVideoFavorite(videoId: string, isFavorite: boolean) {
  const videoRef = doc(db, 'videos', videoId);
  await updateDoc(videoRef, {
    isFavorite
  });
}

export async function addVideo(video: Omit<VideoDocument, 'id'>) {
  const docRef = await addDoc(collection(db, 'videos'), video);
  return docRef.id;
}

// Lists
export async function getUserLists(userId: string) {
  const q = query(
    collection(db, 'lists'),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ListDocument[];
}

export async function getListVideos(listId: string) {
  const listDoc = await getDoc(doc(db, 'lists', listId));
  if (!listDoc.exists()) return [];

  const listData = listDoc.data() as ListDocument;
  const videos: VideoDocument[] = [];

  for (const videoId of listData.videos) {
    const videoDoc = await getDoc(doc(db, 'videos', videoId));
    if (videoDoc.exists()) {
      videos.push({
        id: videoDoc.id,
        ...videoDoc.data()
      } as VideoDocument);
    }
  }

  return videos;
}

export async function getListDetails(listId: string) {
  const listDoc = await getDoc(doc(db, 'lists', listId));
  if (!listDoc.exists()) return null;
  
  return {
    id: listDoc.id,
    ...listDoc.data()
  } as ListDocument;
}

export async function createList(list: Omit<ListDocument, 'id'>) {
  const docRef = await addDoc(collection(db, 'lists'), {
    ...list,
    videos: [] // Asegurarnos de que siempre tenga un array vacío de videos
  });
  return docRef.id;
}

export async function addVideoToList(listId: string, videoId: string) {
  const batch = writeBatch(db);
  
  // Actualizar la lista añadiendo el ID del video
  const listRef = doc(db, 'lists', listId);
  batch.update(listRef, {
    videos: arrayUnion(videoId)
  });
  
  // Actualizar el video con el ID de la lista
  const videoRef = doc(db, 'videos', videoId);
  batch.update(videoRef, {
    listId
  });
  
  // Ejecutar ambas operaciones atómicamente
  await batch.commit();
}

export async function removeVideoFromList(listId: string, videoId: string) {
  const listRef = doc(db, 'lists', listId);
  await updateDoc(listRef, {
    videos: arrayRemove(videoId)
  });

  const videoRef = doc(db, 'videos', videoId);
  await updateDoc(videoRef, {
    listId: null
  });
}

export const updateList = async (listId: string, data: Partial<ListDocument>) => {
  const listRef = doc(db, 'lists', listId)
  await updateDoc(listRef, data)
}

export async function getList(listId: string): Promise<ListDocument | null> {
  const listDoc = await getDoc(doc(db, 'lists', listId))
  if (listDoc.exists()) {
    return { id: listDoc.id, ...listDoc.data() } as ListDocument
  }
  return null
}

export const deleteVideo = async (videoId: string): Promise<void> => {
  const videoRef = doc(db, 'videos', videoId)
  await deleteDoc(videoRef)
}

export const deleteList = async (listId: string): Promise<void> => {
  const listRef = doc(db, 'lists', listId)
  await deleteDoc(listRef)
}

