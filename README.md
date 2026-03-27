# VoidMail

Temporary disposable email service. Generate random email addresses that auto-expire. No signup, no tracking.

## Stack

- Frontend: React + Vite + Tailwind
- Backend: Cloudflare Pages Functions
- Storage: Cloudflare KV (auto-expiry)
- Email: Cloudflare Email Routing + Workers

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run pages:dev

# Deploy to Cloudflare
npm run pages:deploy
```

## Email Worker

```bash
# Run locally
cd email-worker && npm run dev

# Deploy
cd email-worker && npm run deploy
```

## Environment

Create `.env`:
```
VITE_EMAIL_DOMAIN=yourdomain.com
```

## License

MIT
