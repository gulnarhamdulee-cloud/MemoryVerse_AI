import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! I am your MemoryVerse Assistant. Ask me anything about your uploaded files, trip logs, or project notes.',
          citations: [],
          confidence: null
        }
      ],
      suggestedFollowUps: [
        'Show my internship documents.',
        'When did I first mention machine learning?',
        'Which documents involve Mumbai?',
        'What project files discuss React?'
      ],
      setMessages: (messages) => set({ messages }),
      setSuggestedFollowUps: (suggestedFollowUps) => set({ suggestedFollowUps }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, updatedFields) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updatedFields } : msg
          )
        })),
      clearConversation: () =>
        set({
          messages: [
            {
              id: 'welcome',
              role: 'assistant',
              content: 'Hello! I am your MemoryVerse Assistant. Ask me anything about your uploaded files, trip logs, or project notes.',
              citations: [],
              confidence: null
            }
          ],
          suggestedFollowUps: [
            'Show my internship documents.',
            'When did I first mention machine learning?',
            'Which documents involve Mumbai?',
            'What project files discuss React?'
          ]
        })
    }),
    {
      name: 'memoryverse-chat-storage'
    }
  )
);
