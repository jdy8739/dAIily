# Daiily

A growth diary feed application where professionals share their daily experiences, learnings, and achievements at work.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL + Prisma
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Architecture**: Headless, Feature-Sliced Design (FSD)

## Getting Started

### Database Setup

1. **Install PostgreSQL** (if not already installed):
   ```bash
   brew install postgresql
   ```

2. **Start PostgreSQL service**:
   ```bash
   brew services start postgresql@14
   ```

3. **Create the database**:
   ```bash
   createdb daiily
   ```

4. **Configure environment variables**:
   Update `.env` with your local database connection:
   ```env
   DATABASE_URL="postgresql://[your_username]:@localhost:5432/daiily"
   ```
   Replace `[your_username]` with your system username.

5. **Generate Prisma client and sync database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `/app/` - Pages and layouts only
- `/components/` - Global UI components (atomic design)
- `/features/` - Feature-specific code with nested capabilities
- `/lib/` - Pure functions and utilities
- `/schemas/` - Zod validation schemas
- `/shared/` - Cross-application shared code

## Development Notes

- Server Components by default, Client Components only when necessary
- Server Actions for all data mutations
- Arrow functions and exports at bottom
- Feature-Sliced Design with nested features support

See `CLAUDE.md` for detailed architecture guidelines.
