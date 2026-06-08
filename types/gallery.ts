export interface Photo {
  id: string;
  albumId: string;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  category: string;
  familyGroup?: string | null;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}
