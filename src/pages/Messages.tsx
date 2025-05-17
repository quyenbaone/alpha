import { Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase, useRealtimeChannel } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender?: {
    email: string;
  };
}

interface ChatPartner {
  id: string;
  email: string;
  lastMessage?: string;
  lastMessageDate?: string;
}

export function Messages() {
  const { user } = useAuthStore();
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  // Use our tab-aware realtime subscription
  const isActiveTab = useRealtimeChannel('messages-tab');

  useEffect(() => {
    if (user) {
      fetchChatPartners();

      // Only subscribe to real-time updates in the active tab
      if (isActiveTab) {
        return subscribeToMessages();
      }
    }
  }, [user, isActiveTab]);

  // Fetch messages whenever the selected partner changes
  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner.id);
    }
  }, [selectedPartner]);

  const fetchChatPartners = async () => {
    try {
      setLoading(true);
      // Get all messages where the user is either sender or receiver
      const { data, error } = await supabase
        .from('messages')
        .select(`
          sender_id,
          receiver_id,
          content,
          created_at,
          sender:sender_id(email),
          receiver:receiver_id(email)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process raw data to get chat partners
      const partnersMap: Record<string, ChatPartner> = {};
      data?.forEach(message => {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const partnerEmail = message.sender_id === user.id ? message.receiver.email : message.sender.email;

        if (!partnersMap[partnerId]) {
          partnersMap[partnerId] = {
            id: partnerId,
            email: partnerEmail,
            lastMessage: message.content,
            lastMessageDate: message.created_at
          };
        }
      });

      const partners = Object.values(partnersMap);
      setChatPartners(partners);

      // Select first partner by default if none selected
      if (partners.length > 0 && !selectedPartner) {
        setSelectedPartner(partners[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat partners:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(email)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    // Only subscribe if this is the active tab
    if (!isActiveTab) return () => { };

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
        fetchChatPartners(); // Refresh chat partners list to update last messages
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner) return;

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedPartner.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
      // Fetch updated messages - the subscription will handle real-time updates
      // but we'll fetch anyway to ensure we get our own messages too
      fetchMessages(selectedPartner.id);
      fetchChatPartners(); // Update last message
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Contacts sidebar */}
        <div className="bg-white shadow rounded-lg overflow-hidden md:col-span-1">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-medium">Contacts</h2>
          </div>
          <div className="overflow-y-auto h-[calc(600px-64px)]">
            {chatPartners.length === 0 ? (
              <p className="p-4 text-gray-500">No conversations yet</p>
            ) : (
              chatPartners.map(partner => (
                <div
                  key={partner.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedPartner?.id === partner.id ? 'bg-blue-50' : ''
                    }`}
                  onClick={() => setSelectedPartner(partner)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{partner.email}</h3>
                    {partner.lastMessageDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(partner.lastMessageDate).toLocaleString(undefined, {
                          hour: 'numeric',
                          minute: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                  {partner.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {partner.lastMessage}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="bg-white shadow rounded-lg overflow-hidden md:col-span-2 flex flex-col">
          {selectedPartner ? (
            <>
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-medium">{selectedPartner.email}</h2>
              </div>

              <div className="p-4 overflow-y-auto flex-grow">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500">No messages yet</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${message.sender_id === user.id
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <form onSubmit={sendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}