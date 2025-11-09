# SEO Implementation Plan for Daiily

## Overview

Complete SEO system implementation for Daiily using Next.js 15's file-based metadata API and dynamic `generateMetadata` function to enable rich social media previews and improved search engine optimization.

## Current Status

- ✅ **COMPLETED** - Metadata configuration in root layout (Phase 1)
- ✅ **COMPLETED** - Open Graph images for social sharing (Phase 2)
- ✅ **COMPLETED** - Twitter Card metadata & images (Phase 1 & 2)
- ❌ No dynamic metadata for individual posts/stories
- ❌ Missing sitemap.xml and robots.txt
- ❌ No structured data (JSON-LD)

## Implementation Phases

### Phase 1: Root Metadata (Global SEO) ✅ COMPLETED
**Priority:** 🔴 High
**Location:** `/app/layout.tsx`
**Status:** ✅ Done - Implemented in `app/layout.tsx:9-77`

#### Tasks
1. Add static `Metadata` export with:
   - Site title: "Daiily - Professional Growth Diary"
   - Site description
   - Open Graph metadata (title, description, type, url, images)
   - Twitter Card metadata (card type, site, creator)
   - Viewport configuration
   - Theme color for PWA
   - Canonical URL structure
   - Language and locale settings

#### Implementation Details
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Daiily - Professional Growth Diary',
    template: '%s | Daiily'
  },
  description: 'Share daily professional experiences, track growth, and learn from others in your field',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Daiily',
    // ... more config
  },
  twitter: {
    card: 'summary_large_image',
    // ... more config
  }
}
```

#### Files to Modify
- `app/layout.tsx`

---

### Phase 2: Static OG Images ✅ COMPLETED
**Priority:** 🔴 High
**Location:** `/app/`
**Status:** ✅ Done - Implemented in `app/opengraph-image.tsx` and `app/twitter-image.tsx`

#### Tasks
1. Create dynamic OG image generator using `next/og` ImageResponse
2. Design branded card with:
   - Daiily logo/wordmark
   - Gradient background matching brand colors
   - Tagline: "Track Your Professional Growth"
   - Clean, professional design

3. Create Twitter-specific image variant

#### Implementation Details
- Use `ImageResponse` from `next/og`
- Render JSX/CSS-based design
- Size: 1200x630px (Open Graph standard)
- Export runtime config for edge rendering

#### Files to Create
- `app/opengraph-image.tsx` - 1200x630px OG image
- `app/twitter-image.tsx` - 1200x600px Twitter card

---

### Phase 3: Dynamic Page Metadata
**Priority:** 🔴 High
**Location:** Individual pages with unique content

#### 3.1 Feed Post Detail
**File:** `app/feed/[id]/page.tsx`

**Tasks:**
- Add `generateMetadata` function
- Fetch post data (title, content, author)
- Generate dynamic metadata:
  - Title: "{Post Title} by {Author Name}"
  - Description: First 160 chars of post content
  - OG image: Reference dynamic OG image or static fallback
  - Author metadata
  - Published time
  - Article type

**Implementation:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.id)
  return {
    title: post.title,
    description: truncate(post.content, 160),
    openGraph: {
      title: `${post.title} by ${post.author.name}`,
      description: truncate(post.content, 160),
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.author.name],
    }
  }
}
```

#### 3.2 User Story Page
**File:** `app/story/[userId]/page.tsx`

**Tasks:**
- Add `generateMetadata` function
- Fetch user profile data
- Generate metadata:
  - Title: "{User Name}'s Growth Story"
  - Description: User bio or stats summary
  - OG image: User-specific card
  - Profile type

#### 3.3 User Feed Page
**File:** `app/feed/user/[userId]/page.tsx`

**Tasks:**
- Similar to story page
- Title: "{User Name}'s Posts"
- Include post count in description

#### Files to Modify
- `app/feed/[id]/page.tsx`
- `app/story/[userId]/page.tsx`
- `app/feed/user/[userId]/page.tsx`

---

### Phase 4: Static Page Metadata
**Priority:** 🟡 Medium
**Location:** Auth and static pages

#### Tasks
Add simple metadata exports to all static pages:

**Auth Pages:**
- Login: "Login to Daiily"
- Signup: "Join Daiily - Start Your Growth Journey"
- Forgot Password: "Reset Your Password"
- Verify Email: "Verify Your Email Address"

**App Pages:**
- Feed: "Professional Growth Feed | Daiily"
- Profile: "Your Profile | Daiily"
- Write: "Share Your Day | Daiily"
- Drafts: "Your Drafts | Daiily"

**Robots Configuration:**
- Auth pages: `robots: { index: false, follow: false }`
- App pages: `robots: { index: true, follow: true }`

#### Files to Modify
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `app/verify-email/page.tsx`
- `app/resend-verification/page.tsx`
- `app/profile/page.tsx`
- `app/write/page.tsx`
- `app/drafts/page.tsx`
- `app/feed/page.tsx`
- `app/story/page.tsx`
- `app/feed/[id]/edit/page.tsx`

---

### Phase 5: SEO Infrastructure
**Priority:** 🟡 Medium
**Location:** `/app/`

#### 5.1 Dynamic Sitemap
**File:** `app/sitemap.ts`

**Tasks:**
- Generate sitemap dynamically
- Include:
  - Homepage
  - Static pages (login, signup, feed)
  - All published posts: `/feed/[id]`
  - User story pages: `/story/[userId]`
  - User feed pages: `/feed/user/[userId]`
