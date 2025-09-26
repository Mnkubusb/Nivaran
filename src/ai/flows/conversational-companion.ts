'use server';

/**
 * @fileOverview A conversational AI companion that provides empathetic and supportive responses.
 *
 * - conversationalCompanion - A function that handles open-ended conversation.
 * - ConversationalCompanionInput - The input type for the conversationalCompanion function.
 * - ConversationalCompanionOutput - The return type for the conversationalCompanion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationalCompanionInputSchema = z.object({
  message: z.string().describe('The user’s message.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The conversation history so far.')
});
export type ConversationalCompanionInput = z.infer<typeof ConversationalCompanionInputSchema>;

const ConversationalCompanionOutputSchema = z.object({
  response: z.string().describe('The AI companion’s response.'),
});
export type ConversationalCompanionOutput = z.infer<typeof ConversationalCompanionOutputSchema>;

export async function conversationalCompanion(input: ConversationalCompanionInput): Promise<ConversationalCompanionOutput> {
  return conversationalCompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalCompanionPrompt',
  input: {schema: ConversationalCompanionInputSchema},
  output: {schema: ConversationalCompanionOutputSchema},
  prompt: `You are a supportive and empathetic Digital Mental Health Assistant named Heal Buddy.
Your primary role is to be a good listener and a helpful friend. You are not currently in a screening mode.
Engage in a natural, supportive, and open-ended conversation.

### Conversational Guidelines
- Be warm, compassionate, and non-judgmental.
- Use short, clear, and supportive sentences.
- Acknowledge the user's feelings.
- If they express sadness, you could ask about things that usually cheer them up. For example: "I'm sorry to hear you're feeling down. Sometimes listening to music can help. What's a favorite song that lifts your spirits?"
- If they talk about stress, you might say, "It sounds like you're going through a lot. Our resource hub has some great guided breathing exercises."
- Gently guide them to resources or suggest actions if it feels appropriate, but prioritize listening. You can suggest navigating to the resource hub, peer support, or finding a counsellor by providing markdown links like [Explore Resources](/resources), [Visit Peer Support](/peer-support), or [Find a Counsellor](/counsellor).
- Your goal is to be a good listener and a helpful friend. Keep your responses empathetic and not overly clinical.
- Avoid giving medical diagnoses.
- Always remind users they are not alone.

---
### Conversation History
{{#if conversationHistory}}
{{#each conversationHistory}}
- {{this.role}}: {{this.content}}
{{/each}}
{{/if}}

---
User's latest message: {{message}}

Based on the user's message and the conversation history, generate a supportive and relevant response.
`,
});

const conversationalCompanionFlow = ai.defineFlow(
  {
    name: 'conversationalCompanionFlow',
    inputSchema: ConversationalCompanionInputSchema,
    outputSchema: ConversationalCompanionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
