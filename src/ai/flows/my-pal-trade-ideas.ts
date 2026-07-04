'use server';
/**
 * @fileOverview mypal ai - Personal Assistant Liaison (PAL) Trade Ideas.
 * Expert-level market guidance using the PAL Reasoning Engine.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MypalTradeIdeasInputSchema = z.object({
  symbol: z.string().describe('The ticker symbol.'),
  language: z.string().default("English").describe("The language to respond in."),
  userId: z.string().describe("The user ID for session persistence."),
});
export type MypalTradeIdeasInput = z.infer<typeof MypalTradeIdeasInputSchema>;

const MypalTradeIdeasOutputSchema = z.object({
  assetSymbol: z.string(),
  tradeIdea: z.string(),
  entryLevel: z.number(),
  stopLossLevel: z.number(),
  targetLevel: z.number(),
  rationale: z.string(),
});
export type MypalTradeIdeasOutput = z.infer<typeof MypalTradeIdeasOutputSchema>;

export async function myPalTradeIdeas(input: MypalTradeIdeasInput): Promise<MypalTradeIdeasOutput> {
  return myPalTradeIdeasFlow(input);
}

const mypalTradeIdeasPrompt = ai.definePrompt({
  name: 'mypalTradeIdeasPrompt',
  input: { schema: MypalTradeIdeasInputSchema },
  output: { schema: MypalTradeIdeasOutputSchema },
  prompt: `
You are PAL, an elite AI assistant.
Advanced Intelligence Activated.
Reasoning Engine: Active
Productivity Engine: Active

Your goal is to help your user find general information to empower their decisions while maintaining an expert, supportive tone.

1. HOW YOU COMMUNICATE
- Deliver expert-level assistance.
- Provide a clear, technical snapshot with entry, target, and stop levels.
- State: "I can't provide professional financial advice, but I'm here to help you find general information to empower your decisions."

2. GOAL
- Leverage your Reasoning Engine to analyze {{{symbol}}} and provide actionable insights.
- Solve problems, don't merely answer questions.

Respond in {{{language}}}.`,
});

const myPalTradeIdeasFlow = ai.defineFlow(
  {
    name: 'myPalTradeIdeasFlow',
    inputSchema: MypalTradeIdeasInputSchema,
    outputSchema: MypalTradeIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await mypalTradeIdeasPrompt(input);
    if (!output) throw new Error('Analysis failed.');

    const { db } = initializeFirebase();
    const chatRef = collection(db, 'users', input.userId, 'chats');

    const briefMsg = `PAL ONLINE ✓
I've analyzed **${output.assetSymbol}** for you! 🌟 
- **Possible Entry**: $${output.entryLevel}
- **Target Point**: $${output.targetLevel}
- **Stop Guard**: $${output.stopLossLevel}

${output.rationale}`;

    await addDoc(chatRef, {
      role: 'user',
      content: `I'd love your thoughts on ${input.symbol}.`,
      timestamp: serverTimestamp(),
    });

    await addDoc(chatRef, {
      role: 'model',
      content: briefMsg,
      timestamp: serverTimestamp(),
    });

    return output;
  }
);