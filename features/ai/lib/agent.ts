import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// SINGLE SOURCE OF TRUTH: AI Model Configuration
// Change this one constant to update all AI features across the app
const AI_MODEL = "gpt-4o-mini" as const;

// Goal and Career Manager Agent
const agent = {
  name: "Goal and Career Manager",
  instructions: "You coach user's career and goals professionally.",
  model: AI_MODEL,
};

export { openai, agent };
