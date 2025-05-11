import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { createStripePaymentIntent, createVNPayPaymentUrl, stripePromise } from '../lib/payment';

interface PaymentFormProps {
    amount: number;
    orderInfo: string;
    onSuccess: () => void;
    onCancel: () => void;
}

function StripePaymentForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {
            const { clientSecret } = await createStripePaymentIntent(amount);
            const { error: paymentError } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement)!,
                    },
                }
            );

            if (paymentError) {
                toast.error(paymentError.message);
            } else {
                toast.success('Thanh toán thành công!');
                onSuccess();
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border rounded-lg">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={loading}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    disabled={!stripe || loading}
                >
                    {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
            </div>
        </form>
    );
}

export default function PaymentForm({ amount, orderInfo, onSuccess, onCancel }: PaymentFormProps) {
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'vnpay'>('stripe');

    const handleVNPayPayment = async () => {
        try {
            const returnUrl = `${window.location.origin}/payment/success`;
            const paymentUrl = await createVNPayPaymentUrl(
                amount,
                orderInfo,
                returnUrl
            );
            window.location.href = paymentUrl;
        } catch (error) {
            console.error('VNPay payment error:', error);
            toast.error('Đã xảy ra lỗi khi tạo URL thanh toán VNPay. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex-1 px-4 py-2 rounded-lg ${paymentMethod === 'stripe'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Thẻ tín dụng (Stripe)
                </button>
                <button
                    type="button"
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`flex-1 px-4 py-2 rounded-lg ${paymentMethod === 'vnpay'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    VNPay
                </button>
            </div>

            {paymentMethod === 'stripe' ? (
                <Elements stripe={stripePromise}>
                    <StripePaymentForm
                        amount={amount}
                        orderInfo={orderInfo}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                    />
                </Elements>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất giao dịch.
                    </p>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleVNPayPayment}
                            className="flex-1 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                        >
                            Tiếp tục với VNPay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 