import { createHash } from 'https://deno.land/std@0.168.0/hash/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const TMN_CODE = Deno.env.get('VNPAY_TMN_CODE') || '';
const HASH_SECRET = Deno.env.get('VNPAY_HASH_SECRET') || '';
const VNPAY_URL = Deno.env.get('VNPAY_URL') || '';

serve(async (req) => {
    try {
        const { amount, orderInfo, returnUrl } = await req.json();

        const date = new Date();
        const createDate = date.toISOString().split('T')[0].split('-').join('');
        const orderId = `ORDER_${Date.now()}`;

        const vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: TMN_CODE,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100, // Convert to smallest currency unit
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: '127.0.0.1',
            vnp_CreateDate: createDate,
        };

        // Sort params by key
        const sortedParams = Object.keys(vnpParams)
            .sort()
            .reduce((acc, key) => {
                acc[key] = vnpParams[key];
                return acc;
            }, {});

        // Create signature
        const signData = Object.entries(sortedParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        const hmac = createHash('sha512');
        hmac.update(HASH_SECRET);
        const signature = hmac.update(signData).toString('hex');

        // Create payment URL
        const paymentUrl = `${VNPAY_URL}?${signData}&vnp_SecureHash=${signature}`;

        return new Response(
            JSON.stringify({
                paymentUrl,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: error.message,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
}); 