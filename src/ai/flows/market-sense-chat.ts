
'use server';
/**
 * @fileOverview A Genkit flow for general conversation with "MarketSense" AI assistant.
 * Adheres to the Global Localization Protocol.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketSenseChatInputSchema = z.object({
  message: z.string().describe("The user's message to the AI."),
  language: z.string().default("English").describe("The language to respond in."),
});
export type MarketSenseChatInput = z.infer<typeof MarketSenseChatInputSchema>;

const MarketSenseChatOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user's message."),
});
export type MarketSenseChatOutput = z.infer<typeof MarketSenseChatOutputSchema>;

export async function marketSenseChat(input: MarketSenseChatInput): Promise<MarketSenseChatOutput> {
  return marketSenseChatFlow(input);
}

const marketSenseChatPrompt = ai.definePrompt({
  name: 'marketSenseChatPrompt',
  input: { schema: MarketSenseChatInputSchema },
  output: { schema: MarketSenseChatOutputSchema },
  prompt: `You are MarketSense Expert Mode, a financial analysis engine configured with Gemini-level intelligence. 

Prioritize accuracy, clarity, and actionable insights.

LANGUAGE PROTOCOL:
Respond exclusively in {{{language}}}. Adapt your writing style, formality, humor, and cultural nuances to match native speakers of {{{language}}}. Use proper grammar, idioms, and formatting for that language. If requested to perform analysis, ensure the resulting summary and steps are perfectly localized.

Response Protocol:
1. Executive Summary: One sentence distilling the core answer.
2. Prioritized Plan: 3-5 steps for analysis or execution.
3. Execution Details: Code, formulas, or data points for step 1.
4. Confidence Level: High/Medium/Low.
5. Disclaimer: "Consult with a licensed professional for investment decisions."

User Query: "{{{message}}}"`,
});

const marketSenseChatFlow = ai.defineFlow(
  {
    name: 'marketSenseChatFlow',
    inputSchema: MarketSenseChatInputSchema,
    outputSchema: MarketSenseChatOutputSchema,
  },
  async (input) => {
    const { output } = await marketSenseChatPrompt(input);
    return output!;
  }
);
