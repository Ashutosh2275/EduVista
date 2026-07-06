import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { AdminNotification } from '../types/admin';

const POLL_INTERVAL_MS = 60_000;

export function useAdminNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await adminService.getNotifications();
      setUnreadCount(data.unreadCount);
      setItems(data.items);
    } catch {
      setUnreadCount(0);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { unreadCount, items, isLoading, refresh };
}
