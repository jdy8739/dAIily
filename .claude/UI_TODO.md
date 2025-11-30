# UI Consistency & Aesthetics Todo List

## High Priority

### 1. Replace Emojis with Lucide Icons

- [x] `components/molecules/user-name-menu.tsx:20` - `📝` → `FileText`
- [x] `components/molecules/user-name-menu.tsx:25` - `🏆` → `Trophy`
- [x] `features/story/components/story-generator.tsx:240` - `✨` → `Sparkles`
- [x] `features/story/components/story-generator.tsx:261` - `✍️` → `PenTool`
- [x] `features/story/components/story-generator.tsx:225` - `📊` → `BarChart3`
- [x] `features/story/components/story-generator.tsx:304` - `⚠️` → `AlertTriangle`
- [x] `features/story/components/story-generator.tsx:327` - `💡` → `Lightbulb`
- [x] `features/story/components/user-story-viewer.tsx:135` - `🎯` → `Target`
- [x] `features/story/components/user-story-viewer.tsx:148` - `🏆` → `Trophy`
- [x] `features/story/components/user-story-viewer.tsx:227` - `📝` → `FileText`
- [x] `features/feed/components/organisms/user-feed-list.tsx:42` - `❤️` → `Heart`
- [x] `features/feed/components/organisms/user-feed-list.tsx:43` - `💬` → `MessageCircle`
- [x] `features/feed/components/organisms/edit-post-form.tsx:257` - `✨` → `Sparkles`
- [x] `features/goals/components/goals-section.tsx:138` - `🎯` → `Target`
- [x] `features/goals/components/goals-section.tsx:162` - `🎯` → `Target`
- [x] `features/goals/components/goals-section.tsx:179` - `🏆` → `Trophy`
- [x] `app/feed/[id]/page.tsx:178` - `💬` → `MessageCircle`
- [x] `app/feed/[id]/page.tsx:185` - `🔄` → `Share2`
- [x] `app/feed/[id]/page.tsx:153` - `✏️` → `Pencil`
- [x] `app/feed/user/[userId]/page.tsx:127` - `✍️` → `PenTool`
- [x] `app/error.tsx:24` - `⚠️` → `AlertTriangle`
- [x] `components/atoms/error-boundary.tsx:52` - `⚠️` → `AlertTriangle`
- [x] `app/global-error.tsx:53` - `⚠️` → `AlertTriangle`
- [x] `features/goals/components/goal-card.tsx:103` - `✎` → `Pencil`
- [x] `features/goals/components/goal-card.tsx:112` - `✓` → `Check`
- [x] `features/goals/components/goal-card.tsx:121` - `✕` → `X`
- [x] `features/goals/components/goal-card.tsx:129` - `✓` → `Check`
- [x] `features/goals/components/goal-card.tsx:140` - `↻` → `RotateCcw`
- [x] `features/goals/components/goal-card.tsx:150` - `✕` → `X`

### 2. Fix Hardcoded Colors

- [x] `components/molecules/user-name-menu.tsx:33` - `text-blue-500 hover:text-blue-400` → `text-primary hover:text-primary/80`

---

## Medium Priority

### 3. Standardize Card Border Colors

Choose one pattern and apply consistently:

- Option A: `border-border/50` (subtle)
- Option B: `border-border` (standard)

Files to update (standardized to `border-border`):

- [x] `features/story/components/story-generator.tsx:201,221` - `border-accent/30` → `border-border`
- [x] `app/feed/[id]/page.tsx:119,192` - `border-accent/30` → `border-border`
- [x] `features/feed/components/organisms/drafts-list.tsx:34` - `border-accent/30` → `border-border`
- [x] `app/feed/user/[userId]/page.tsx:249` - `border-accent/30` → `border-border`
- [x] `features/auth/components/organisms/login-form.tsx:75` - `border-primary/30` → `border-border`
- [x] `features/auth/components/organisms/signup-form.tsx:61` - `border-primary/30` → `border-border`
- [x] `app/profile/page.tsx:51` - `border-primary/30` → `border-border`

