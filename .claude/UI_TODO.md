# UI Consistency & Aesthetics Todo List

## High Priority

### 1. Replace Emojis with Lucide Icons

- [ ] `components/molecules/user-name-menu.tsx:20` - `📝` → `FileText`
- [ ] `components/molecules/user-name-menu.tsx:25` - `🏆` → `Trophy`
- [ ] `features/story/components/story-generator.tsx:240` - `✨` → `Sparkles`
- [ ] `features/story/components/story-generator.tsx:261` - `✍️` → `PenTool`
- [ ] `features/story/components/story-generator.tsx:225` - `📊` → `BarChart3`
- [ ] `features/story/components/story-generator.tsx:304` - `⚠️` → `AlertTriangle`
- [ ] `features/story/components/story-generator.tsx:327` - `💡` → `Lightbulb`
- [ ] `features/story/components/user-story-viewer.tsx:135` - `🎯` → `Target`
- [ ] `features/story/components/user-story-viewer.tsx:148` - `🏆` → `Trophy`
- [ ] `features/story/components/user-story-viewer.tsx:227` - `📝` → `FileText`
- [ ] `features/feed/components/organisms/user-feed-list.tsx:42` - `❤️` → `Heart`
- [ ] `features/feed/components/organisms/user-feed-list.tsx:43` - `💬` → `MessageCircle`
- [ ] `features/feed/components/organisms/edit-post-form.tsx:257` - `✨` → `Sparkles`
- [ ] `features/goals/components/goals-section.tsx:138` - `🎯` → `Target`
- [ ] `features/goals/components/goals-section.tsx:162` - `🎯` → `Target`
- [ ] `features/goals/components/goals-section.tsx:179` - `🏆` → `Trophy`
- [ ] `app/feed/[id]/page.tsx:178` - `💬` → `MessageCircle`
- [ ] `app/feed/[id]/page.tsx:185` - `🔄` → `Share2`
- [ ] `app/feed/[id]/page.tsx:153` - `✏️` → `Pencil`
- [ ] `app/feed/user/[userId]/page.tsx:127` - `✍️` → `PenTool`
- [ ] `app/error.tsx:24` - `⚠️` → `AlertTriangle`
- [ ] `components/atoms/error-boundary.tsx:52` - `⚠️` → `AlertTriangle`
- [ ] `app/global-error.tsx:53` - `⚠️` → `AlertTriangle`
- [ ] `features/goals/components/goal-card.tsx:103` - `✎` → `Pencil`
- [ ] `features/goals/components/goal-card.tsx:112` - `✓` → `Check`
- [ ] `features/goals/components/goal-card.tsx:121` - `✕` → `X`
- [ ] `features/goals/components/goal-card.tsx:129` - `✓` → `Check`
- [ ] `features/goals/components/goal-card.tsx:140` - `↻` → `RotateCcw`
- [ ] `features/goals/components/goal-card.tsx:150` - `✕` → `X`

### 2. Fix Hardcoded Colors

- [ ] `components/molecules/user-name-menu.tsx:33` - `text-blue-500 hover:text-blue-400` → `text-primary hover:text-primary/80`

---

## Medium Priority

### 3. Standardize Card Border Colors

Choose one pattern and apply consistently:
- Option A: `border-border/50` (subtle)
- Option B: `border-border` (standard)

Files to update:
- [ ] `features/story/components/story-generator.tsx:201,221` - `border-accent/30`
- [ ] `app/feed/[id]/page.tsx:119,192` - `border-accent/30`
- [ ] `features/feed/components/organisms/drafts-list.tsx:34` - `border-accent/30`
- [ ] `app/feed/user/[userId]/page.tsx:249` - `border-accent/30`
- [ ] `features/auth/components/organisms/login-form.tsx:75` - `border-primary/30`
- [ ] `features/auth/components/organisms/signup-form.tsx:61` - `border-primary/30`
- [ ] `app/profile/page.tsx:51` - `border-primary/30`

### 4. Standardize Card Padding to p-6

- [ ] `features/feed/components/organisms/feed-list.tsx:31,61` - `p-5` → `p-6`
- [ ] `features/feed/components/organisms/user-feed-list.tsx:34` - `p-4` → `p-6`
- [ ] `features/goals/components/goal-card.tsx:76` - `p-4` → `p-6`
- [ ] `features/story/components/story-generator.tsx:201` - `p-6` ✓
- [ ] `features/story/components/story-generator.tsx:221` - `p-8` → `p-6`

### 5. Consolidate Inline Buttons to Button Component

- [ ] `features/feed/components/molecules/reply-form.tsx:66` - Custom button
- [ ] `features/feed/components/molecules/edit-reply-form.tsx:85,96` - Custom buttons
- [ ] `features/feed/components/molecules/delete-post-button.tsx:47,54,65` - Custom buttons
- [ ] `app/feed/[id]/page.tsx:150` - Inline edit link

### 6. Establish Typography Hierarchy

Standard sizes to apply:
- h1: `text-3xl font-bold` or `title-2`
- h2: `text-2xl font-bold` or `title-3`
- h3: `text-xl font-semibold` or `title-4`
- h4: `text-lg font-semibold` or `title-5`

Files to review:
- [ ] `app/feed/user/[userId]/page.tsx:103` - `text-xl font-semibold`
- [ ] `app/feed/[id]/page.tsx:193` - `text-lg font-semibold`
- [ ] `features/goals/components/goals-section.tsx:137` - `text-lg font-semibold`

---

## Low Priority

### 7. Review Text Color Usage

- [ ] Review `text-muted-foreground` usage - some could use `text-secondary` for better contrast

### 8. Document Design Standards

- [ ] Update DESIGN_SPEC.md with:
  - Button sizes: sm (h-7), md (h-8), lg (h-10)
  - Card standard: `bg-card rounded-lg border border-border/50 p-6`
  - Heading hierarchy
  - Spacing scale: space-y-4 (default), space-y-6 (sections)

---

## Completed

- [x] Remove old colors (destructive, warning, info)
- [x] Apply 4-color palette (primary, secondary, accent, success)
- [x] Unify big button font-weight to font-semibold
- [x] Dark-first theme
- [x] Inter font
- [x] Feed page redesign
