# Daiily

A growth diary feed application where professionals share their daily experiences, learnings, and achievements at work.

## Tech Stack

### Core
- **Framework**: Next.js 15 with App Router + Turbopack
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Architecture**: Headless, Feature-Sliced Design (FSD)

### Authentication & Security
- **Authentication**: NextAuth.js with Prisma adapter
- **OAuth Providers**: Google, GitHub
- **Password Hashing**: bcryptjs
- **JWT**: jsonwebtoken
- **CSRF Protection**: Custom HMAC-SHA256 tokens for auth actions

### Features & Utilities
- **AI Integration**: OpenAI for story generation
- **Forms**: React Hook Form + @hookform/resolvers
- **Validation**: Zod schemas
- **Email**: Resend for transactional emails
- **Logging**: Pino with sensitive data redaction (pino-pretty for dev)
- **UI Components**: Lucide React icons
- **Theming**: next-themes (dark/light mode support)

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

## Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (no migrations)
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:seed` - Seed database with test data

## Deployment

The application is deployed at **https://daiily.site** using Docker and nginx.

For detailed deployment instructions, environment setup, and infrastructure configuration, see [DEPLOY.md](./DEPLOY.md).

## Project Structure

```
/app/                    # Next.js App Router (pages, layouts, API routes)
  ├── feed/              # Main feed page
  ├── write/             # Create new post
  ├── story/[id]/        # Individual story view
  ├── profile/[id]/      # User profile pages
  ├── drafts/            # Draft posts
  ├── login/             # Login page
  ├── signup/            # Registration page
  ├── forgot-password/   # Password reset request
  ├── reset-password/    # Password reset form
  └── api/               # API routes

/features/               # Feature-Sliced Design modules
  ├── auth/              # Authentication (login, signup, password reset, email verification)
  ├── feed/              # Feed display and post creation
  ├── story/             # Story viewing and management
  ├── profile/           # User profile display
  ├── ai/                # AI story generation
  └── goals/             # Goal tracking (daily, weekly, monthly, quarterly, yearly)

/components/             # Global shared UI components
  ├── atoms/             # Basic UI elements (buttons, inputs, etc.)
  ├── molecules/         # Composite components
  ├── providers/         # React context providers
  └── templates/         # Page templates

/lib/                    # Utilities and shared functions
  ├── auth.ts            # Auth utilities (JWT, CSRF, password hashing)
  ├── auth-config.ts     # NextAuth configuration
  ├── db.ts              # Prisma client instance
  ├── email.ts           # Email sending utilities
  ├── env.ts             # Environment variable configuration
  └── logger.ts          # Structured logging with Pino

/prisma/                 # Database
  ├── schema.prisma      # Database schema
  ├── migrations/        # Database migrations
  └── seed.ts            # Database seeding script

/docs/                   # Documentation
  ├── ai-review-concept.md       # AI story generation & security features
  ├── db.md                      # Database schema & migration guide
  └── git-commit-guide.md        # Commit message conventions

/.claude/                # Claude Code configuration
/scripts/                # Utility scripts
```

### Feature Structure
Each feature follows this pattern:
```
/features/[feature]/
  ├── components/        # Feature-specific components (atomic design)
  ├── lib/               # Feature utilities and actions
  └── schemas/           # Feature-specific Zod schemas
```

## Features

### Authentication
- Email/password authentication with secure password hashing
- OAuth integration (Google, GitHub)
- Password reset via email
- CSRF protection for auth actions
- Session management with NextAuth.js

### Content Management
- Create and edit daily growth stories
- Draft system for work-in-progress posts
- Rich text editing with AI assistance
- Tag/chip-based categorization
- Infinite scroll pagination

### Social Features
- Public feed of user stories
- User profiles with post history
- View other users' growth journeys

### AI Integration
- AI-powered story suggestions
- Content generation assistance
- OpenAI GPT integration

### UI/UX
- Dark/light theme support with next-themes
- Responsive design (mobile-first)
- Smooth transitions and loading states
- Accessible components

### Developer Experience
- Structured logging with sensitive data redaction
- Type-safe database queries with Prisma
- Zod schema validation
- Comprehensive error handling
- Hot reload with Turbopack

## Development Notes

- **Server Components by default**: Client Components only when necessary
- **Server Actions**: All data mutations use Server Actions
- **Arrow functions**: Use arrow functions and exports at bottom
- **Feature-Sliced Design**: Nested features support with strict upward imports
- **Type Safety**: Strict TypeScript with Zod runtime validation
- **No hardcoded colors**: Always use CSS variables for theming

See `CLAUDE.md` for detailed architecture guidelines.
