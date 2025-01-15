export interface VideoDocument {
  id: string;
  createdAt: string;
  isFavorite: boolean;
  listId?: string;
  title: string;
  url: string;
  userId: string;
}

export interface ListDocument {
  id: string;
  name: string;
  userId: string;
  videos: string[];
}

