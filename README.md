# SchoolOS — Enterprise Operating System

Production-grade foundation for a multi-tenant SaaS School Operating System.

## Architecture

- **Monorepo**: NPM Workspaces
- **Backend**: NestJS (REST, Prisma, PostgreSQL, Redis)
- **Mobile**: Flutter (Responsive, Clean Architecture)
- **Web**: Next.js (Management Dashboard)
- **Database**: PostgreSQL
- **Multi-tenancy**: Organization-based scoping

## Project Structure

```text
schoolos/
├── apps/
│   ├── api/          # NestJS REST API
│   ├── mobile/       # Flutter Application
│   ├── web/          # Next.js Web App
│   └── worker/       # NestJS Worker
├── packages/
│   ├── shared/       # Shared TS logic/types
│   ├── contracts/    # API DTOs
│   └── config/       # Shared Configuration
├── infrastructure/   # Deployment & CI/CD
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Flutter SDK (v3.x)
- Docker & Docker Compose

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start infrastructure:
   ```bash
   docker-compose up -d
   ```
4. Initialize database:
   ```bash
   npm run prisma:migrate
   ```

## Development

- **API**: `npm run api:dev`
- **Mobile**: `npm run mobile:dev`
- **Web**: `npm run web:dev`
- **Worker**: `npm run worker:dev`
