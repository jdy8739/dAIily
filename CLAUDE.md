# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Daiily** - A growth diary feed application where people share daily professional experiences at firms: what they did, learned, and achieved each day. Built with Next.js 15 using **headless architecture**, **Feature-Sliced Design**, and **server-first** approach with PostgreSQL + Prisma.

## Key Commands

- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run lint` - ESLint

## Core Architecture Rules

### Headless & Server-First
- **API-First Design**: Build API endpoints first, then consume in frontend
- **Server Components Default**: Use Server Components unless client interactivity required
- **Server Actions**: Use for all data mutations and form submissions
- **Minimal Client Components**: Only for event handlers, browser APIs, state, effects

### FSD & Component Rules
- **Feature Independence**: No direct imports between features
- **Upward Imports**: shared → features → app
- **Client Components**: Keep as leaf nodes, pass data via props
- **Atomic Design**: atoms → molecules → organisms → templates

### Code Style Rules
- **Arrow Functions Only**: Use arrow functions for all function declarations
- **Exports at Bottom**: All `export` and `export default` statements must be at the bottom of files
- **ESLint + Prettier**: Must be installed with default settings for code formatting and linting
- **Barrel Exports**: Use index.ts files to create clean public APIs for features
- **Const Assertions**: Use `as const` for immutable objects and arrays
- **No Default Props**: Use modern default parameter syntax instead of defaultProps

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
- **OAuth Providers**: Google and GitHub authentication
- **Custom Auth Logic**: Implement own session management and user handling
- **Server Actions**: Handle auth flows in Server Actions, not API routes
- **Session Storage**: Use secure HTTP-only cookies for session tokens

## Advanced Rules

### Performance & Optimization
- **Bundle Analysis**: Use `@next/bundle-analyzer` to monitor bundle sizes
- **Image Optimization**: Always use `next/image` with proper sizing and lazy loading
- **Font Optimization**: Use `next/font` with preload for critical fonts
- **Dynamic Imports**: Lazy load heavy components with `next/dynamic`

### Type Safety & DX
- **Strict TypeScript**: Enable all strict flags in tsconfig.json
- **Zod Everywhere**: Use Zod for runtime validation and type inference
- **Custom Hooks**: Extract complex logic into reusable custom hooks
- **Error Boundaries**: Implement error boundaries for graceful error handling

### Testing & Quality
- **Test Co-location**: Place test files adjacent to source files
- **MSW for Mocking**: Use Mock Service Worker for API mocking in tests
- **Storybook**: Document components with Storybook for design system
- **Husky + lint-staged**: Pre-commit hooks for code quality

### Security & Best Practices
- **Environment Validation**: Validate all env vars with Zod schemas
- **CSRF Protection**: Implement CSRF tokens for sensitive operations
- **Rate Limiting**: Add rate limiting to API routes
- **Content Security Policy**: Configure CSP headers for security