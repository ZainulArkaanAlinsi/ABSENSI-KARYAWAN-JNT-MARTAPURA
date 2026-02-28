import { useNotifications } from '@/context/NotificationContext';
import { AdminNotification } from '@/types';

export function useNotificationPanelLogic() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleMarkRead = async (notif: AdminNotification) => {
    if (!notif.isRead) await markAsRead(notif.id);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, handleMarkRead };
}
