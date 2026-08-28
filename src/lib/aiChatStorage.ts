// Async chat history persistence using localForage (IndexedDB).
import localforage from "localforage";

const store = localforage.createInstance({
  name: "al-foras",
  storeName: "ai_advisor",
  description: "AI Advisor chat history & preferences",
});

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

const MSG_KEY = "messages:v1";
const FAB_POS_KEY = "fab_position:v1";

export const chatStorage = {
  async loadMessages(): Promise<ChatMessage[]> {
    return (await store.getItem<ChatMessage[]>(MSG_KEY)) ?? [];
  },
  async saveMessages(msgs: ChatMessage[]): Promise<void> {
    await store.setItem(MSG_KEY, msgs.slice(-100));
  },
  async clearMessages(): Promise<void> {
    await store.removeItem(MSG_KEY);
  },
  async clearAll(): Promise<void> {
    try {
      await store.clear();
    } catch (e) {
      console.error("chatStorage.clearAll", e);
    }
  },
  async loadFabPosition(): Promise<{ x: number; y: number } | null> {
    return (await store.getItem<{ x: number; y: number }>(FAB_POS_KEY)) ?? null;
  },
  async saveFabPosition(pos: { x: number; y: number }): Promise<void> {
    await store.setItem(FAB_POS_KEY, pos);
  },
};

export default chatStorage;