# VoidMail

Temporary email service built on Cloudflare.

## Stack

- **Frontend:** React + Vite + Tailwind
- **Backend:** Cloudflare Pages Functions
- **Storage:** Cloudflare KV
- **Email:** Cloudflare Email Routing + Workers

## Quick Start

```bash
# Install
npm install

# Dev
npm run pages:dev

# Deploy
npm run pages:deploy
```

## Email Worker

```bash
cd email-worker
npm install
npm run deploy
```

## Env

```bash
VITE_EMAIL_DOMAIN=yourdomain.com
```

## License

MIT
