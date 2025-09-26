'use server';

/**
 * @fileOverview Provides personalized feedback and resource recommendations based on screening results and conversation history.
 *
 * - getPersonalizedFeedback - A function that generates personalized feedback and resource recommendations.
 * - PersonalizedFeedbackInput - The input type for the getPersonalizedFeedback function.
 * - PersonalizedFeedbackOutput - The return type for the getPersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFeedbackInputSchema = z.object({
  screeningResults: z
    .string()
    .describe('The results from the user screening, including the score and risk level.'),
  conversationHistory: z
    .string()
    .describe('The conversation history between the user and the chatbot.'),
});
export type PersonalizedFeedbackInput = z.infer<typeof PersonalizedFeedbackInputSchema>;

const PersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback based on the screening results and conversation history.'),
  resourceRecommendations: z
    .string()
    .describe('Recommended resources tailored to the user based on their screening results and conversation history.'),
});
export type PersonalizedFeedbackOutput = z.infer<typeof PersonalizedFeedbackOutputSchema>;

export async function getPersonalizedFeedback(
  input: PersonalizedFeedbackInput
): Promise<PersonalizedFeedbackOutput> {
  return personalizedFeedbackFlow(input);
}

const personalizedFeedbackPrompt = ai.definePrompt({
  name: 'personalizedFeedbackPrompt',
  input: {schema: PersonalizedFeedbackInputSchema},
  output: {schema: PersonalizedFeedbackOutputSchema},
  prompt: `You are a mental health assistant providing personalized feedback and resource recommendations.

  Based on the user's screening results:
  {{screeningResults}}

  And the conversation history:
  {{conversationHistory}}

  Provide personalized feedback and recommend relevant resources.
  Ensure the feedback is supportive and actionable.
  Format the output into two parts. The first part is the feedback, and the second part is resource recommendations.
  `,
});

const personalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedFeedbackFlow',
    inputSchema: PersonalizedFeedbackInputSchema,
    outputSchema: PersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await personalizedFeedbackPrompt(input);
    return output!;
  }
);
