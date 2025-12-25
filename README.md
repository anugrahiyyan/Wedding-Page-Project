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

### Database Setup (Fresh Start)
This will delete the existing database and create a brand new one.

```bash
# 1. Delete existing dev.db if it exists
# Windows (PowerShell)
del prisma\dev.db
# Unix
rm prisma/dev.db

# 2. Push schema to creating new DB
npx prisma db push

# 3. Seed the admin user
node src/scripts/seed.js
```

Default credentials: `admin` / `admin123`

---

## Development Mode

```bash
npm run dev
```

- Uses Turbopack for fast refresh
- Hot reload enabled
- Access at `http://localhost:3000`

---

## Production Deployment

### 1. Build the application:

```bash
npm run build
```

> **Note**: This command STRICTLY uses variables from `.env`. Any `.env.local` file will be temporarily ignored to ensure a clean production build properly reflects the default configuration.

### 2. Start the production server:

```bash
npm start
```

> **Important**: `dev.db` is NOT included in the git repository. You must run the database setup steps on your deployment server (or copy your local db if appropriate, though not recommended).

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
