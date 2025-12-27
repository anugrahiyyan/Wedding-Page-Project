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

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file with your values:  

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-here"
AUTH_TRUST_HOST=true
# For production/VPS (use your actual IP or Domain)
AUTH_URL="http://217.xx.xx.xx:3000" 
ROOT_DOMAIN="yourdomain.com" # Your main domain for subdomains
```

> **Tip**: You can generate a secure `AUTH_SECRET` by running:
> ```bash
> openssl rand -base64 32
> ```

### Database Setup (Fresh Start)
This will delete the existing database and create a brand new one.

```bash
# 1. Run the setup (creates DB + seeds admin)
npm run db:setup
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
### 3. Using pm2 for production:

```bash
npm install -g pm2
pm2 start npm --name wedding-page -- start
pm2 save
pm2 startup
```
> **Note**: You can use `pm2 monit` to monitor your server.
---

## Project Structure

```
src/
├── app/
│   ├── page.tsx               # Public homepage
│   ├── login/                 # Auth pages
│   ├── dashboard/             # Admin panel
│   │   ├── templates/         # Template management
│   │   ├── tiers/             # Tier management
│   │   ├── users/             # User management
│   │   ├── invoices/          # Invoice (subdomain) management
│   │   └── history/           # Archived clients
│   ├── preview/[id]/          # Template preview
│   ├── s/[subdomain]/         # Subdomain handler
│   └── api/                   # API Routes (upload, etc.)
├── components/                # Shared components (NavBar, Modals, etc.)
├── contexts/                  # React contexts (ThemeContext)
├── lib/                       # Utilities (DB, Hash, Auth)
├── scripts/                   # Build & Setup scripts
├── auth.ts                    # Auth.js configuration
└── middleware.ts              # Next.js Middleware (Subdomain routing)
```

## Subdomain Routing

Invoices map subdomains to templates:
- Create invoice with subdomain `alice-bob`
- Visitors to `alice-bob.yourdomain.com` see the assigned template
- Archived invoices return 404

## License

MIT
