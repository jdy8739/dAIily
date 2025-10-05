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

## 🎯 Goal Management

### Goal Progress Tracking

- Map user activities against long-term goals (e.g., React mastery, English study)

### AI Feedback

- Provide simple advice like "You're progressing well in A, but B needs more focus"

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
