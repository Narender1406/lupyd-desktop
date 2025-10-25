import { LocalNotifications } from '@capacitor/local-notifications';

export const scheduleNotification = async (receiver: string, messageText: string) => {
  await LocalNotifications.schedule({
    notifications: [
      {
        title: `New message from ${receiver}`,
        body: messageText,
        id: 1,
        schedule: { at: new Date(Date.now() + 1000) },
        sound: undefined,
        smallIcon: 'res://ic_popup_reminder',
      },
    ],
  });
};
