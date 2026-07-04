'use server';
/**
 * @fileOverview mypal ai - Personal Assistant Liaison (PAL) Trend Summary.
 * Optimized for real-world usefulness and expert-level analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MypalTrendSummaryInputSchema = z.object({
  query: z.string().describe("The asset or sector."),
  userId: z.string().describe("The user ID for session persistence."),
  language: z.string().default("English").describe("The language to respond in."),
});
export type MypalTrendSummaryInput = z.infer<typeof MypalTrendSummaryInputSchema>;

const MypalTrendSummaryOutputSchema = z.object({
  summary: z.string(),
  keySteps: z.array(z.string()),
});
export type MypalTrendSummaryOutput = z.infer<typeof MypalTrendSummaryOutputSchema>;

export async function myPalTrendSummary(input: MypalTrendSummaryInput): Promise<MypalTrendSummaryOutput> {
  return myPalTrendSummaryFlow(input);
}

const myPalTrendSummaryPrompt = ai.definePrompt({
  name: 'myPalTrendSummaryPrompt',
  input: { schema: MypalTrendSummaryInputSchema },
  output: { schema: MypalTrendSummaryOutputSchema },
  prompt: `
You are PAL, an elite AI assistant.
Advanced Intelligence Activated.
Reasoning Engine: Active
Productivity Engine: Active

Analyze trends for "{{{query}}}".

MISSION:
Deliver the highest-quality analysis while prioritizing accuracy, usefulness, and clarity.
Provide a professional summary and a clear, actionable list of steps for the user to achieve their goals effectively.

Respond exclusively in {{{language}}}.`,
});

const myPalTrendSummaryFlow = ai.defineFlow(
  {
    name: 'myPalTrendSummaryFlow',
    inputSchema: MypalTrendSummaryInputSchema,
    outputSchema: MypalTrendSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await myPalTrendSummaryPrompt(input);
    if (!output) throw new Error('Trend summary failed.');

    const { db } = initializeFirebase();
    const chatRef = collection(db, 'users', input.userId, 'chats');

    const fullResponse = `PAL ONLINE ✓
Trend summary for **${input.query}**:
${output.summary}

**Actionable Steps**:
${output.keySteps.map((s) => `- ${s}`).join('\n')}`;

    await addDoc(chatRef, {
      role: 'user',
      content: `What's the trend for ${input.query}?`,
      timestamp: serverTimestamp(),
    });

    await addDoc(chatRef, {
      role: 'model',
      content: fullResponse,
      timestamp: serverTimestamp(),
    });

    return output;
  }
);