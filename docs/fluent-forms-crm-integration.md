# Fluent Forms / FluentCRM Integration

This React page can send the reservation form to a Fluent Forms form on WordPress, then redirect the visitor to `/payment`.

## 1. Create the Fluent Form

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

The names must match what the React app sends from `src/AppV2.jsx`.

## 2. Get the Form ID and Endpoint

Open the form in WordPress and note the Fluent Forms ID.

The current app reads these Vite environment variables:

```env
VITE_FLUENT_FORMS_URL=https://yourdomain.com/?fluentform_pages&form_id=123
VITE_FLUENT_FORM_ID=123
VITE_FLUENT_FORM_NONCE=replace_with_real_nonce_if_required
```

Create a `.env.local` file in the project root and add those values. Restart the dev server after changing environment variables.

## 3. Connect FluentCRM

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

## 4. Recommended Automation

In FluentCRM, create an automation that starts when a contact is added to the `Website Leads` list or receives the `50k Website Offer` tag.

Recommended steps:

1. Send internal notification to Abraham.
2. Send lead a confirmation email.
3. Add a follow-up reminder if payment is not confirmed.
4. Move paid leads to a `Paid Website Clients` list.

## 5. Important CORS Note

If the React app and WordPress are on different domains, the browser may block direct form submission unless WordPress allows CORS for your landing page domain.

Best production options:

1. Host the React page on the same domain/subdomain as WordPress.
2. Add a small serverless API endpoint that receives the React form and submits it to WordPress from the server.
3. Enable CORS on WordPress only for your landing page domain.

## 6. Test Checklist

1. Fill the landing-page form.
2. Submit it.
3. Confirm the page redirects to `/payment`.
4. Confirm a new entry appears in Fluent Forms.
5. Confirm a contact appears in FluentCRM.
6. Confirm tags/lists/fields are mapped correctly.

