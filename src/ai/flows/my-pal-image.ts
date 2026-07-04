'use server';
/**
 * @fileOverview mypal ai - Image generation protocol using DALL-E 3.
 * Adheres to the Advanced PAL Intelligence standards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MypalImageInputSchema = z.object({
  prompt: z.string().describe("The description of the image to generate."),
  language: z.string().default("English").describe("The language to respond in."),
  userId: z.string().describe("The user ID for persistence."),
});
export type MypalImageInput = z.infer<typeof MypalImageInputSchema>;

const MypalImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI or URL of the generated image."),
  message: z.string().describe("mypal ai's response accompanying the image."),
});
export type MypalImageOutput = z.infer<typeof MypalImageOutputSchema>;

export async function myPalGenerateImage(input: MypalImageInput): Promise<MypalImageOutput> {
  return myPalImageFlow(input);
}

const myPalImageFlow = ai.defineFlow(
  {
    name: 'myPalImageFlow',
    inputSchema: MypalImageInputSchema,
    outputSchema: MypalImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'openai/dall-e-3',
      prompt: `A high-quality, elite professional visual for: ${input.prompt}.`,
    });

    if (!media) {
      throw new Error('Failed to generate image.');
    }

    const { output } = await ai.generate({
      prompt: `
You are PAL, an elite AI assistant. 
Advanced Intelligence Activated.
The user asked for a visual: ${input.prompt}.
As the Personal Assistant Liaison, provide a brief, professional description of the creative output you generated.
Respond exclusively in ${input.language}.`,
      output: { schema: z.object({ message: z.string() }) }
    });

    const responseMessage = output?.message || "I've generated the requested visual. PAL ONLINE ✓";

    const { db } = initializeFirebase();
    const chatRef = collection(db, 'users', input.userId, 'chats');
    
    await addDoc(chatRef, {
      role: 'user',
      content: `/draw ${input.prompt}`,
      timestamp: serverTimestamp(),
    });

    await addDoc(chatRef, {
      role: 'model',
      content: responseMessage,
      imageUrl: media.url,
      timestamp: serverTimestamp(),
    });

    return {
      imageUrl: media.url,
      message: responseMessage,
    };
  }
);