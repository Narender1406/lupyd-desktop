import { fromBase64 } from "@/lib/utils";

import { registerPlugin } from '@capacitor/core'

export interface BMessage {
  id: number,
  convoId: number,
  from: string,
  to: string,
  textB64: string,
}


export type DMessage = Omit<BMessage, "textB64"> & { text: Uint8Array }

export function bMessageToDMessage(msg: BMessage): DMessage {
  return {
    ...msg,
    text: fromBase64(msg.textB64)
  }
}


export interface EncryptionPluginType {
  onUserMessage(options: {
    convoId: number,
    textB64: string,
    from: string,
    to: string,
    type: number,
    id: number,
  }): Promise<BMessage>,
  encryptAndSend(options: {
    convoId: number,
    textB64: string,
    to: string,
    token: string
  }): Promise<BMessage>,


  getLastMessages(options: {
    from: string,
    to: string,
    limit: number,
    before: number
  }): Promise<{ result: BMessage[] }>

  getLastMessagesFromAllConversations(): Promise<{ result: BMessage[] }>
  getLastMessagesInBetween(
    options: {
      from: string,
      to: string,
      limit: number,
      before: number
    }
  ): Promise<{ result: BMessage[] }>

  checkSetup(): Promise<void>,

  saveTokens(options: {
    accessToken: string,
    refreshToken: string,
  }): Promise<void>
}

export const EncryptionPlugin = registerPlugin<EncryptionPluginType>("EncryptionPlugin")

