export interface CommunityPost {
  id: string;
  authorName: string;
  /** Nombre del perro del autor (opcional, para dar contexto). */
  petName?: string;
  text: string;
  /** Foto del perro adjunta (uri local o URL pública). */
  imageUri?: string;
  /** ISO 8601. */
  createdAt: string;
  likes: number;
  /** Si el usuario actual le ha dado like (estado local). */
  likedByMe?: boolean;
}

export interface NewPost {
  authorName: string;
  petName?: string;
  text: string;
  imageUri?: string;
}
