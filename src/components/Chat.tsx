import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    sender_name: string;
}

interface ChatProps {
    receiverId: string;
    receiverName: string;
    rentalId?: string;
}

export default function Chat({ receiverId, receiverName, rentalId }: ChatProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
            auth: {
                token: user?.id,
            },
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
        });

        newSocket.on('message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    useEffect(() => {
        if (socket) {
            socket.emit('join', {
                userId: user?.id,
                receiverId,
                rentalId,
            });
        }
    }, [socket, user?.id, receiverId, rentalId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        const message = {
            sender_id: user.id,
            receiver_id: receiverId,
            content: newMessage.trim(),
            rental_id: rentalId,
        };

        socket.emit('message', message);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
            {/* Chat Header */}
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{receiverName}</h2>
                {rentalId && (
                    <p className="text-sm text-gray-500">Mã đơn thuê: {rentalId}</p>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${message.sender_id === user?.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100'
                                }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                                {format(new Date(message.created_at), 'HH:mm', { locale: vi })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    );
} 