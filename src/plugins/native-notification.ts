import { registerPlugin } from '@capacitor/core';

export interface NativeNotificationPlugin {
  initialize(): Promise<{ token: string; success: boolean }>;
  showBundledNotification(options: { sender: string; message: string }): Promise<{ success: boolean }>;
  showCallNotification(options: { caller: string; conversationId: number }): Promise<{ success: boolean }>;
}

const NativeNotification = registerPlugin<NativeNotificationPlugin>('NativeNotification');

export default NativeNotification;
