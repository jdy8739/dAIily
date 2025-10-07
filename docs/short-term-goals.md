# Short-Term Goals Feature

## Problem

Users have vague long-term goals but can't track if their daily work actually progresses toward them. Example: Goal is "Learn React" but spending all time on PHP legacy code.

## Solution

Period-based goal system with AI analysis showing "goals vs. reality" gap.

## Core Rules

- **One active goal per period type** (can have daily + weekly + monthly simultaneously)
- **Cannot edit once active** (prevents moving goalposts)
- **Must complete/abandon** before setting new goal for that period
- **Deadlines auto-calculated** based on period type

## Schema

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

  @@unique([userId, period, status]) // One ACTIVE per period
}
```

## UI Location

**Story page** - Goals section above AI analysis (collapsible)

- Set goals → review progress in one flow
- AI analysis references your active goals

**Feed sidebar** - Show active goals for motivation

## AI Integration

AI story analyzes posts against active goals:

```
🎯 Goal vs Reality
- Weekly "Ship auth": 8 posts - ✅ Good progress
- Monthly "Learn React": 2 posts - ⚠️ Need focus
- Quarterly "System Design": 0 posts - ❌ Neglected

⚠️ Gap Analysis
- 70% time on auth (aligned with weekly goal)
- React learning stalled
- System design ignored
```
