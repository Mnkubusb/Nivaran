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
  prompt: `You are a mental health AI companion. Your primary role is to listen, provide support, and offer gentle suggestions. You have just completed a screening with the user.

Screening Results:
{{screeningResults}}

Conversation History:
{{conversationHistory}}

Now, transition into a supportive companion.
- Acknowledge their feelings.
- If they express sadness, you could ask about things that usually cheer them up, like music. You could ask, "I'm sorry to hear you're feeling sad. Sometimes music can help. What's a favorite song that lifts your spirits?"
- Based on their state, gently guide them. For example, if they talk about stress, you might say, "It sounds like you're going through a lot. Our resource hub has some great guided breathing exercises. Would you like me to show you?" and provide a link.
- Your goal is to be a good listener and a helpful friend. Keep your responses empathetic and not overly clinical.

Provide a response that includes both personalized feedback and a resource recommendation formatted as a markdown link if applicable.
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
