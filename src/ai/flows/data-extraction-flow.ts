
'use server';
/**
 * @fileOverview Universal Multilingual Data Extraction AI.
 * Extracts Name, Email, Phone, Language Code, and English-translated Intent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const DataExtractionInputSchema = z.object({
  text: z.string().describe("The text to analyze and extract information from. Can be in any language."),
  userId: z.string().optional().describe("The ID of the user for session persistence."),
});
export type DataExtractionInput = z.infer<typeof DataExtractionInputSchema>;

const DataExtractionOutputSchema = z.object({
  name: z.string().nullable().describe("The extracted full name."),
  email: z.string().email().nullable().describe("The extracted email address."),
  phone: z.string().nullable().describe("The extracted phone number."),
  language: z.string().nullable().describe("The ISO 639-1 code of the detected language (e.g., 'en', 'zh', 'es')."),
  intent_english: z.string().nullable().describe("The user's intent translated into English."),
});
export type DataExtractionOutput = z.infer<typeof DataExtractionOutputSchema>;

export async function extractData(input: DataExtractionInput): Promise<DataExtractionOutput> {
  return dataExtractionFlow(input);
}

const dataExtractionFlow = ai.defineFlow(
  {
    name: 'dataExtractionFlow',
    inputSchema: DataExtractionInputSchema,
    outputSchema: DataExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are a universal data extraction AI. You understand ALL global languages.
      
      Task: Analyze the text and extract specific structured attributes.
      
      Extraction Protocol:
      1. "name": Full name of the individual.
      2. "email": Email address.
      3. "phone": Phone number.
      4. "language": ISO 639-1 code of the detected language.
      5. "intent_english": Translate the user's primary intent/objective into clear English.
      
      Constraints:
      - If a field is missing, set it to null.
      - Return STRICTLY as a JSON object matching the schema.
      
      Text to analyze: "${input.text}"`,
      output: { schema: DataExtractionOutputSchema }
    });

    if (!output) throw new Error('Global extraction failed.');

    // Persist to Firestore (Non-blocking client-side pattern)
    const { db } = initializeFirebase();
    const dataRef = collection(db, 'global_extractions');
    const docData = {
      ...output,
      userId: input.userId || 'anonymous',
      originalText: input.text,
      timestamp: serverTimestamp(),
    };

    addDoc(dataRef, docData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: dataRef.path,
          operation: 'create',
          requestResourceData: docData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    return output;
  }
);
