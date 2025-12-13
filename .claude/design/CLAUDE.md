# Daiily Design Specification

## Reference Sites

- **Vercel** (vercel.com) - Minimalist, system fonts, CSS variables, skeleton shimmer
- **Linear** (linear.app) - Dark-first, Inter font, type scale, text gradients

## Design Decisions

### Theme

- **Dark-first** - Dark theme as default (`:root`), light as alternate
- **Background**: `#08090a` (near-black like Linear)
- **Foreground**: `#fafafa` (off-white)

### Typography

#### Heading Hierarchy

- **h1**: `text-3xl font-bold` - Page titles, main headings
- **h2**: `text-2xl font-bold` - Major sections
- **h3**: `text-xl font-semibold` - Subsections, cards
- **h4**: `text-lg font-semibold` - Small sections, labels
- **h5**: `text-base font-semibold` - Minor headings
- **h6**: `text-sm font-semibold` - Small labels

#### Base Settings

- **Font**: Inter Variable (via next/font/google)
- **Feature**: `text-wrap: balance` for headings
- **Line height**: `leading-relaxed` (1.625) for body text

#### Text Color Hierarchy

- **Primary text**: `text-foreground` - Main content
- **Secondary text**: `text-secondary` - Important metadata (dates, counts, labels)
- **Muted text**: `text-muted-foreground` - Secondary info (previews, hints, empty states)

### Colors (HSL) - Cursor Dark Midnight Palette

```css
/* Dark theme (default) - Only 4 accent colors */
--background: 220 10% 4%;
--foreground: 0 0% 98%;
--muted: 220 10% 15%;
--muted-foreground: 220 10% 50%;
--border: 220 10% 15%;

/* 4 Accent Colors */
--primary: 193 43% 67%; /* Cyan #88C0D0 - Main actions, links */
--secondary: 210 34% 63%; /* Blue #81A1C1 - Timestamps, metadata */
--accent: 311 20% 63%; /* Purple/Pink #B48EAD - Badges, highlights, errors */
--success: 92 28% 65%; /* Green #A3BE8C - Tags, positive states */
```

### Color Usage

- **Primary (Cyan)**: Links, active states, focus rings
- **Secondary (Blue)**: Timestamps, metadata, secondary info
- **Accent (Purple/Pink)**: Badges, liked states, delete buttons, errors
- **Success (Green)**: Draft tags, success states

### Spacing & Components

#### Button Sizes

- **sm**: `h-7` (height: 28px) - Small buttons, compact forms
- **md**: `h-8` (height: 32px) - Default/primary buttons
- **lg**: `h-10` (height: 40px) - Large/prominent buttons, CTAs
- **padding**: `px-3` (12px) for sm, `px-4` (16px) for md/lg
- **border-radius**: `rounded-md` (6px)

#### Card Standard

- **Background**: `bg-card`
- **Border**: `border border-border` (using semantic variables)
- **Padding**: `p-6` (24px) - Standard for all cards
- **Border radius**: `rounded-lg` (8px)
- **Shadow**: `shadow-sm` (subtle, no heavy shadows)
- **Hover**: `hover:border-border` for interactive cards

#### Spacing Scale

- **Default gap/margin**: `space-y-4` (16px) - Between elements
- **Section gaps**: `space-y-6` (24px) - Between major sections
- **Component gaps**: `gap-3` (12px) - Inside components
- **Grid spacing**: `gap-4` (16px) - Grid layouts

### Icons

- **Library**: Lucide React icons
- **Sizes**:
  - `w-4 h-4` (16px) - Inline with text, button icons
  - `w-5 h-5` (20px) - Headings, larger labels
  - `w-6 h-6` (24px) - Large cards, prominent features
  - `w-8 h-8` (32px) - Page headers, hero sections
- **Styling**: Use semantic colors (`text-primary`, `text-accent`, etc.)
- **No emojis** - All replaced with Lucide icons throughout

## Files to Update

### Phase 1: Design System

1. `app/globals.css` - Dark-first theme, colors, type scale, shimmer animation
2. `app/layout.tsx` - Add Inter font

### Phase 2: Global Components

3. `components/atoms/button.tsx` - 32px height, refined styling
4. `components/atoms/input.tsx` - Dark-optimized
5. `components/atoms/textarea.tsx` - Dark-optimized
6. `components/templates/auth-layout.tsx` - Dark header

### Phase 3: Feed Components

7. `app/feed/page.tsx` - Remove gradients, clean dark bg
8. `features/feed/components/organisms/feed-list.tsx` - Subtle borders, Lucide icons, shimmer
9. `features/feed/components/molecules/like-button.tsx` - Heart icon
10. `features/feed/components/molecules/reply-form.tsx` - Dark inputs
11. `features/feed/components/molecules/reply-list.tsx` - Dark containers
12. `features/feed/components/organisms/post-form.tsx` - Dark styling

## Visual Patterns

### Cards

- Standard: `bg-card rounded-lg border border-border p-6 shadow-sm`
- All cards use consistent `p-6` (24px) padding
- Borders use `border-border` (semantic variable)
- No heavy shadows, use `shadow-sm` for subtle depth
- Hover states: `hover:border-border` for interactive cards

### Buttons

- **Variants**: primary, secondary, outline, ai
- **Sizes**: sm (h-7), md (h-8), lg (h-10)
- **Padding**: px-3 (sm), px-4 (md/lg)
- **Border radius**: rounded-md (6px)
- **Text weight**: font-semibold for all buttons
- **Primary**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Outline**: `border border-border bg-background hover:bg-muted`
- **Disabled**: `opacity-50 disabled:cursor-not-allowed`

### Skeleton Animation

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### Text Gradient (Linear-style)

```css
background: linear-gradient(to right, var(--foreground), transparent 80%);
-webkit-background-clip: text;
```
