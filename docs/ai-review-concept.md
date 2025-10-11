Career Management Web App – Feature Plan

## Technical Stack Decisions

- **AI Provider**: OpenAI API (direct calls for summarization and analysis)
- **AI Model**: GPT-4o-mini
- **No RAG/LangSmith/Chatbot**: Keeping it simple for now
- **Future Expansion**: Can add RAG, LangSmith, or chatbot features if necessary

## MVP Scope

- **AI-Assisted Proofreading**: Correct and refine user entries
- **Summary Generation**: Summarize records retrieved from database
- **Visualization**: Visual representation of retrieved records

## 📝 Core Features (Diary Flow)

### Daily Record Submission

- Users log what they did each day
- AI automatically summarizes and refines the entry upon submission

### User Overview Page

- AI generates an overview of all past entries
- Analyzes goals, strengths, and areas for improvement

### Time-Period Summary

- Users can select a period (week, month, custom range)
- AI provides a summary of entries within that period

---

## 🔍 Analysis & Insights

### Trend Analysis

- Highlight changes in focus over time (e.g., more collaboration tasks, fewer study notes)

### Keyword Cloud

- Visualize frequently mentioned keywords to show areas of focus

---

## 🎯 Goal Management (Period-Based System)

### Problem & Solution

**Problem:** Users have vague long-term goals but can't track if their daily work actually progresses toward them. Example: Goal is "Learn React" but spending all time on PHP legacy code.

**Solution:** Period-based goal system with AI analysis showing "goals vs. reality" gap.

### Core Features

**Multiple Goals Per Period:**

- Users can set multiple daily/weekly/monthly/quarterly/yearly goals simultaneously
- No artificial limits - track as many goals as needed

**Flexible Management:**

- Edit goal titles while they're active
- Mark goals as COMPLETED when achieved
- REACTIVATE completed goals back to ACTIVE status
- Delete goals permanently with confirmation

**Auto-Calculated Deadlines:**

- DAILY: Today at 23:59:59
- WEEKLY: End of current week (Sunday)
- MONTHLY: Last day of current month
- QUARTERLY: Last day of current quarter
- YEARLY: December 31st

### UI Location

**Story Page** - Goals section above AI analysis (collapsible)

- Set goals → review progress in one flow
- AI analysis references your goals in context

### ⚠️ Important Concept: Story Period vs Goal Period

**Story Period** (daily, weekly, monthly, yearly):

- Determines **which posts** are analyzed (e.g., "daily" = past 24 hours of posts)
- Does **NOT** filter which goals are checked

**Goal Period** (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY):

- Defines the goal's deadline/duration
- Only active goals are checked regardless of story period (completed goals are not analyzed)

**Example:**

- User generates "Past 24 Hours" review (daily story)
- AI analyzes: Posts from past 24 hours
- AI checks: **ALL ACTIVE goals** (daily, weekly, monthly, quarterly, yearly)
- AI evaluates: "Did today's activities contribute to ANY of your active goals?"

**Rationale:**

- A single day's work can contribute to multiple active goals with different time horizons
- Progress on a monthly goal should be recognized even in daily reviews
- Users should see holistic progress tracking, not siloed by period
- Completed goals are not analyzed to reduce context volume and keep focus on current objectives

### AI Integration & Analysis

AI story analyzes posts against active goals only:

```
🎯 Goal vs Reality
- Weekly "Ship auth system": 8 posts - ✅ Strong progress
- Monthly "Learn React hooks": 2 posts - ⚠️ Needs focus
- Quarterly "System design study": 0 posts - ❌ Neglected

🏆 Key Achievements
- Shipped authentication flow
- Completed 3 code reviews

⚠️ Gap Analysis
- 70% time on auth system (aligned with weekly goal)
- React learning stalled - schedule dedicated sessions
- System design completely ignored - carve out time

💡 Next Actions
- Block 2h daily for React study
- Start with system design fundamentals
```

### Story Caching & Freshness

**Default Behavior:**

- When visiting story page without query parameter → Automatically fetch 'all' period story
- Applies to both owner view (StoryGenerator) and visitor view (UserStoryViewer)
- Ensures users always see content immediately without manual period selection

**User Flow:**

1. User clicks period button → Check for cached story
2. If cached story exists → Load immediately and check if outdated
3. If no cached story → Show "Generate Story?" confirmation prompt
4. User clicks "Generate Story" → Actually generate with AI

**Outdated Story Detection:**

Stories are marked as outdated when they're older than the period they represent:

| Period                | Outdated After | Warning Shown |
| --------------------- | -------------- | ------------- |
| Past 24 Hours (daily) | > 1 day old    | ✅ Yes        |
| Past Week (weekly)    | > 7 days old   | ✅ Yes        |
| Past Month (monthly)  | > 30 days old  | ✅ Yes        |
| Past Year (yearly)    | > 365 days old | ✅ Yes        |
| Entire Journey (all)  | Never outdated | ❌ No         |

**Rationale:**

- Outdated stories still shown (not hidden) with small warning text
- Users can click "Regenerate" to get fresh analysis
- "Entire Journey" never marked outdated (too expensive to regenerate frequently)
- Warning: "⚠️ This story is outdated. Recent posts and goals aren't included."

### Goal Schema

```typescript
model Goal {
  id          String      @id @default(cuid())
  userId      String
  title       String
  period      GoalPeriod  // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
  startDate   DateTime    @default(now())
  deadline    DateTime
  status      GoalStatus  // ACTIVE, COMPLETED
  completedAt DateTime?

  // No unique constraint - multiple goals per period allowed
}
```

---

## 🗂️ Organization & Utilization

### Auto Tagging

- AI adds tags to entries automatically (e.g., #development, #study, #meeting)

### Portfolio Mode

- Export selected periods/projects into PDF/Markdown for reviews, resumes, or portfolios

---

## 📊 Visualization

### Calendar View

- Show which days have entries vs. gaps

### Weekly/Monthly Charts

- Display activity volume and keyword/tag distribution

---

## ✨ Future Features (Optional)

### Weekly/Monthly Highlights

- AI picks the most impactful activity of the week/month

### Reminders & Patterns

- Notify users of recurring issues or repeated themes

### Coaching Dialogue

- Conversational Q&A based on past records (e.g., "Am I on track with my English study goal?")
- **Note**: Requires chatbot expansion (see Technical Stack Decisions)

### Style Transformation

- Convert records into different tones/styles (resume-ready, blog-post style, etc.)
