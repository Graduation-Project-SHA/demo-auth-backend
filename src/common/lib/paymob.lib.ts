/**
 * Paymob Payment Link Integration V1.0
 * Avnology © 2024
 *
 * This file contains functions to interact with Paymob's API to create payment links and verify callback HMACs.
 *
 * Functions:
 * - `CreatePaymobPaymentLink`: Creates a payment link using the provided payment details.
 * - `VerifyCallbackHmac`: Verifies the authenticity of the callback by checking the HMAC.
 *
 * Environment Variables:
 * This integration requires the following environment variables to be set in your `.env` file:
 *
 * 1. `PAYMOB_AUTH_URL`: The URL used to authenticate with Paymob's API (e.g., 'https://accept.paymob.com/api/auth/tokens').
 * 2. `PAYMOB_USERNAME`: Your Paymob username (e.g., 'your_username').
 * 3. `PAYMOB_PASSWORD`: Your Paymob password (e.g., 'your_password').
 * 4. `PAYMOB_QUICK_LINK_URL`: The URL to create a quick payment link (e.g., 'https://accept.paymob.com/api/acceptance/iframes/{integration_id}').
 * 5. `PAYMOB_STATUS`: Set to either 'LIVE' or 'TEST' to specify the environment you're working with.
 * 6. `PAYMOB_INTEGRATION_ID`: The integration ID for your Paymob account (e.g., '12345').
 * 7. `PAYMOB_CURRENCY`: The currency code (e.g., 'EGP').
 * 8. `PAYMOB_HMAC`: Your Paymob HMAC secret key used for callback verification (e.g., 'your_hmac_secret_key').
 *
 * Example `.env` file:
 *
 * ```env
 * PAYMOB_AUTH_URL=https://accept.paymob.com/api/auth/tokens
 * PAYMOB_USERNAME=your_username
 * PAYMOB_PASSWORD=your_password
 * PAYMOB_QUICK_LINK_URL=https://accept.paymob.com/api/ecommerce/payment-links
 * PAYMOB_STATUS=LIVE|TEST
 * PAYMOB_INTEGRATION_ID=12345
 * PAYMOB_CURRENCY=SAR
 * PAYMOB_HMAC=your_hmac_secret_key
 * ```
 *
 * Example Usage:
 *
 * 1. **Create Payment Link**:
 *
 * To create a payment link, call the `CreatePaymobPaymentLink` function with the payment details:
 *
 * ```typescript
 * const paymentDetails = {
 *     amount_cents: 1000,
 *     expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000),  // 1 hour from now
 *     full_name: 'John Doe',
 *     email: 'john.doe@example.com',
 *     save_selection: true,
 * };
 *
 * const response = await CreatePaymobPaymentLink(paymentDetails);
 * if (response.success) {
 *     console.log('Payment link created:', response.data.shorten_url);
 * } else {
 *     console.log('Error:', response.message);
 * }
 * ```
 *
 * 2. **Verify Callback HMAC**:
 *
 * To verify a Paymob callback, use the `VerifyCallbackHmac` function, passing the callback data:
 *
 * ```typescript
 * const callbackData = {
 *     order: '12345',
 *     amount_cents: '1000',
 *     currency: 'EGP',
 *     hmac: 'd2c44e5f...',  // This is the HMAC sent by Paymob in the callback
 * };
 *
 * const isValid = VerifyCallbackHmac(callbackData);
 * if (isValid) {
 *     console.log('Callback is valid.');
 * } else {
 *     console.log('Invalid callback.');
 * }
 * ```
 *
 * Notes:
 * - Make sure that your environment variables are correctly set.
 * - If the callback data is invalid, the HMAC verification will return `false`.
 *
 */

import crypto from 'node:crypto';

export type PaymentSchema = {
  payment_link_image?: string;
  amount_cents: number;
  expires_at: Date;
  reference_id?: string;
  save_selection: boolean;
  full_name: string;
  email: string;
  phone?: string;
};

