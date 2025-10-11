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
- Mark goals as COMPLETED or ABANDONED
- REACTIVATE completed goals back to ACTIVE status
- Goals remain in system for historical tracking

**Auto-Calculated Deadlines:**
- DAILY: Today at 23:59:59
- WEEKLY: End of current week (Sunday)
- MONTHLY: Last day of current month
- QUARTERLY: Last day of current quarter
- YEARLY: December 31st

### UI Locations

**Story Page** - Goals section above AI analysis (collapsible)
- Set goals → review progress in one flow
- AI analysis references your goals in context

**Feed Sidebar** - Show active goals for motivation
- Always visible while browsing feed
- Quick motivation and progress awareness

### ⚠️ Important Concept: Story Period vs Goal Period

**Story Period** (daily, weekly, monthly, yearly):
- Determines **which posts** are analyzed (e.g., "daily" = past 24 hours of posts)
- Does **NOT** filter which goals are checked

**Goal Period** (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY):
- Defines the goal's deadline/duration
- All active and completed goals are checked regardless of story period

**Example:**
- User generates "Past 24 Hours" review (daily story)
- AI analyzes: Posts from past 24 hours
- AI checks: **ALL goals** (daily, weekly, monthly, quarterly, yearly)
- AI evaluates: "Did today's activities contribute to ANY of your goals?"

**Rationale:**
- A single day's work can contribute to multiple goals with different time horizons
- Progress on a monthly goal should be recognized even in daily reviews
- Users should see holistic progress tracking, not siloed by period

### AI Integration & Analysis

AI story analyzes posts against all goals with clear status indicators:

```
🎯 Goal vs Reality
- [ACTIVE] Weekly "Ship auth system": 8 posts - ✅ Strong progress
- [COMPLETED] Daily "Review PRs": Finished! ✨
- [ACTIVE] Monthly "Learn React hooks": 2 posts - ⚠️ Needs focus
- [ACTIVE] Quarterly "System design study": 0 posts - ❌ Neglected

🏆 Achievements
- Completed daily PR review goal on time
- Strong momentum on weekly shipping goal

⚠️ Gap Analysis
- 70% time on auth system (aligned with weekly goal)
- React learning stalled - schedule dedicated sessions
- System design completely ignored - carve out time
```

### Goal Schema

```typescript
model Goal {
  id          String      @id @default(cuid())
  userId      String
  title       String
  period      GoalPeriod  // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
  startDate   DateTime    @default(now())
  deadline    DateTime
  status      GoalStatus  // ACTIVE, COMPLETED, ABANDONED
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
