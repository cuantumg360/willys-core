import { CommunityPost, NewPost } from './types';

/**
 * Comunidad simulada para desarrollo (Expo Go sin backend). Mantiene los
 * posts en memoria durante la sesión, sembrados con ejemplos para que el
 * muro no se vea vacío.
 */
let posts: CommunityPost[] = [
  {
    id: 'seed-1',
    authorName: 'Lucía',
    petName: 'Nala',
    text: '¡Nala ha bajado de un BCS 7 a un 6 en dos meses! Raciones medidas y paseo doble. Se puede 💪🐕',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 23,
  },
  {
    id: 'seed-2',
    authorName: 'Diego',
    petName: 'Thor',
    text: '¿Algún truco para que coma más despacio? El escáner me dijo que está en su peso ideal y quiero mantenerlo.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    likes: 9,
  },
  {
    id: 'seed-3',
    authorName: 'Marta',
    petName: 'Coco',
    text: 'El informe en PDF me salvó en la visita al veterinario. Le encantó ver la evolución del peso 📄',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    likes: 41,
  },
];

export async function list(): Promise<CommunityPost[]> {
  return [...posts];
}

export async function create(input: NewPost): Promise<CommunityPost> {
  const post: CommunityPost = {
    id: `local-${Date.now()}`,
    authorName: input.authorName,
    petName: input.petName,
    text: input.text,
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  posts = [post, ...posts];
  return post;
}

export async function like(id: string, delta: number): Promise<void> {
  posts = posts.map((p) => (p.id === id ? { ...p, likes: Math.max(0, p.likes + delta) } : p));
}
