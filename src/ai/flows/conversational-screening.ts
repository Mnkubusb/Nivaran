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
  userAnswer: z.string().optional().describe('The user\u2019s answer to the previous question.'),
  conversationHistory: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional().describe('The conversation history so far.')
});
export type ConversationalScreeningInput = z.infer<typeof ConversationalScreeningInputSchema>;

const ConversationalScreeningOutputSchema = z.object({
  nextQuestion: z.string().optional().describe('The next question to ask the user.  If screening is complete, this will be undefined.'),
  isComplete: z.boolean().describe('Whether the screening is complete.'),
  summary: z.string().optional().describe('A summary of the screening results, provided when the screening is complete.'),
});
export type ConversationalScreeningOutput = z.infer<typeof ConversationalScreeningOutputSchema>;

export async function conversationalScreening(input: ConversationalScreeningInput): Promise<ConversationalScreeningOutput> {
  return conversationalScreeningFlow(input);
}

const phq9Questions = [
  'Little interest or pleasure in doing things?',
  'Feeling down, depressed, or hopeless?',
  'Trouble falling or staying asleep, or sleeping too much?',
  'Feeling tired or having little energy?',
  'Poor appetite or overeating?',
  'Feeling bad about yourself - or that you are a failure or have let yourself or your family down?',
  'Trouble concentrating on things, such as reading the newspaper or watching television?',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?',
  'Thoughts that you would be better off dead, or of hurting yourself in some way?',
];

const gad7Questions = [
  'Feeling nervous, anxious, or on edge?',
  'Not being able to stop or control worrying?',
  'Worrying too much about different things?',
  'Trouble relaxing?',
  'Being so restless that it is hard to sit still?',
  'Becoming easily annoyed or irritable?',
  'Feeling afraid as if something awful might happen?',
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

const questionSets: { [key: string]: string[] } = {
  'PHQ-9': phq9Questions,
  'GAD-7': gad7Questions,
  'GHQ': ghqQuestions,
};

const prompt = ai.definePrompt({
  name: 'conversationalScreeningPrompt',
  input: {schema: ConversationalScreeningInputSchema},
  output: {schema: ConversationalScreeningOutputSchema},
  prompt: `You are a supportive mental health assistant designed to conduct mental health screenings through conversation.

You will conduct a {{screeningType}} screening, one question at a time, in a friendly and supportive manner.  The user has already answered the following questions:

{{#each conversationHistory}}
Question: {{this.question}}
Answer: {{this.answer}}
{{/each}}


Determine what the next question should be, and return it in the nextQuestion field. You should only return one question at a time.

If all the questions have been asked, then set isComplete to true and provide a summary of the screening results in the summary field. nextQuestion will be undefined.

If the user expresses thoughts of self-harm or suicide, set isComplete to true and provide a message with helpline/counselor options immediately. nextQuestion will be undefined.

If screeningType is PHQ-9, questions are:
${phq9Questions.join('\n')}

If screeningType is GAD-7, questions are:
${gad7Questions.join('\n')}

If screeningType is GHQ, questions are:
${ghqQuestions.join('\n')}
`,
});

const conversationalScreeningFlow = ai.defineFlow(
  {
    name: 'conversationalScreeningFlow',
    inputSchema: ConversationalScreeningInputSchema,
    outputSchema: ConversationalScreeningOutputSchema,
  },
  async input => {
    const {screeningType, questionNumber, userAnswer, conversationHistory = []} = input;

    const questions = questionSets[screeningType];

    if (!questions) {
      throw new Error(`Invalid screening type: ${screeningType}`);
    }

    let nextQuestionNumber = questionNumber === undefined ? 0 : questionNumber;

    if (nextQuestionNumber >= questions.length) {
      // Screening is complete, return a summary.
      return {
        isComplete: true,
        nextQuestion: undefined,
        summary: 'Screening complete. Please consult with a mental health professional for a complete diagnosis.',
      };
    }

    const nextQuestion = questions[nextQuestionNumber];

    const promptInput = {
      screeningType: screeningType,
      questionNumber: nextQuestionNumber,
      userAnswer: userAnswer,
      conversationHistory: conversationHistory,
    };

    const {output} = await prompt(promptInput);

    if (!output) {
      return {
        isComplete: true,
        nextQuestion: undefined,
        summary: `An error occurred during the screening. Please try again later.`,        
      };
    }

    if (output.isComplete) {
      return output;
    }

    output.nextQuestion = nextQuestion;

    return {
      nextQuestion: nextQuestion,
      isComplete: false,
      summary: undefined, // Only provide a summary when the screening is complete.
    };
  }
);
