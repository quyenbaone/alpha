import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';
import type { Equipment, Message, Notification, Rental } from './types';

export function useEquipment(id?: string) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEquipment = async () => {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        setError('Failed to load equipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  return { equipment, loading, error };
}

export function useRentals() {
  const { user } = useAuthStore();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchRentals = async () => {
      try {
        const { data, error } = await supabase
          .from('rentals')
          .select(`
            *,
            equipment:equipment_id (
              title,
              price,
              image
            ),
            renter:renter_id (
              email
            )
          `)
          .eq('renter_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRentals(data || []);
      } catch (error) {
        console.error('Error fetching rentals:', error);
        setError('Failed to load rentals');
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [user]);

  return { rentals, loading, error };
}

export function useMessages(partnerId?: string) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !partnerId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id (email)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, payload => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, partnerId]);

  return { messages, loading, error };
}

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { notifications, loading, error };
}