export type CreatePaymobPaymentLinkResponse =
  | {
      success: true;
      data: {
        currency: string | null;
        client_info: object | null;
        reference_id: string | null;
        shorten_url: string;
        amount_cents: number;
        payment_link_image: string | null;
        description: string | null;
        created_at: Date;
        expires_at: Date;
        client_url: string;
        origin: number;
        merchant_staff_tag: string | null;
        state: string;
        paid_at: Date | null;
        redirection_url: string | null;
        notification_url: string | null;
        order: number;
      };
      metadata?: any;
    }
  | {
      success: false;
      message: 'UNAUTHORIZED' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR';
      info?: string;
    };

export async function createPaymobPaymentLink(
  input: PaymentSchema,
): Promise<CreatePaymobPaymentLinkResponse> {
  try {
    // Validate environment variables
    const requiredEnvVars = [
      'PAYMOB_AUTH_URL',
      'PAYMOB_USERNAME',
      'PAYMOB_PASSWORD',
      'PAYMOB_QUICK_LINK_URL',
      'PAYMOB_STATUS',
      'PAYMOB_INTEGRATION_ID',
      'PAYMOB_CURRENCY',
      'PAYMOB_HMAC',
    ];
    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingVars.length > 0) {
      return {
        success: false,
        message: 'INTERNAL_SERVER_ERROR',
        info: `Missing environment variables: ${missingVars.join(', ')}`,
      };
    }

    const paymobAuth = await fetch(`${process.env.PAYMOB_AUTH_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `${process.env.PAYMOB_USERNAME}`,
        password: `${process.env.PAYMOB_PASSWORD}`,
      }),
    });
    if (!paymobAuth.ok) {
      return {
        success: false,
        message: 'UNAUTHORIZED',
        info: 'Invalid credentials',
      };
    }
    const paymobAuthJson = await paymobAuth.json();
    const paymobAuthAccessToken = paymobAuthJson.token;
    if (!paymobAuthAccessToken) {
      return {
        success: false,
        message: 'UNAUTHORIZED',
        info: 'Invalid credentials',
      };
    }
    const paymentLink = await fetch(`${process.env.PAYMOB_QUICK_LINK_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${paymobAuthAccessToken}`,
      },
      body: JSON.stringify({
        ...input,
        is_live: process.env.PAYMOB_STATUS === 'LIVE',
        payment_methods: [Number(process.env.PAYMOB_INTEGRATION_ID)],
      }),
    });
    if (!paymentLink.ok) {
      return {
        success: false,
        message: 'BAD_REQUEST',
        info: await paymentLink.text(),
      };
    }
    const res = await paymentLink.json();
    return { success: true, data: res };
  } catch (error: any) {
    return {
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      info: error.message,
    };
  }
}

const getValueByKey = (obj: Record<string, any>, key: string): any => {
  return key.split('.').reduce((acc: any, part: string) => {
    return acc && acc[part] !== undefined ? acc[part] : null;
  }, obj);
};

export function verifyCallbackHmac(
  callbackData: Record<string, any>,
  HMACstring: string,
): boolean {
  const hmacKeys = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured', // Note: This key is misspelled in the official Paymob documentation
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order.id',
    'owner',
    'pending',
    'source_data.pan',
    'source_data.sub_type',
    'source_data.type',
    'success',
  ];

  // Validate the environment variable
  if (!process.env.PAYMOB_HMAC) {
    return false;
  }

  const concatenatedValues = hmacKeys
    .map((key) => {
      const value = getValueByKey(callbackData, key);
      return value !== null ? value : '';
    })
    .join('');

  const generatedHmac = crypto
    .createHmac('sha512', process.env.PAYMOB_HMAC as string)
    .update(concatenatedValues)
    .digest('hex');

  return generatedHmac === HMACstring;
}
