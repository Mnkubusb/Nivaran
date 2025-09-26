'use server';

/**
 * @fileOverview Conducts mental health screenings (PHQ-9, GAD-7, GHQ) through a natural language conversation using the Gemini API.
 *
 * - conversationalScreening - A function that handles the conversational screening process.
 * - ConversationalScreeningInput - The input type for the conversationalScreening function.
 * - ConversationalScreeningOutput - The return type for the conversationalScreening function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScreeningTypeSchema = z.enum(['PHQ-9', 'GAD-7', 'GHQ']);

const ConversationalScreeningInputSchema = z.object({
  screeningType: ScreeningTypeSchema.describe('The type of mental health screening to conduct (PHQ-9, GAD-7, GHQ).'),
  questionNumber: z.number().optional().describe('The question number to ask next. If not provided, start from the beginning.'),
  userAnswer: z.string().optional().describe('The user’s answer to the previous question.'),
  conversationHistory: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional().describe('The conversation history so far.')
});
export type ConversationalScreeningInput = z.infer<typeof ConversationalScreeningInputSchema>;

const ConversationalScreeningOutputSchema = z.object({
  nextQuestion: z.string().optional().describe('The next question to ask the user. If screening is complete, this will be undefined.'),
  isComplete: z.boolean().describe('Whether the screening is complete.'),
  summary: z.string().optional().describe('A summary of the screening results, provided when the screening is complete.'),
});
export type ConversationalScreeningOutput = z.infer<typeof ConversationalScreeningOutputSchema>;

export async function conversationalScreening(input: ConversationalScreeningInput): Promise<ConversationalScreeningOutput> {
  return conversationalScreeningFlow(input);
}

const phq9Questions = [
    'Over the last 2 weeks, how often have you been bothered by having little interest or pleasure in doing things?',
    'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
    'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
    'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?',
    'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?',
    'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself—or that you are a failure or have let yourself or your family down?',
    'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?',
    'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual?',
    'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself in some way?',
];
  
const gad7Questions = [
    'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
    'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
    'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
    'Over the last 2 weeks, how often have you been bothered by trouble relaxing?',
    'Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?',
    'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?',
    'Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?',
];

const ghqQuestions = [
    'Been able to concentrate on whatever you’re doing?',
    'Lost much sleep over worry?',
    'Felt that you were playing a useful part in things?',
    'Felt capable of making decisions about things?',
    'Felt constantly under strain?',
    'Felt you couldn’t overcome your difficulties?',
    'Been able to enjoy your normal day-to-day activities?',
    'Been able to face up to your problems?',
    'Been feeling reasonably happy, all things considered?',
    'Been losing confidence in yourself?',
    'Been thinking of yourself as worthless?',
    'Been feeling reasonably happy?',
];

const scoringMap = {
    'Not at all': 0,
    'Several days': 1,
    'More than half the days': 2,
    'Nearly every day': 3,
    'Occasionally': 1,
    'Quite often': 2,
    'All the time': 3,
};
  
const phq9Severity = (score: number) => {
    if (score <= 4) return 'Minimal symptoms. Your score does not suggest depression.';
    if (score <= 9) return 'Mild symptoms. You may benefit from monitoring your symptoms.';
    if (score <= 14) return 'Moderate symptoms. This suggests you may benefit from talking to a counselor.';
    if (score <= 19) return 'Moderately severe symptoms. It is recommended to seek professional help.';
    return 'Severe symptoms. Please seek professional help. If you have thoughts of harming yourself, contact a crisis line immediately.';
};
  
const gad7Severity = (score: number) => {
    if (score <= 4) return 'Minimal anxiety.';
    if (score <= 9) return 'Mild anxiety.';
    if (score <= 14) return 'Moderate anxiety. You may benefit from talking to a counselor.';
    return 'Severe anxiety. It is recommended to seek professional help.';
};

const ghqSeverity = (score: number) => {
    if (score <= 2) return "Suggests good current mental well-being.";
    if (score <= 6) return "Suggests the presence of some mild distress.";
    return "Suggests the presence of significant psychological distress, and you may benefit from talking to a professional.";
}

const prompt = ai.definePrompt({
  name: 'conversationalScreeningPrompt',
  input: {schema: ConversationalScreeningInputSchema},
  output: {schema: ConversationalScreeningOutputSchema},
  prompt: `You are a supportive and empathetic Digital Mental Health Assistant.
Your role is to:
1. Conduct validated mental health screenings (PHQ-9, GAD-7, GHQ).
2. Provide empathetic responses and helpful self-care strategies.
3. Escalate to emergency helplines if a user expresses self-harm or suicide risk.
4. Respect user privacy and never share personally identifiable information.
5. Always respond in clear, friendly, and encouraging language.

---
### Conversational Guidelines
- Be warm, compassionate, and non-judgmental.
- Use short, clear, and supportive sentences.
- Avoid clinical jargon; explain results in plain language.
- Never give medical diagnoses. Only suggest "Your answers suggest..." or "You may benefit from talking to a counselor."
- Offer encouragement like: “Thank you for sharing that with me, it’s important.”
- Always remind users they are not alone.

---
### Safety Guardrails
- If a user's message includes **suicidal thoughts, self-harm, or “want to die/kill myself”**, immediately set isComplete to true and respond with urgency and empathy.
- Example response: “I hear you. I want you to know you are not alone. If you are in immediate danger, please call emergency services. You can also reach out to helplines like AASRA (+91-98204 66726).”
- Do not continue the screening.

---
### Screening Flow
You are currently conducting a {{screeningType}} screening.
The user has answered the following questions:
{{#if conversationHistory}}
{{#each conversationHistory}}
- {{this.question}}: {{this.answer}}
{{/each}}
{{else}}
This is the first question.
{{/if}}

- User's latest answer: {{userAnswer}}

Based on the above, determine the next step.

- Ask **one question at a time**.
- If the user's answer seems valid, determine the next question from the list below and return it in the \`nextQuestion\` field. Add the question number (e.g., "Q2 of 9:").
- If all questions for the {{screeningType}} have been asked, calculate the total score, map it to a severity level, and provide a clear, supportive summary in the \`summary\` field. Set \`isComplete\` to true and do not provide a \`nextQuestion\`.
- Remember to use either numeric (0-3) or text-based answers ("Not at all", etc.) for scoring.

Here are the question sets:

**PHQ-9 Questions:**
{{#each phq9Questions as |q i|}}
{{i}}: {{q}}
{{/each}}

**GAD-7 Questions:**
{{#each gad7Questions as |q i|}}
{{i}}: {{q}}
{{/each}}

**GHQ Questions:**
{{#each ghqQuestions as |q i|}}
{{i}}: {{q}}
{{/each}}
`,
});

const conversationalScreeningFlow = ai.defineFlow(
  {
    name: 'conversationalScreeningFlow',
    inputSchema: ConversationalScreeningInputSchema,
    outputSchema: ConversationalScreeningOutputSchema,
  },
  async input => {
    const {screeningType, questionNumber = 0, userAnswer, conversationHistory = []} = input;

    const questionSets: { [key: string]: string[] } = {
        'PHQ-9': phq9Questions,
        'GAD-7': gad7Questions,
        'GHQ': ghqQuestions,
    };
    const questions = questionSets[screeningType];

    // SAFETY CHECK
    if (userAnswer && /(suicid|self-harm|want to die|kill myself)/i.test(userAnswer)) {
        return {
          isComplete: true,
          nextQuestion: undefined,
          summary:
            'I hear you, and I want you to know you are not alone. Your safety is the most important thing right now. If you are in immediate danger, please call emergency services. You can also reach out to a crisis helpline like AASRA at +91-98204 66726. Help is available, and you deserve support.',
        };
    }
    
    if (questionNumber >= questions.length) {
      // Screening is complete, calculate score and return summary.
      let score = 0;
      conversationHistory.forEach(item => {
        const answer = item.answer;
        const mappedValue = Object.entries(scoringMap).find(([key, _]) => answer.toLowerCase().includes(key.toLowerCase()))?.[1]
        if (mappedValue !== undefined) {
            score += mappedValue;
        } else {
            const numericValue = parseInt(answer, 10);
            if (!isNaN(numericValue) && numericValue >=0 && numericValue <=3) {
                score += numericValue;
            }
        }
      });
      
      let summary = `Thank you for completing the ${screeningType} screening.`;
      if (screeningType === 'PHQ-9') {
        summary += ` Your total score is ${score}. ${phq9Severity(score)}`;
      } else if (screeningType === 'GAD-7') {
        summary += ` Your total score is ${score}. ${gad7Severity(score)}`;
      } else if (screeningType === 'GHQ') {
        summary += ` Your total score is ${score}. ${ghqSeverity(score)}`;
      }

      summary += `\nRemember, this is not a diagnosis. It's a snapshot of your well-being. I'm here to help you find resources or connect with a professional if you'd like.`;

      return {
        isComplete: true,
        nextQuestion: undefined,
        summary: summary,
      };
    }

    const {output} = await prompt(input);
    return output!;
  }
);
