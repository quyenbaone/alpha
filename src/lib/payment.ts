import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with a fallback empty string to prevent undefined errors
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentIntent {
    clientSecret: string;
}

export async function createStripePaymentIntent(amount: number) {
    try {
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
            body: { amount },
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

export async function createVNPayPaymentUrl(
    amount: number,
    orderInfo: string,
    returnUrl: string
) {
    try {
        const { data, error } = await supabase.functions.invoke('create-vnpay-payment', {
            body: { amount, orderInfo, returnUrl },
        });

        if (error) throw error;
        return data.paymentUrl;
    } catch (error) {
        console.error('Error creating VNPay payment URL:', error);
        throw error;
    }
}

export async function verifyVNPayPayment(vnpParams: Record<string, string>) {
    try {
        const { data, error } = await supabase.functions.invoke('verify-vnpay-payment', {
            body: { vnpParams },
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error verifying VNPay payment:', error);
        throw error;
    }
}

export { stripePromise };
