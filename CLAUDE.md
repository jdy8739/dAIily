# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Daiily** - A growth diary feed application where people share daily professional experiences at firms: what they did, learned, and achieved each day. Built with Next.js 15 using **headless architecture**, **Feature-Sliced Design**, and **server-first** approach with PostgreSQL + Prisma.

## Key Commands

- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Core Architecture Rules

### Headless & Server-First

- **API-First Design**: Build API endpoints first, then consume in frontend
- **Server Components Default**: Use Server Components unless client interactivity required
- **Server Actions**: Use for all data mutations and form submissions
- **Minimal Client Components**: Only for event handlers, browser APIs, state, effects

### Data Fetching Rules

- **fetch in Server Components Only**: Use `fetch` API only in Server Components for data fetching
- **Server Actions in Client Components**: Use Server Actions for all data mutations in Client Components
- **Props for Data**: Pass server-fetched data to Client Components via props
- **No Direct API Calls**: Client Components should never fetch from API routes directly

### FSD & Component Rules

- **Feature Independence**: No direct imports between features
- **Upward Imports**: shared → features → app
- **Client Components**: Keep as leaf nodes, pass data via props
- **Atomic Design**: atoms → molecules → organisms → templates

### Code Style Rules

- **Arrow Functions Only**: Use arrow functions for all function declarations
- **Exports at Bottom**: All `export` and `export default` statements must be at the bottom of files
- **ESLint + Prettier**: Format on save enabled in VS Code with automatic linting
- **Barrel Exports**: Use index.ts files to create clean public APIs for features
- **Const Assertions**: Use `as const` for immutable objects and arrays
- **No Default Props**: Use modern default parameter syntax instead of defaultProps

### Navigation Rules

- **NEVER use `<a>` tags for internal links**: Always use Next.js `<Link>` component for internal navigation
- **Internal Links**: `<Link href="/page">` for client-side routing (no page reload)
- **External Links**: `<a href="https://external.com">` for external sites only
- **Special Links**: `<a href="mailto:">` for emails, `<a href="tel:">` for phone numbers
- **Import Required**: Always `import Link from "next/link"` when using internal navigation

### Theme & Styling Rules

- **CSS Variables Only**: Always use semantic CSS variables for colors, never hardcoded colors
- **Semantic Classes**: Use `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`
- **No Dark Mode Classes**: Never use `dark:` prefix classes, CSS variables handle theme switching
- **Core Variables**: `background`, `foreground`, `muted`, `primary`, `secondary`, `accent`, `border`, `input`, `ring`
- **State Variables**: `destructive`, `success`, `warning`, `info` (each with foreground variants)
- **Component Variables**: `card`, `popover` (for elevated surfaces with distinct styling)

### Responsive Design Rules

- **Mobile First**: Design for mobile first, then scale up using Tailwind breakpoints
- **Breakpoints**: Use standard Tailwind breakpoints - `sm:` (640px+), `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+)
- **Mobile (< 640px)**: Single column, touch-friendly spacing, collapsible navigation
- **Tablet (640px - 1023px)**: Two columns where appropriate, compact layouts
- **Desktop (1024px+)**: Multi-column layouts, hover states, larger spacing

## File Structure

### Root Structure

```
/app/                    # Pages, layouts, API routes ONLY
/components/             # Global atoms → molecules → organisms → templates
/lib/                    # Pure functions and utilities
/schemas/                # Zod validation schemas
/features/[feature]/     # Feature-specific code (can nest)
/shared/                 # Cross-application shared code
```

### Feature Structure (`/features/[feature]/`)

```
/components/             # Feature atoms → molecules → organisms → templates
/lib/                    # Feature utilities
/schemas/                # Feature validation schemas
/features/[child]/       # Nested child features
/shared/                 # Feature shared code (ui, types, config, api)
```

## Database & Auth

### PostgreSQL + Prisma

- Use Prisma client in Server Actions and Server Components only
- Schema at `prisma/schema.prisma`
- Use Prisma transactions for complex operations
- Always use generated Prisma types

### Authentication

- **NextAuth.js**: Use NextAuth for authentication with Prisma adapter
- **OAuth Providers**: Google and GitHub authentication configured
- **JWT Sessions**: Session strategy set to JWT for stateless authentication
- **Custom Callbacks**: Handle user creation, sign-in, and session customization in NextAuth callbacks

## Advanced Rules

### Performance & Optimization

- **Bundle Analysis**: Use `@next/bundle-analyzer` to monitor bundle sizes
- **Image Optimization**: Always use `next/image` with proper sizing and lazy loading
- **Font Optimization**: Use `next/font` with preload for critical fonts
- **Dynamic Imports**: Lazy load heavy components with `next/dynamic`

### Type Safety & DX

- **Strict TypeScript**: Enable all strict flags in tsconfig.json
- **Minimize Any Type**: Avoid `any` type when possible - prefer proper TypeScript types, `unknown`, or generics instead
- **Zod Everywhere**: Use Zod for runtime validation and type inference
- **Custom Hooks**: Extract complex logic into reusable custom hooks
- **Error Boundaries**: Implement error boundaries for graceful error handling

### Testing & Quality

- **Test Co-location**: Place test files adjacent to source files
- **MSW for Mocking**: Use Mock Service Worker for API mocking in tests
- **Storybook**: Document components with Storybook for design system
- **Husky + lint-staged**: Pre-commit hooks for code quality

### Security & Best Practices

- **CSRF Protection**: Implemented for all auth Server Actions (login, signup, password reset)
  - CSRF tokens generated server-side and validated on submission
  - Stateless tokens with HMAC-SHA256 signature and 1-hour expiration
  - Timing-safe comparison to prevent timing attacks
- **Content Security Policy**: Implemented via Next.js middleware
  - Strict CSP headers for scripts, styles, images, frames
  - Additional security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
  - Permissions-Policy to restrict camera, microphone, geolocation
- **Environment Validation**: Validate all env vars with Zod schemas (TODO)
- **Rate Limiting**: Add rate limiting to API routes (TODO)

## Environment Variable Policy

**CRITICAL**: **NEVER modify, change, update, or touch the `.env` file unless explicitly ordered by the user.**

- If any operation requires environment variable changes, **STOP** and **ASK** the user for permission first
- Never assume environment variables need to be changed or updated
- Never suggest environment variable modifications without explicit user request
- If you encounter missing environment variables, inform the user but do not modify the `.env` file
- This policy applies to all environment files: `.env`, `.env.local`, `.env.development`, `.env.production`
