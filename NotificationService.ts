
import { AppNotification } from './types';

export const NotificationService = {
  async requestPermission() {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  },

  send(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  },

  createInApp(userEmail: string, orderId: string, status: string): AppNotification {
    const messages: Record<string, string> = {
      completed: `Success! Your order ${orderId} has been completed. Check your game account!`,
      cancelled: `Your order ${orderId} was cancelled. Contact support for details.`,
      pending: `Order ${orderId} is now under review.`
    };

    return {
      id: `NOTIF-${Date.now()}`,
      userEmail,
      orderId,
      message: messages[status] || `Order ${orderId} status updated to ${status}`,
      timestamp: Date.now(),
      read: false
    };
  }
};
