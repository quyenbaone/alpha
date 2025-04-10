import { supabase } from './supabase';
import type { Equipment, Rental, Message, Notification } from './types';

export const api = {
  equipment: {
    list: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    create: async (equipment: Partial<Equipment>) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, equipment: Partial<Equipment>) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(equipment)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },

  rentals: {
    list: async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    create: async (rental: Partial<Rental>) => {
      const { data, error } = await supabase
        .from('rentals')
        .insert(rental)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    updateStatus: async (id: string, status: string) => {
      const { data, error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  messages: {
    list: async (partnerId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (email)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },

    send: async (receiverId: string, content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  notifications: {
    list: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },
};