import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { MessageWithSender, ChatPartner } from '../lib/types';

interface MessageState {
  messages: MessageWithSender[];
  chatPartners: ChatPartner[];
  loading: boolean;
  error: string | null;
  fetchMessages: (partnerId: string) => Promise<void>;
  fetchChatPartners: () => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  chatPartners: [],
  loading: false,
  error: null,

  fetchMessages: async (partnerId: string) => {
    set({ loading: true, error: null });
    try {
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
      set({ messages: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load messages',
        loading: false 
      });
    }
  },

  fetchChatPartners: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .select(`
          sender:sender_id (id, email),
          receiver:receiver_id (id, email)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniquePartners = new Map<string, ChatPartner>();
      
      data?.forEach((msg: any) => {
        const partner = msg.sender.id === user.id ? msg.receiver : msg.sender;
        if (!uniquePartners.has(partner.id)) {
          uniquePartners.set(partner.id, {
            id: partner.id,
            email: partner.email,
          });
        }
      });

      set({ 
        chatPartners: Array.from(uniquePartners.values()),
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching chat partners:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load chat partners',
        loading: false 
      });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim()
        });

      if (error) throw error;
      await get().fetchMessages(receiverId);
    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message',
        loading: false 
      });
    }
  },
}));