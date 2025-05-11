import { createHash } from 'https://deno.land/std@0.168.0/hash/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const HASH_SECRET = Deno.env.get('VNPAY_HASH_SECRET') || '';

serve(async (req) => {
    try {
        const { vnpParams } = await req.json();

        // Remove vnp_SecureHash from params
        const { vnp_SecureHash, ...otherParams } = vnpParams;

        // Sort params by key
        const sortedParams = Object.keys(otherParams)
            .sort()
            .reduce((acc, key) => {
                acc[key] = otherParams[key];
                return acc;
            }, {});

        // Create signature
        const signData = Object.entries(sortedParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        const hmac = createHash('sha512');
        hmac.update(HASH_SECRET);
        const signature = hmac.update(signData).toString('hex');

        // Verify signature
        const isValid = signature === vnp_SecureHash;

        return new Response(
            JSON.stringify({
                isValid,
                responseCode: vnpParams.vnp_ResponseCode,
                transactionNo: vnpParams.vnp_TransactionNo,
                amount: parseInt(vnpParams.vnp_Amount) / 100, // Convert back to normal amount
                orderInfo: vnpParams.vnp_OrderInfo,
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