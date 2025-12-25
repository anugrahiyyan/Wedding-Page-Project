# Wedding Page Dashboard

A Next.js-based wedding invitation template management system with subdomain routing.

## Features

- 🎨 Beautiful, responsive wedding invitation templates
- 📝 Admin dashboard for template management
- 🌐 Custom subdomain routing (e.g., `john-jane.yourdomain.com`)
- 📋 Invoice & client management with archive functionality
- 🔐 Authentication system

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-secret-key-here"
AUTH_TRUST_HOST=true
```

### Database Setup

```bash
npx prisma db push
npx prisma generate
```

### Seed Admin User

```bash
node src/scripts/seed.js
```

Default credentials: `admin` / `admin`

---

## Development Mode

```bash
npm run dev
```

- Uses Turbopack for fast refresh
- Hot reload enabled
- Access at `http://localhost:3000`

---

## Production Mode

### Build the application first:

```bash
npm run build
```

### Then start the production server:

```bash
npm start
```

> **Important**: Always run `npm run build` before `npm start`. Production mode serves the pre-built assets, so changes won't appear until you rebuild.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Public homepage
│   ├── login/            # Auth pages
│   ├── dashboard/        # Admin panel
│   │   ├── templates/    # Template management
│   │   ├── users/        # User management
│   │   ├── invoices/     # Invoice (subdomain) management
│   │   └── history/      # Archived clients
│   ├── preview/[id]/     # Template preview
│   └── s/[subdomain]/    # Subdomain handler
├── components/           # Shared components
└── lib/                  # Utilities & DB
```

## Subdomain Routing

Invoices map subdomains to templates:
- Create invoice with subdomain `alice-bob`
- Visitors to `alice-bob.yourdomain.com` see the assigned template
- Archived invoices return 404

## License

MIT
