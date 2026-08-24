# ADR 0003: EmailJS Contact Form

**Status:** ✅ Accepted  
**Date:** 2026-07-18

## Context

The resume portfolio needs a contact form that:

- Sends email without a custom backend server
- Works with static hosting (GitHub Pages)
- Is simple to maintain with zero operational cost
- Protects email address from spam bots
- Provides reasonable delivery guarantees

## Decision

Use [EmailJS](https://www.emailjs.com/) as the email delivery service for the contact form.

**Integration:**

1. `@emailjs/browser` SDK called directly from the React component
2. Service ID, template ID, and public key stored in `VITE_EMAILJS_*` environment variables
3. Form validation and error handling on the client side
4. No backend proxy — EmailJS API called directly from the browser

## Consequences

### Positive

- Zero backend to maintain — no server, no API, no database
- Works with static hosting (GitHub Pages, Netlify, Vercel)
- Free tier covers the expected usage volume
- Easy to set up — template editor is visual
- Email address is never exposed in HTML or API responses

### Negative

- EmailJS service dependency — if EmailJS is down, the form doesn't work
- Rate limited on free tier (200 requests/month)
- Template customization limited to EmailJS dashboard
- Public key is visible in browser — security is by obscurity (rate limits + CAPTCHA)

## Alternatives Considered

| Alternative                           | Reason against                                                    |
| ------------------------------------- | ----------------------------------------------------------------- |
| Custom backend (Node.js + Nodemailer) | Requires server, deployment, maintenance; overkill for this scale |
| Formspree                             | Paid after 50 submissions/month; less control                     |
| Netlify Forms                         | Only works with Netlify hosting; locked in                        |
| AWS SES                               | Complex setup; operational overhead                               |
| mailto: link                          | Exposes email to scrapers; no form UX                             |
