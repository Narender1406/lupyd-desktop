import { openDB, type IDBPDatabase } from "idb";

export interface Message {
  content: Uint8Array;
  timestamp: number;
  from: string;
  to: string;
  conversationId: number;
}

const dbName = "messages-db";

const storeName = "user-messages";

export class UserMessageStore {
  private db: IDBPDatabase | null = null;
  private version = 1;

  private async getDB(): Promise<IDBPDatabase> {
    if (!this.db || this.db.version === 0) {
      this.db = await openDB(dbName, this.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: ["conversationId", "timestamp"],
            });
            store.createIndex("toAndFrom", ["from", "to", "timestamp"]);
            store.createIndex("fromTo", ["from", "to"], { unique: false });
          }
        },
      });
    }
    return this.db;
  }

  async storeMessage(message: Message): Promise<void> {
    const db = await this.getDB();
    await db.add(storeName, message);
  }

  async getLastMessages(
    from: string,
    to: string,
    count: number = 10,
    beforeFrom?: number,
  ): Promise<Message[]> {
    const db = await this.getDB();
    const tx = db.transaction(storeName, "readonly");
    const index = tx.store.index("toAndFrom");

    const upperBound = beforeFrom
      ? [from, to, beforeFrom]
      : [from, to, Number.MAX_SAFE_INTEGER];
    const range = IDBKeyRange.bound(
      [from, to, 0],
      upperBound,
      false,
      beforeFrom ? true : false,
    );

    const cursor = await index.openCursor(range, "prev");

    const messages: Message[] = [];
    while (cursor) {
      const key = cursor.key;
      if (
        !(
          Array.isArray(key) &&
          key.length >= 3 &&
          typeof key[0] === "string" &&
          typeof key[1] === "string" &&
          typeof key[2] === "number"
        )
      ) {
        continue;
      }

      messages.push(cursor.value);

      if (messages.length >= count) {
        break;
      }

      if (!(await cursor.continue())) {
        break;
      }
    }

    return messages;
  }

  async getLastMessage(from: string, to: string): Promise<Message | null> {
    const messages = await this.getLastMessages(from, to, 1);
    return messages[0] || null;
  }

  async getLastMessagesFromAllConversations(): Promise<Message[]> {
    const db = await this.getDB();
    const tx = db.transaction(storeName, "readonly");
    const index = tx.store.index("fromTo");

    const keyPairs: [string, string][] = [];

    const cursor = await index.openKeyCursor(null, "nextunique");
    while (cursor) {
      const key = cursor.key;
      if (
        !(
          Array.isArray(key) &&
          key.length >= 2 &&
          key.every((e) => typeof e === "string")
        )
      ) {
        continue;
      }

      keyPairs.push([key[0], key[1]]);

      if (!(await cursor.continue())) {
        break;
      }
    }

    const lastMessages = await Promise.all(
      keyPairs.map(([from, to]) => this.getLastMessage(from, to)),
    );

    return lastMessages.filter((e) => e != null);
  }

  close() {
    this.db?.close();
    this.db = null;
  }
}
