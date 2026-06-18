import { create } from 'zustand';

import { chat, ChatMessage, ChatPet } from '@/services/chat';
import { newId } from '@/utils/id';

interface ChatState {
  messages: ChatMessage[];
  sending: boolean;
  send: (text: string, pet?: ChatPet) => Promise<void>;
  seed: (greeting: string) => void;
  reset: () => void;
}

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  sending: false,

  seed: (greeting) => {
    if (get().messages.length === 0) {
      set({ messages: [{ id: newId(), role: 'assistant', text: greeting }] });
    }
  },

  send: async (text, pet) => {
    const clean = text.trim();
    if (!clean || get().sending) return;
    const userMsg: ChatMessage = { id: newId(), role: 'user', text: clean };
    set((s) => ({ messages: [...s.messages, userMsg], sending: true }));
    try {
      const history = get().messages.map((m) => ({ role: m.role, text: m.text }));
      const reply = await chat.send({ messages: history, pet });
      set((s) => ({ messages: [...s.messages, { id: newId(), role: 'assistant', text: reply }], sending: false }));
    } catch {
      set((s) => ({
        messages: [
          ...s.messages,
          { id: newId(), role: 'assistant', text: 'No he podido responder ahora. Inténtalo otra vez.' },
        ],
        sending: false,
      }));
    }
  },

  reset: () => set({ messages: [] }),
}));
