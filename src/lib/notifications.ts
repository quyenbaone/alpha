import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from './supabase';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            // Save the token to Supabase
            const { error } = await supabase
                .from('user_notifications')
                .upsert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    fcm_token: token,
                });

            if (error) throw error;
            return token;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        throw error;
    }
}

export function onNotificationMessage(callback: (payload: any) => void) {
    return onMessage(messaging, (payload) => {
        callback(payload);
    });
}

export async function sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
) {
    try {
        const { error } = await supabase.functions.invoke('send-notification', {
            body: {
                userId,
                title,
                body,
                data,
            },
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

export async function removeNotificationToken() {
    try {
        const { error } = await supabase
            .from('user_notifications')
            .delete()
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;
    } catch (error) {
        console.error('Error removing notification token:', error);
        throw error;
    }
} 