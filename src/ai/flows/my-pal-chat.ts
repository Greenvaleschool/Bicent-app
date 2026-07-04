'use server';
/**
 * @fileOverview mypal ai - Personal Assistant Liaison (PAL).
 * Elite AI assistant built for advanced intelligence, productivity, and support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { marketSenseTrendSummary } from './market-sense-trend-summary';
import { marketSenseTradeIdeas } from './market-sense-trade-ideas';

const MypalChatInputSchema = z.object({
  message: z.string().describe("The user's message to mypal ai."),
  language: z.string().default("English").describe("The language to respond in."),
  userId: z.string().describe("The ID of the user for session persistence."),
});
export type MypalChatInput = z.infer<typeof MypalChatInputSchema>;

const MypalChatOutputSchema = z.object({
  response: z.string().describe("mypal ai's response."),
});
export type MypalChatOutput = z.infer<typeof MypalChatOutputSchema>;

/**
 * Tool to fetch market trends for PAL.
 */
const getMarketTrendsTool = ai.defineTool(
  {
    name: 'getMarketTrends',
    description: 'Retrieves comprehensive market trend analysis for an asset or sector.',
    inputSchema: z.object({
      query: z.string().describe('The asset or sector to analyze.'),
      timeframe: z.string().optional().describe('The timeframe for analysis (e.g., "30 days").'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    return await marketSenseTrendSummary({ 
      query: input.query, 
      timeframe: input.timeframe || '30 days',
      language: 'English' 
    });
  }
);

/**
 * Tool to fetch trade ideas for PAL.
 */
const getTradeIdeasTool = ai.defineTool(
  {
    name: 'getTradeIdeas',
    description: 'Retrieves technical trade ideas for a specific ticker symbol.',
    inputSchema: z.object({
      symbol: z.string().describe('The ticker symbol (e.g., "BTC", "AAPL").'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    return await marketSenseTradeIdeas({ symbol: input.symbol });
  }
);

/**
 * Tool to manage tasks for PAL.
 */
const manageTaskTool = ai.defineTool(
  {
    name: 'manageTask',
    description: 'Creates or updates a task for the user in the productivity system.',
    inputSchema: z.object({
      userId: z.string(),
      title: z.string().describe('The task title.'),
      description: z.string().optional().describe('A detailed description of the task.'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      dueAt: z.string().optional().describe('Optional ISO date string for the due date.'),
    }),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    const { db } = initializeFirebase();
    const taskRef = collection(db, 'users', input.userId, 'tasks');
    await addDoc(taskRef, {
      title: input.title,
      description: input.description || '',
      priority: input.priority,
      status: 'pending',
      dueAt: input.dueAt || null,
      createdAt: new Date().toISOString(),
    });
    return { success: true, message: `Task "${input.title}" added to your registry.` };
  }
);

export async function myPalChat(input: MypalChatInput): Promise<MypalChatOutput> {
  return myPalChatFlow(input);
}

const mypalChatPrompt = ai.definePrompt({
  name: 'mypalChatPrompt',
  tools: [getMarketTrendsTool, getTradeIdeasTool, manageTaskTool],
  input: { 
    schema: MypalChatInputSchema.extend({
      history: z.array(z.object({
        role: z.string(),
        content: z.string(),
      })).optional(),
    }) 
  },
  output: { schema: MypalChatOutputSchema },
  prompt: `
# =========================
# PAL AI - ADVANCED SYSTEM PROMPT
# =========================

ROLE:
You are PAL, an elite AI assistant built to provide intelligent, accurate, creative, and actionable assistance across all domains.

MISSION:
Deliver the highest-quality response possible while prioritizing accuracy, usefulness, clarity, and user satisfaction.

CORE PRINCIPLES:
- Understand user intent before responding.
- Think deeply and logically before generating answers.
- Provide complete solutions whenever possible.
- Ask clarifying questions when necessary.
- Be concise when the answer is simple.
- Be detailed when complexity requires it.
- Adapt your communication style to the user.
- Maintain context throughout the conversation.
- Never fabricate facts.
- Explicitly acknowledge uncertainty when information is incomplete.

REASONING ENGINE:
For every request:
1. Analyze the objective.
2. Identify requirements and constraints.
3. Generate multiple solution paths internally.
4. Select the strongest solution.
5. Verify logical consistency.
6. Present a clear final answer.

INTELLIGENCE MODE:
- Detect hidden user goals.
- Anticipate follow-up questions.
- Offer improvements beyond what was requested.
- Suggest better alternatives when appropriate.
- Optimize answers for real-world usefulness.

CREATIVITY MODE:
- Generate original ideas.
- Improve weak concepts automatically.
- Provide multiple high-quality options.
- Enhance writing, design, business, and content creation tasks.

CODING MODE:
- Produce production-ready code.
- Follow modern best practices.
- Prioritize security, efficiency, and maintainability.
- Detect bugs before output.
- Explain implementation when helpful.
- Optimize algorithms when possible.

LEARNING MODE:
- Explain concepts clearly.
- Use examples and analogies.
- Break difficult topics into understandable steps.
- Adjust explanations to the user's knowledge level.

PRODUCTIVITY MODE:
- Create plans and strategies.
- Organize tasks effectively.
- Prioritize important actions.
- Help users achieve goals efficiently.

QUALITY CONTROL:
Before every response:
- Check factual accuracy.
- Improve clarity.
- Remove unnecessary content.
- Ensure the answer directly solves the user's problem.
- Verify completeness.

RESPONSE FORMAT:
When possible:
1. Direct Answer
2. Explanation
3. Action Steps
4. Additional Recommendations

ADVANCED DIRECTIVES:
- Be proactive, not reactive.
- Deliver expert-level assistance.
- Maximize usefulness in every interaction.
- Continuously improve response quality.
- Focus on solving problems, not merely answering questions.
- Provide innovative insights when valuable.

ACTIVATION MESSAGE:
"PAL ONLINE ✓
Advanced Intelligence Activated.
Reasoning Engine: Active
Creativity Engine: Active
Coding Engine: Active
Learning Engine: Active
Productivity Engine: Active

Ready to assist."

LANGUAGE: Respond exclusively in {{{language}}}.

HISTORY:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}

User Message: "{{{message}}}"`,
});

const myPalChatFlow = ai.defineFlow(
  {
    name: 'myPalChatFlow',
    inputSchema: MypalChatInputSchema,
    outputSchema: MypalChatOutputSchema,
  },
  async (input) => {
    const { db } = initializeFirebase();
    
    const chatRef = collection(db, 'users', input.userId, 'chats');
    const historyQuery = query(chatRef, orderBy('timestamp', 'desc'), limit(15));
    const historySnap = await getDocs(historyQuery);
    
    const history = historySnap.docs.reverse().map(doc => ({
      role: doc.data().role === 'user' ? 'user' : 'model',
      content: doc.data().content as string,
    }));

    // Record user message
    await addDoc(chatRef, {
      role: 'user',
      content: input.message,
      timestamp: serverTimestamp(),
    });

    // Generate AI response with tools
    const { output } = await mypalChatPrompt({
      ...input,
      history,
    });

    if (!output) throw new Error('AI failed to generate response.');

    // Record model response
    await addDoc(chatRef, {
      role: 'model',
      content: output.response,
      timestamp: serverTimestamp(),
    });

    return output;
  }
);
