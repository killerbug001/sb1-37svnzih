import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.read).length
      });
    }
  },
  markAsRead: async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    const { notifications } = get();
    set({
      notifications: notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: get().unreadCount - 1
    });
  }
}));