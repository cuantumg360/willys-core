export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

export interface ChatPet {
  nombre?: string;
  raza?: string;
  edadAnios?: number;
  pesoKg?: number;
}

export interface ChatRequest {
  messages: { role: ChatRole; text: string }[];
  pet?: ChatPet;
}
