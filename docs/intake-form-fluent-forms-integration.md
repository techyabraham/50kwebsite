# Onboarding Form Fluent Forms Integration

The new detailed website brief lives at:

```text
/onboarding
```

Customers who pay successfully through Paystack are redirected there automatically. You can also open the page directly without payment and share the link manually.

## Environment Variable

Add this to `.env.local`:

```env
VITE_INTAKE_FORM_URL=https://elements.abraham.com.ng/wp-json/abraham/v1/intake
```

Add the same variable in Vercel:

```text
Project Settings -> Environment Variables -> VITE_INTAKE_FORM_URL
```

## WordPress Bridge

Upload or update this plugin file on the WordPress site:

```text
wordpress/abraham-form-bridge.php
```

The bridge exposes this REST endpoint:

```text
https://elements.abraham.com.ng/wp-json/abraham/v1/intake
```

By default, the intake endpoint submits into Fluent Form ID `12`.

If your Fluent Forms onboarding form has a different ID, change this line in `wordpress/abraham-form-bridge.php`:

```php
$form_id = 12;
```

## Fluent Forms Field Names

Create a new Fluent Form for the website brief and use these field names:

```text
name
business_name
whatsapp
email
what_you_do
audience
goal
services
pages
tone
colors
inspiration
file_names
logo_uploads
website_uploads
receipt_uploads
instagram
facebook
tiktok
twitter
extras
payment_method
payment_reference
paid_at
source
```

Recommended field types:

```text
name: Text input
business_name: Text input
whatsapp: Phone input or text input
email: Email input
what_you_do: Paragraph text
audience: Paragraph text
goal: Text input
services: Paragraph text
pages: Paragraph text
tone: Text input, optional
colors: Text input
inspiration: URL input or text input
file_names: Paragraph text
logo_uploads: Paragraph text
website_uploads: Paragraph text
receipt_uploads: Paragraph text
instagram: Text input
facebook: Text input
tiktok: Text input
twitter: Text input
extras: Paragraph text
payment_method: Text input
payment_reference: Text input
paid_at: Text input
source: Text input
```

## File Uploads

The React onboarding page submits uploads as multipart form data:

```text
logo_uploads[]
website_uploads[]
receipt_uploads[]
```

The WordPress bridge saves those files into the WordPress Media Library, then stores the uploaded media URLs in these Fluent Forms fields:

```text
logo_uploads
website_uploads
receipt_uploads
```

For customers redirected from successful Paystack payment, `receipt_uploads` is hidden because the Paystack reference is already included in `payment_reference`.

Make sure the Fluent Forms `tone` field is not marked as required. The React form lets customers either choose a tone, type a custom tone, or leave it blank for Abraham to decide.

## Test Checklist

1. Visit `/onboarding` directly.
2. Fill the form and submit.
3. Confirm the submission appears under Fluent Forms form ID `12`.
4. Complete a Paystack test payment from `/payment`.
5. Confirm Paystack redirects to `/onboarding` with payment reference shown at the top.
