# PRD: Profile Settings Page Aesthetic Upgrade

**Project:** Daiily
**Feature:** Profile Settings Visual Polish
**Status:** In Progress
**Date:** November 22, 2025

---

## Overview

Upgrade the profile settings page visual design from plain/functional to aesthetically polished without changing functionality or structure. This is a pure visual enhancement that maintains the current 2-tab layout and form structure.

---

## Objectives

- Remove plain, generic design
- Improve visual hierarchy and typography
- Add visual elements (icons, better spacing, subtle effects)
- Maintain current functionality 100%
- Keep same tab/form structure

---

## Scope

### In Scope
- Page header redesign (cleaner, add avatar initials)
- Tab component styling (convert to pills style)
- Career section headers with icons
- Delete account section header rename (minor refinement)
- Better spacing and layout rhythm
- Final QA and polish

### Out of Scope
- Form structure changes
- Functionality changes
- Avatar upload
- Autosave
- New sections or tabs
- Sidebar navigation
- Input field overhaul (already well-designed)
- Button overhaul (already functional with good states)
- Feedback message redesign (already nicely styled)

---

## Design Changes

### 1. Page Header
- **Current:** Gradient banner with title + subtitle
- **New:** Cleaner header with user initials avatar, name, and simple description
- **Details:**
  - Avatar: Circular initials in primary color (e.g., "JD" for John Doe)
  - Typography: Use title-5 for heading, smaller subtitle
  - Spacing: More compact, less "banner" feeling
  - Background: Subtle background or no background, just spacing

### 2. Tab Navigation
- **Current:** Underline style tabs
- **New:** Pill style (rounded background on active tab)
- **Details:**
  - Rounded corners on active pill
  - Smooth background color transition on active tab
  - Better visual distinction between active/inactive
  - Improved spacing and typography
  - Profile-page-only styling (won't affect other page tabs)
  - Mobile: Pills stack/wrap if needed, maintain readability

### 3. Section Headers (Career Form Only)
- **Current:** Text with gradient background, underline
- **New:** Icon + text headers with subtle divider
- **Details:**
  - Add Lucide icons to Career form sections only:
    - "Career Information" section: `Briefcase` icon
    - "Skills & Goals" section: `Code` icon
  - Basic profile form: No section headers needed (single section)
  - Simple, single-line headers
  - Subtle bottom border as divider
  - Better spacing
  - NOTE: Lucide icons (`lucide-react`) must be in dependencies

### 4. Form Cards & Sections
- **Current:** One large card with all content
- **New:** Subtle section separation with visual grouping
- **Details:**
  - Light background for section groups (subtle, not stark)
  - Better padding and margins
  - Rounded corners (consistent with --radius: 6px)
  - Subtle border (--border color)

### 5. Delete Account Section Header
- **Current:** "Danger Zone" heading feels aggressive
- **New:** "Delete Account" heading, cleaner presentation
- **Details:**
  - Rename section header from "Danger Zone" to "Delete Account"
  - Keep existing styling (accent color, subtle background)
  - Already well-designed; minimal change needed
  - Keep existing warning text and functionality

### 6. Overall Spacing
- **Current:** Basic space-y-6 rhythm
- **New:** Refined spacing hierarchy
- **Details:**
  - Better breathing room between sections
  - Tighter spacing within related fields
  - Better use of whitespace

---

## Implementation Checklist

### Phase 1: Page Header Redesign
- [ ] Remove gradient banner styling
- [ ] Create avatar initials component (initials based on user name)
- [ ] Update header with avatar + name + subtitle
- [ ] Improve top section spacing
- [ ] Keep page-level gradient background

### Phase 2: Tab Styling
- [ ] Convert tabs to pill style (profile page only)
- [ ] Add rounded corners and background on active tab
- [ ] Improve active/hover state colors and transitions
- [ ] Test responsive behavior on mobile
- [ ] Verify no impact on other pages using Tabs component

### Phase 3: Career Section Icons
- [ ] Add Briefcase icon to "Career Information" header
- [ ] Add Code icon to "Skills & Goals" header
- [ ] Improve section header styling and spacing
- [ ] Verify icon imports from lucide-react

### Phase 4: Delete Account Header
- [ ] Rename "Danger Zone" to "Delete Account"
- [ ] Review existing styling (already well-designed)
- [ ] Finalize text and messaging

### Phase 5: Final Polish & QA
- [ ] Review overall spacing and rhythm
- [ ] Color/contrast verification across sections
- [ ] Responsive design check (mobile/tablet/desktop)
- [ ] Verify all form functionality preserved
- [ ] Cross-browser testing
- [ ] Accessibility review (focus states, contrast, icons)

---

## Technical Details

### Files to Modify
1. `app/profile/page.tsx` - Header restructure, tab styling (profile-only wrapper)
2. `features/profile/components/molecules/career-profile-form.tsx` - Add section icons
3. `features/profile/components/molecules/delete-account-section.tsx` - Rename header
4. Create `features/profile/components/atoms/avatar-initials.tsx` - New component
5. Optional: Create profile-specific tab styling wrapper if needed

### Files NOT Modified
- `components/atoms/tabs.tsx` - Will create profile-specific styling instead of modifying global component
- `features/profile/components/molecules/basic-profile-form.tsx` - Already well-styled

### Dependencies
- **Lucide Icons Required:** `lucide-react` must be in package.json
  - Icons needed: `Briefcase`, `Code`
  - Verify installation before implementation

### Design System
- Use existing CSS variables (--primary, --accent, --success, etc.)
- Follow current typography scale (title-5, text-regular, etc.)
- Use Lucide icons from `lucide-react` package
- Maintain dark-first theme
- Ensure 6px border-radius consistency

---

## Success Criteria

✅ Visual design significantly improved
✅ All functionality preserved
✅ Responsive on mobile/tablet/desktop
✅ Good contrast and accessibility
✅ Consistent with Daiily design system
✅ No breaking changes to form behavior

---

## Estimated Effort

**Total:** 1-1.5 hours (revised from 2-3 hours after review)
- Phase 1: 30 min (header + avatar component)
- Phase 2: 15 min (tab styling with profile-specific wrapper)
- Phase 3: 15 min (add icons to career section)
- Phase 4: 5 min (rename delete header)
- Phase 5: 15-20 min (QA, spacing review, responsive check)

---

## Review Notes & Key Findings

This PRD was reviewed and revised based on code analysis. Key findings:

1. **Input/Button Styling Already Good:** Input and textarea components already have excellent focus states, error handling, and disabled states. No overhaul needed.

2. **Feedback Messages Already Polished:** Success/error messages already use semantic colors (`bg-success/10`, `bg-accent/10`) with subtle borders. Already well-designed.

3. **Delete Section Already Soft:** Uses accent color (pink/purple), not aggressive red. Already has subtle background (`bg-accent/5`). Only header rename needed.

4. **Tab Styling Decision:** Will use profile-page-only pill styling to avoid affecting global Tabs component used elsewhere in the app.

5. **Career Form Only:** Section icons only needed in Career form (has 2 subsections). Basic profile form has no subsections.

6. **Lucide Icons Dependency:** Must verify `lucide-react` is installed. Icons needed: `Briefcase`, `Code`.

See implementation checklist for detailed tasks.

---

## Notes

- Keep all existing functionality 100%
- No structural changes to forms or tabs
- Focus on aesthetic polish and visual improvements
- Use existing design tokens from globals.css
- Maintain dark theme as default
- Profile-page-only styling for tabs (no impact on other pages)