- Exclude:
  - Auth pages
  - Draft posts
  - Private profiles
- Set proper `lastModified` dates
- Set `changeFrequency` and `priority`

**Implementation:**
```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { status: 'published' }
  })

  return [
    { url: '/', changeFrequency: 'daily', priority: 1 },
    { url: '/feed', changeFrequency: 'hourly', priority: 0.9 },
    ...posts.map(post => ({
      url: `/feed/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
```

#### 5.2 Robots.txt
**File:** `app/robots.ts`

**Tasks:**
- Allow crawling of public pages
- Disallow auth pages, drafts, admin routes
- Reference sitemap location

**Implementation:**
```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/feed', '/story'],
      disallow: ['/login', '/signup', '/drafts', '/api', '/write'],
    },
    sitemap: `${process.env.NEXTAUTH_URL}/sitemap.xml`,
  }
}
```

#### 5.3 Structured Data (JSON-LD)
**Tasks:**
- Add Organization schema to root layout
- Add Article schema to post pages
- Add Person schema to user profile pages
- Add BreadcrumbList schema for navigation

**Implementation Locations:**
- Root layout: Organization + WebSite schema
- Post pages: Article + BreadcrumbList
- User pages: Person + ProfilePage

#### Files to Create
- `app/sitemap.ts`
- `app/robots.ts`
- `lib/structured-data.ts` (helper functions)

---

### Phase 6: Dynamic OG Image Generation
**Priority:** 🟢 Nice to Have
**Location:** Dynamic routes

#### 6.1 Post OG Image
**File:** `app/feed/[id]/opengraph-image.tsx`

**Tasks:**
- Create dynamic OG image for each post
- Design:
  - Post title (truncated to fit)
  - Author name and avatar
  - Post date
  - Daiily branding (logo/watermark)
  - Gradient background
  - Preview of content (first 2-3 lines)

**Technical:**
- Use `ImageResponse` with edge runtime
- Size: 1200x630px
- Fetch post data by ID
- Render using JSX/CSS

#### 6.2 User Profile OG Image
**File:** `app/story/[userId]/opengraph-image.tsx`

**Tasks:**
- Create dynamic OG image for user profiles
- Design:
  - User name and avatar
  - Bio/tagline
  - Stats (posts count, followers, etc.)
  - Daiily branding
  - Professional card design

#### Files to Create
- `app/feed/[id]/opengraph-image.tsx`
- `app/story/[userId]/opengraph-image.tsx`
- `app/feed/user/[userId]/opengraph-image.tsx`

---

## Priority Implementation Order

### 🔴 Phase 1 (Immediate Impact)
1. **Root metadata** - Global SEO foundation
2. **Static OG images** - Basic social sharing
3. **Dynamic post metadata** - Rich post previews

**Why first?** These provide immediate value when users share links

### 🟡 Phase 2 (Enhancement)
4. **Sitemap & robots.txt** - Better crawling
5. **Static page metadata** - Complete coverage
6. **Structured data** - Rich search results

**Why second?** Improves discoverability and search rankings

### 🟢 Phase 3 (Polish)
7. **Dynamic OG images** - Beautiful custom previews

**Why last?** Nice to have but requires more development time

---

## Expected Results

### ✅ Social Media Sharing
- Rich previews on Twitter/X with large image cards
- Detailed previews on Facebook with title, description, image
- Professional appearance on LinkedIn
- Custom images with Daiily branding
- Post-specific and user-specific preview cards

### ✅ Search Engine Optimization
- Proper title and meta description tags
- Sitemap for better indexing
- Robots.txt for crawl optimization
- Structured data for rich results (breadcrumbs, articles, profiles)
- Improved rankings for relevant queries

### ✅ User Experience
- Professional brand appearance when sharing
- Increased click-through rates from social media
- Better brand recognition and trust
- Improved engagement metrics

### ✅ Technical Benefits
- Next.js 15 best practices
- File-based metadata convention
- Edge runtime for fast OG generation
- Automatic metadata merging
- Type-safe metadata configuration

---

## Technical Considerations

### Performance
- Use React `cache()` to memoize data fetching in `generateMetadata`
- Edge runtime for OG image generation
- Optimize image sizes (use Next.js Image optimization)

### Type Safety
- Import `Metadata` type from `next`
- Use `MetadataRoute.Sitemap` and `MetadataRoute.Robots` types
- Leverage TypeScript for compile-time checks

### SEO Best Practices
- Keep titles under 60 characters
- Keep descriptions 150-160 characters
- Use descriptive, keyword-rich text
- Include canonical URLs
- Set proper locale and language
- Use HTTPS URLs for all metadata

### Testing
- Test social previews with:
  - Twitter Card Validator
  - Facebook Sharing Debugger
  - LinkedIn Post Inspector
- Validate structured data with Google Rich Results Test
- Check sitemap with Google Search Console

---

## Environment Variables Needed

```env
NEXTAUTH_URL=https://yourdomain.com  # Already exists
```

No additional environment variables required.

---

## Success Metrics

- [ ] All pages have proper meta tags
- [ ] Social sharing shows rich previews
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Structured data passes validation
- [ ] Google Search Console shows proper indexing
- [ ] Social media validators show correct previews
- [ ] CTR improves from social sharing

---

## Next Steps

1. Review this plan
2. Approve implementation approach
3. Execute phases in priority order
4. Test each phase before moving to next
5. Deploy and validate in production
