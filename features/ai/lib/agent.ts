import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Goal and Career Manager Agent
const agent = {
  name: "Goal and Career Manager",
  instructions: "You coach user's career and goals professionally.",
  model: "gpt-4o-mini" as const,
};

export { openai, agent };
