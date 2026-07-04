
'use server';
/**
 * @fileOverview A Genkit flow for generating market visualizations with MarketSense using DALL-E 3.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketSenseImageInputSchema = z.object({
  prompt: z.string().describe("The description of the image to generate."),
});
export type MarketSenseImageInput = z.infer<typeof MarketSenseImageInputSchema>;

const MarketSenseImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI or URL of the generated image."),
});
export type MarketSenseImageOutput = z.infer<typeof MarketSenseImageOutputSchema>;

export async function marketSenseGenerateImage(input: MarketSenseImageInput): Promise<MarketSenseImageOutput> {
  return marketSenseImageFlow(input);
}

const marketSenseImageFlow = ai.defineFlow(
  {
    name: 'marketSenseImageFlow',
    inputSchema: MarketSenseImageInputSchema,
    outputSchema: MarketSenseImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'openai/dall-e-3',
      prompt: input.prompt,
    });

    if (!media) {
      throw new Error('Failed to generate image.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
