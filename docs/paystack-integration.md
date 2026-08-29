# Payment Integration

The payment page now supports two routes:

1. Manual bank transfer
2. Automatic Paystack payment

## Manual Bank Transfer

Manual payment shows Abraham's bank details directly on the payment page:

```text
Bank: UBA
Account number: 2141500650
Account name: Abraham Tobi Akomolafe
Amount: NGN 50,000
```

After the customer transfers, they click `Send Receipt on WhatsApp`. The button opens WhatsApp with a pre-filled message containing their name, business name, amount, bank, and account number. Abraham can then confirm payment and send them the detailed website brief manually.

## Automatic Paystack Flow

Paystack remains available for customers who want the automated route. The payment methods appear in this order:

1. Bank Transfer
2. OPay
3. Card

Bank Transfer opens Paystack checkout with:

```js
channels: ["bank_transfer"]
```

OPay also uses Paystack bank transfer checkout. The customer should open their OPay app and transfer to the generated Paystack account number.

Card opens Paystack checkout with:

```js
channels: ["card"]
```

The amount is `5000000` kobo, which equals `NGN 50,000`.

After successful Paystack payment, the app redirects the customer to:

```text
/onboarding
```

That page can also be opened directly without payment.

## Where To Add Paystack Credentials

Add your Paystack public key to `.env.local`:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
```

Also add the same variable in Vercel:

```text
Project Settings -> Environment Variables -> VITE_PAYSTACK_PUBLIC_KEY
```

Use only the Paystack public key in this React app. Do not place your Paystack secret key in Vite, React, GitHub, or browser code.

## Paystack Dashboard Requirements

In your Paystack dashboard, confirm that these channels are enabled for your business:

1. Bank transfer
2. Card

OPay does not appear as a separate Paystack Inline JS channel in this project. It is handled through Paystack bank transfer because OPay can transfer into the account Paystack generates.
