import { useNotifications } from '@/context/NotificationContext';
import { AdminNotification } from '@/types';

export function useNotificationPanelLogic() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const handleMarkRead = async (notif: AdminNotification) => {
    if (!notif.isRead) await markRead(notif.id);
  };

  return { notifications, unreadCount, markRead, markAllRead, handleMarkRead };
}
