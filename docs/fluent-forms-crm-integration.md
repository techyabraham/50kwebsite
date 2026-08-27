# Fluent Forms / FluentCRM Integration

This React page now sends the reservation form to a WordPress REST bridge, which then submits into Fluent Forms Form ID `10` and lets FluentCRM handle lists, tags, emails, and follow-ups.

## 1. React Environment Variables

Add these locally in `.env.local`, and also add them in Vercel under Project Settings -> Environment Variables:

```env
VITE_FLUENT_FORM_ID=10
VITE_FLUENT_FORM_NONCE=not_needed
VITE_FLUENT_FORMS_URL=https://elements.abraham.com.ng/wp-json/abraham/v1/submit
```

The React code posts JSON to `VITE_FLUENT_FORMS_URL`. It no longer depends on a browser-side Fluent Forms nonce.

## 2. Install the WordPress Bridge

Use this file from the project:

`wordpress/abraham-form-bridge.php`

On WordPress, create this folder:

`wp-content/plugins/abraham-form-bridge/`

Upload `abraham-form-bridge.php` into that folder, then activate **Abraham Form Bridge** in WordPress Plugins.

The endpoint is:

`https://elements.abraham.com.ng/wp-json/abraham/v1/submit`

Opening the endpoint directly may show a missing-data error. That is expected; it means the endpoint exists.

## 3. Create the Fluent Form

In WordPress, install and activate Fluent Forms. Create a form with these fields:

| React field | Fluent Forms field name |
| --- | --- |
| First Name | `names[first_name]` |
| Last Name | `names[last_name]` |
| Email Address | `email` |
| WhatsApp Number | `phone` |
| Business Name | `business_name` |
| Business Description | `business_description` |
| City / State | `city` |
| Has Website | `has_website` |

The bridge maps the React JSON fields into these Fluent Forms field names. If your actual Form 10 field names differ, edit the `$form_data` array in `wordpress/abraham-form-bridge.php`.

## 4. Connect FluentCRM

Install FluentCRM on the same WordPress site, then open:

`Fluent Forms -> Forms -> your form -> Integrations`

Add a FluentCRM integration feed and map:

| FluentCRM field | Form field |
| --- | --- |
| First Name | First Name |
| Last Name | Last Name |
| Email | Email Address |
| Phone | WhatsApp Number |
| Tags | `50k Website Offer`, `Landing Page Lead` |
| List | `Website Leads` |

You can also add a custom field for Business Name, Business Description, City, and Has Website.

## 5. Recommended Automation

In FluentCRM, create an automation that starts when a contact is added to the `Website Leads` list or receives the `50k Website Offer` tag.

Recommended steps:

1. Send internal notification to Abraham.
2. Send lead a confirmation email.
3. Add a follow-up reminder if payment is not confirmed.
4. Move paid leads to a `Paid Website Clients` list.

## 6. Important CORS Note

If the React app and WordPress are on different domains, the browser may block direct form submission unless WordPress allows CORS for your landing page domain.

Best production options:

1. Host the React page on the same domain/subdomain as WordPress.
2. Add a small serverless API endpoint that receives the React form and submits it to WordPress from the server.
3. Enable CORS on WordPress only for your landing page domain.

The bridge currently allows:

```txt
https://50kwebsite.vercel.app
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://localhost:3000
```

## 7. Test Checklist

1. Fill the landing-page form.
2. Submit it.
3. Confirm the page redirects to `/payment`.
4. Confirm a new entry appears in Fluent Forms.
5. Confirm a contact appears in FluentCRM.
6. Confirm tags/lists/fields are mapped correctly.
