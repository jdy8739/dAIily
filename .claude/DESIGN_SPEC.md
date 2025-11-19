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
- **Font**: Inter Variable (via next/font/google)
- **Type scale**: title-1 through title-6
- **Text sizes**: text-large, text-regular, text-small, text-mini
- **Feature**: `text-wrap: balance` for headings

### Colors (HSL) - Cursor Dark Midnight Palette
```css
/* Dark theme (default) - Only 4 accent colors */
--background: 220 10% 4%;
--foreground: 0 0% 98%;
--muted: 220 10% 15%;
--muted-foreground: 220 10% 50%;
--border: 220 10% 15%;

/* 4 Accent Colors */
--primary: 193 43% 67%;      /* Cyan #88C0D0 - Main actions, links */
--secondary: 210 34% 63%;    /* Blue #81A1C1 - Timestamps, metadata */
--accent: 311 20% 63%;       /* Purple/Pink #B48EAD - Badges, highlights, errors */
--success: 92 28% 65%;       /* Green #A3BE8C - Tags, positive states */
```

### Color Usage
- **Primary (Cyan)**: Links, active states, focus rings
- **Secondary (Blue)**: Timestamps, metadata, secondary info
- **Accent (Purple/Pink)**: Badges, liked states, delete buttons, errors
- **Success (Green)**: Draft tags, success states

### Spacing & Components
- **Grid**: 8px base unit
- **Button height**: 32px
- **Button padding**: 0 12px
- **Border radius**: 6px
- **Borders**: 1px solid with alpha (subtle)

### Icons
- Replace all emojis with **Lucide icons**
- Heart, MessageCircle, etc.

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
- `bg-card` with `border border-border/50`
- No heavy shadows
- Subtle hover: `hover:border-border`

### Buttons (Vercel-style)
- Primary: dark bg, light text
- Secondary: transparent bg, border
- Height: 32px, padding: 0 12px

### Skeleton Animation
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Text Gradient (Linear-style)
```css
background: linear-gradient(to right, var(--foreground), transparent 80%);
-webkit-background-clip: text;
```
