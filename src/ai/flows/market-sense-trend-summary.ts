
'use server';
/**
 * @fileOverview MarketSense flow for comprehensive market trend analysis and metric tables.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketSenseTrendSummaryInputSchema = z.object({
  query: z.string().describe("The asset or sector to analyze."),
  timeframe: z.string().default("30 days"),
  region: z.string().default("global"),
  language: z.string().default("English").describe("The language to respond in."),
});
export type MarketSenseTrendSummaryInput = z.infer<typeof MarketSenseTrendSummaryInputSchema>;

const MarketSenseTrendSummaryOutputSchema = z.object({
  executiveSummary: z.string(),
  keyDrivers: z.array(z.string()),
  metricsTable: z.object({
    currentPrice: z.string(),
    absChange: z.string(),
    percentChange: z.string(),
    avgVolume: z.string(),
    volatility: z.string(),
    benchmarkCorrelation: z.string(),
  }),
  technicalSnapshot: z.object({
    movingAverages: z.string(),
    rsi: z.number(),
    support: z.string(),
    resistance: z.string(),
  }),
  macroSignals: z.array(z.string()).optional(),
  recommendations: z.array(z.object({
    horizon: z.string(),
    action: z.string(),
    risk: z.string(),
    confidence: z.enum(['High', 'Medium', 'Low']),
  })),
  pythonScript: z.string().optional().describe("A yfinance script to reproduce the metrics locally."),
  confidenceLevel: z.enum(['High', 'Medium', 'Low']),
  uncertaintyNotes: z.string().optional(),
});
export type MarketSenseTrendSummaryOutput = z.infer<typeof MarketSenseTrendSummaryOutputSchema>;

export async function marketSenseTrendSummary(input: MarketSenseTrendSummaryInput): Promise<MarketSenseTrendSummaryOutput> {
  return marketSenseTrendSummaryFlow(input);
}

const marketSenseTrendSummaryPrompt = ai.definePrompt({
  name: 'marketSenseTrendSummaryPrompt',
  input: { schema: MarketSenseTrendSummaryInputSchema },
  output: { schema: MarketSenseTrendSummaryOutputSchema },
  prompt: `You are MarketSense, an AI assistant that tracks, analyzes, and summarizes global and sector-specific market trends in real time. Prioritize accuracy, relevance, and actionable insight.

LANGUAGE PROTOCOL:
All text-based fields in the output must be in {{{language}}}. Use professional financial terminology, formatting, and cultural nuances appropriate for native speakers of {{{language}}}.

Track and analyze market trends for "{{{query}}}" for the past {{{timeframe}}} in the {{{region}}} region.

Structure your analysis as follows:
1. Executive Summary: 2–4 sentences summarizing current standing.
2. Key Drivers: 3-6 bullet points of main market movers.
3. Metrics Table: Include Price, Absolute Change, Percent Change, Volume, Volatility, and Correlation (vs S&P 500 or appropriate benchmark).
4. Technical Snapshot: Moving Averages (10/50/200), RSI (14), and key Support/Resistance levels.
5. Fundamental/Macro Signals: Any indicators affecting the asset.
6. Three Actionable Recommendations: Short, Medium, and Long term horizons with risk levels and confidence.
7. Reproducible Data Script: A Python script using 'yfinance' to fetch these metrics locally.

Disclaimer: Consult with a licensed professional for investment decisions.`,
});

const marketSenseTrendSummaryFlow = ai.defineFlow(
  {
    name: 'marketSenseTrendSummaryFlow',
    inputSchema: MarketSenseTrendSummaryInputSchema,
    outputSchema: MarketSenseTrendSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await marketSenseTrendSummaryPrompt(input);
    if (!output) throw new Error('Analysis failed.');
    return output;
  }
);
