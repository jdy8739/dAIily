# Database Specification

## Overview

Database: PostgreSQL
ORM: Prisma

## Schema Location

`/prisma/schema.prisma`

## Prisma Commands

### Setup & Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only - WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Studio

```bash
# Start Prisma Studio (database GUI)
npx prisma studio
```

- Access at: http://localhost:5555
- Connects directly to your database via `.env` connection string

### Troubleshooting

If Prisma client is corrupted:

```bash
# 1. Clean npm cache
npm cache clean --force

# 2. Remove corrupted Prisma files
rm -rf node_modules/.prisma && rm -rf node_modules/prisma

# 3. Reinstall dependencies
npm install

# 4. Regenerate Prisma client
npx prisma generate
```

### Stop Services

```bash
pkill -f "prisma studio"
```

## Models

### User
Core user model with authentication and profile information.

**Fields:**
- `id` (String, CUID): Primary key
- `email` (String, unique): User email address
- `name` (String?): Display name
- `password` (String?): Hashed password (nullable for OAuth users)
- `verified` (Boolean): Email verification status
- `emailVerified` (DateTime?): Email verification timestamp
- `image` (String?): Profile image URL

**Career Information:**
- `currentRole` (String?): Job title
- `experienceLevel` (ExperienceLevel): Career level (INTERN to C_LEVEL)
- `industry` (String?): Industry sector
- `yearsOfExperience` (Int?): Years of professional experience
- `currentSkills` (String[]): Current skill set
- `targetSkills` (String[]): Skills to learn
- `bio` (String?): User biography

**Goals & Achievements:**
- `currentGoals` (String[]): Active goal descriptions
- `achievementScore` (Int): Gamification score
- `goals` (Goal[]): Related goals

**Rate Limiting:**
- `dailyGenerationCount` (Int): AI story generations today
- `lastGenerationDate` (DateTime?): Last generation timestamp

**Timestamps:**
- `createdAt` (DateTime): Account creation
- `updatedAt` (DateTime): Last update

**Relations:**
- `accounts` (Account[]): OAuth accounts
- `sessions` (Session[]): Active sessions
- `passwordReset` (PasswordReset[]): Password reset tokens
- `posts` (Post[]): Created posts
- `stories` (Story[]): AI-generated stories
- `likes` (Like[]): Liked posts
- `replies` (Reply[]): Post replies

### Goal
User goals with tracking and deadlines.

**Fields:**
- `id` (String, CUID): Primary key
- `userId` (String): Owner reference
- `title` (String): Goal description
- `period` (GoalPeriod): DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
- `status` (GoalStatus): ACTIVE, COMPLETED
- `startDate` (DateTime): Start timestamp
- `deadline` (DateTime): Due date
- `completedAt` (DateTime?): Completion timestamp
- `createdAt`, `updatedAt` (DateTime)

**Indexes:**
- `[userId, status]`: Filter user's active/completed goals
- `[userId, period]`: Filter by time period

### Account
OAuth provider accounts (NextAuth).

**Fields:**
- `id` (String, CUID): Primary key
- `userId` (String): User reference
- `type`, `provider`, `providerAccountId`: OAuth config
- `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`: OAuth tokens

**Constraints:**
- Unique constraint on `[provider, providerAccountId]`

### Session
User sessions (NextAuth).

**Fields:**
- `id` (String, CUID): Primary key
- `userId` (String): User reference
- `sessionToken` (String, unique): Session identifier
- `expires` (DateTime): Expiration timestamp

### VerificationToken
Email verification tokens (NextAuth).

**Fields:**
- `identifier` (String): Email or user ID
- `token` (String, unique): Verification token
- `expires` (DateTime): Expiration timestamp

**Constraints:**
- Unique constraint on `[identifier, token]`

### PasswordReset
Password reset token management.

**Fields:**
- `id` (String, CUID): Primary key
- `userId` (String): User reference
- `token` (String, unique): Reset token
- `expiresAt` (DateTime): Expiration (1 hour)
- `used` (Boolean): Single-use flag
- `createdAt` (DateTime)

### Post
User-created posts (growth diary entries).

**Fields:**
- `id` (String, CUID): Primary key
- `title` (String): Post title
- `content` (String): Post body
- `status` (PostStatus): DRAFT or PUBLISHED
- `authorId` (String): Author reference
- `createdAt`, `updatedAt` (DateTime)

