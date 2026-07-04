'use server';
/**
 * @fileOverview MarketSense flow for technical trade ideas and technical analysis snapshots.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketSenseTradeIdeasInputSchema = z.object({
  symbol: z.string().describe('The ticker symbol of the asset.'),
});
export type MarketSenseTradeIdeasInput = z.infer<typeof MarketSenseTradeIdeasInputSchema>;

const MarketSenseTradeIdeasOutputSchema = z.object({
  assetSymbol: z.string(),
  tradeIdea: z.string(),
  entryLevel: z.number(),
  stopLossLevel: z.number(),
  targetLevel: z.number(),
  rationale: z.string(),
  technicalSnapshot: z.object({
    rsi: z.number(),
    movingAverages: z.string(),
    support: z.number(),
    resistance: z.number(),
  }),
});
export type MarketSenseTradeIdeasOutput = z.infer<typeof MarketSenseTradeIdeasOutputSchema>;

export async function marketSenseTradeIdeas(input: MarketSenseTradeIdeasInput): Promise<MarketSenseTradeIdeasOutput> {
  return marketSenseTradeIdeasFlow(input);
}

const marketSenseTradeIdeasPrompt = ai.definePrompt({
  name: 'marketSenseTradeIdeasPrompt',
  input: { schema: MarketSenseTradeIdeasInputSchema },
  output: { schema: MarketSenseTradeIdeasOutputSchema },
  prompt: `You are MarketSense. Track and analyze technical trade ideas for {{{symbol}}} for the past 30 days.

Include:
1. Entry, Stop, and Target levels.
2. A technical snapshot: RSI (14), Moving Averages (10/50/200), and key Support/Resistance.
3. Rationale based on trend analysis.

Disclaimer: Consult with a licensed professional for investment decisions.`,
});

const marketSenseTradeIdeasFlow = ai.defineFlow(
  {
    name: 'marketSenseTradeIdeasFlow',
    inputSchema: MarketSenseTradeIdeasInputSchema,
    outputSchema: MarketSenseTradeIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await marketSenseTradeIdeasPrompt(input);
    if (!output) throw new Error('Analysis failed.');
    return output;
  }
);