### 4. Standardize Card Padding to p-6

- [x] `features/feed/components/organisms/feed-list.tsx:31,61` - `p-5` → `p-6`
- [x] `features/feed/components/organisms/user-feed-list.tsx:34` - `p-4` → `p-6`
- [x] `features/goals/components/goal-card.tsx:76` - `p-4` → `p-6`
- [x] `features/story/components/story-generator.tsx:201` - `p-6` ✓
- [x] `features/story/components/story-generator.tsx:221` - `p-8` → `p-6`

### 5. Consolidate Inline Buttons to Button Component

- [x] `features/feed/components/molecules/reply-form.tsx:66` - Custom button → Button component
- [x] `features/feed/components/molecules/edit-reply-form.tsx:85,96` - Custom buttons → Button component
- [x] `features/feed/components/molecules/delete-post-button.tsx:47,54,65` - Custom buttons → Button component
- [x] `app/feed/[id]/page.tsx:150` - Inline edit link (already using Pencil icon)

### 6. Establish Typography Hierarchy

Standard sizes to apply:

- h1: `text-3xl font-bold` (correct)
- h2: `text-2xl font-bold` (correct)
- h3: `text-xl font-semibold` (correct)
- h4: `text-lg font-semibold` (correct)

Files reviewed and fixed:

- [x] `app/feed/user/[userId]/page.tsx:104` - `<h3 text-xl font-semibold>` ✓
- [x] `app/feed/[id]/page.tsx:195` - Changed `<h3>` to `<h4 text-lg font-semibold>` (semantic fix)
- [x] `features/goals/components/goals-section.tsx:138` - Changed `<h2>` to `<h3 text-lg font-semibold>` (semantic fix)

---

## Low Priority

### 7. Review Text Color Usage

- [x] Reviewed `text-muted-foreground` usage and improved contrast with `text-secondary`:
  - `features/feed/components/organisms/user-feed-list.tsx:41` - Engagement stats (date, likes, replies)
  - `app/feed/user/[userId]/page.tsx:86,92,98` - Stats labels (Posts, Likes, Replies)
  - `features/story/components/user-story-viewer.tsx:176` - Goal deadline metadata
  - Kept `text-muted-foreground` for truly secondary info (previews, hints, empty states)

### 8. Document Design Standards

- [x] Update DESIGN_SPEC.md with:
  - Button sizes: sm (h-7), md (h-8), lg (h-10) ✓
  - Card standard: `bg-card rounded-lg border border-border p-6` ✓
  - Heading hierarchy: h1-h6 with typography classes ✓
  - Spacing scale: space-y-4 (default), space-y-6 (sections) ✓
  - Icon library and sizes (Lucide React) ✓
  - Text color hierarchy (primary > secondary > muted) ✓
  - Button variants and states ✓

---

## Completed

### ✅ High Priority (100%)

- [x] Replace Emojis with Lucide Icons (28 items)
- [x] Fix Hardcoded Colors (1 item)

### ✅ Medium Priority (100%)

- [x] Standardize Card Border Colors (7 files) → border-border
- [x] Standardize Card Padding (5 files) → p-6
- [x] Consolidate Inline Buttons (3 files) → Button component
- [x] Establish Typography Hierarchy (semantic HTML fixes)

### ✅ Low Priority (100%)

- [x] Review Text Color Usage (improved contrast with text-secondary)
- [x] Document Design Standards (DESIGN_SPEC.md updated)

### ✅ Previous

- [x] Remove old colors (destructive, warning, info)
- [x] Apply 4-color palette (primary, secondary, accent, success)
- [x] Unify big button font-weight to font-semibold
- [x] Dark-first theme
- [x] Inter font
- [x] Feed page redesign

### 📊 UI TODO Progress: 36/36 items completed (100%)