**Relations:**
- `author` (User): Post creator
- `likes` (Like[]): Post likes
- `replies` (Reply[]): Comments

### Like
Post likes (many-to-many User ↔ Post).

**Fields:**
- `id` (String, CUID): Primary key
- `userId`, `postId` (String): References
- `createdAt` (DateTime)

**Constraints:**
- Unique constraint on `[userId, postId]` (one like per user per post)

### Reply
Post comments/replies.

**Fields:**
- `id` (String, CUID): Primary key
- `content` (String): Reply text
- `authorId`, `postId` (String): References
- `createdAt`, `updatedAt` (DateTime)

### Story
AI-generated story suggestions.

**Fields:**
- `id` (String, CUID): Primary key
- `userId` (String): User reference
- `period` (String): Time period identifier
- `content` (String): Generated story
- `createdAt`, `updatedAt` (DateTime)

**Constraints:**
- Unique constraint on `[userId, period]` (one story per period per user)

## Enums

### ExperienceLevel
`INTERN | JUNIOR | MID_LEVEL | SENIOR | LEAD | MANAGER | DIRECTOR | VP | C_LEVEL`

### GoalPeriod
`DAILY | WEEKLY | MONTHLY | QUARTERLY | YEARLY`

### GoalStatus
`ACTIVE | COMPLETED`

### PostStatus
`DRAFT | PUBLISHED`

## Relationships

```
User (1) ──< (N) Account        # OAuth providers
User (1) ──< (N) Session        # Active sessions
User (1) ──< (N) PasswordReset  # Reset tokens
User (1) ──< (N) Post           # Created posts
User (1) ──< (N) Story          # AI stories
User (1) ──< (N) Goal           # User goals
User (1) ──< (N) Like           # Liked posts
User (1) ──< (N) Reply          # Post comments

Post (1) ──< (N) Like           # Post likes
Post (1) ──< (N) Reply          # Post comments
```

**Cascade Deletes:**
All relations use `onDelete: Cascade` - deleting a user removes all associated data.

## Indexes & Performance

### Existing Indexes

1. **Goal Performance:**
   - `@@index([userId, status])` - Filter active/completed goals per user
   - `@@index([userId, period])` - Filter goals by time period

2. **Unique Constraints (Auto-indexed):**
   - `User.email` - Fast email lookup for auth
   - `Session.sessionToken` - Fast session validation
   - `Like.[userId, postId]` - Prevent duplicate likes
   - `Story.[userId, period]` - One story per period
   - `Account.[provider, providerAccountId]` - OAuth uniqueness

### Recommended Future Indexes

```prisma
// Post performance
@@index([authorId, status])     // User's published posts
@@index([status, createdAt])    // Feed pagination
@@index([createdAt])            // Chronological ordering

// Like performance
@@index([postId])               // Count post likes

// Reply performance
@@index([postId, createdAt])    // Load post comments
```

## Migration Guidelines

### Creating Migrations

```bash
# Create migration with descriptive name
npx prisma migrate dev --name add_user_bio_field

# Review generated SQL in prisma/migrations/[timestamp]_[name]/
# Verify migration before committing
```

### Best Practices

1. **Naming Conventions:**
   - Use snake_case for migration names
   - Be descriptive: `add_post_tags`, `add_like_index`, `change_user_email_unique`

2. **Safety Checks:**
   - Never drop columns with user data in production
   - Add columns as nullable first, backfill data, then make required
   - Use `@default()` for new required fields

3. **Breaking Changes:**
   - Rename columns: Create new → migrate data → drop old (multi-step)
   - Change types: May require data transformation
   - Always test migrations on staging database first

4. **Performance:**
   - Add indexes in separate migrations for large tables
   - Use `CONCURRENTLY` for indexes on production (raw SQL)
   - Monitor migration execution time

### Development Workflow

```bash
# 1. Update schema.prisma
# 2. Generate migration
npx prisma migrate dev --name my_migration

# 3. Prisma auto-generates client
# 4. Test changes locally

# 5. Commit schema.prisma + migration files together
git add prisma/
git commit -m "feat: add user bio field"
```

### Production Deployment

```bash
# Apply pending migrations (CI/CD)
npx prisma migrate deploy

# Verify with Prisma Studio
npx prisma studio
```

### Emergency Rollback

```bash
# Revert last migration (development only!)
npx prisma migrate reset

# Production rollback requires manual SQL
# See: prisma/migrations/[timestamp]_[name]/migration.sql
```
