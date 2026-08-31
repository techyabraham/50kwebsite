# Site Management Guide

## Add Testimonial Images

1. Put the image in:

```text
public/images/
```

Use a simple file name, for example:

```text
public/images/winner-ezekiel.jpg
```

2. Open:

```text
src/AppV2.jsx
```

3. Find the `testimonials` array and add an `image` field:

```js
{
  quote: "The testimonial text...",
  name: "Winner Ezekiel",
  business: "Millenial CEOs",
  city: "Lagos",
  image: "/images/winner-ezekiel.jpg",
}
```

If a testimonial has no `image`, the page will keep showing the placeholder.

## Change The Offer End Date

Open:

```text
src/constants.js
```

Change:

```js
export const OFFER_END_DATE = new Date("2026-09-07T23:59:59");
```

Example:

```js
export const OFFER_END_DATE = new Date("2026-09-10T23:59:59");
```

The countdown and date copy are generated from that value.

## Reset Slots Manually

The React app now reads the shared slot count from WordPress:

```text
https://elements.abraham.com.ng/wp-json/abraham/v1/slots
```

Each successful reservation calls:

```text
https://elements.abraham.com.ng/wp-json/abraham/v1/slots/decrement
```

To reset the slot count securely, add this to `wp-config.php` on the WordPress site:

```php
define('ABRAHAM_SLOT_ADMIN_KEY', 'change-this-to-a-long-private-key');
```

Then reset with PowerShell:

```powershell
Invoke-WebRequest -UseBasicParsing -Method Post `
  -Uri "https://elements.abraham.com.ng/wp-json/abraham/v1/slots/reset" `
  -Headers @{ "X-Abraham-Admin-Key" = "change-this-to-a-long-private-key" } `
  -ContentType "application/json" `
  -Body '{"slots_remaining":20}'
```

To reduce manually to any number, change the body:

```json
{"slots_remaining":12}
```

## Local Browser Fallback

If WordPress is unavailable, the page falls back to browser storage. To reset only your local browser preview:

```js
localStorage.setItem('abraham_slots_remaining', '20');
location.reload();
```

That local reset affects only your own browser, not every visitor.
