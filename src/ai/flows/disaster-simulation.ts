'use server';

/**
 * @fileOverview Generates a natural disaster quiz and evaluates user answers.
 *
 * - generateQuiz - Creates a quiz for a given disaster type.
 * - evaluateAnswer - Evaluates a user's answer to a quiz question.
 */

import { ai } from '@/ai/genkit';
import { 
    GenerateQuizInputSchema,
    QuizSchema,
    EvaluateAnswerInputSchema,
    AnswerEvaluationSchema,
    type GenerateQuizInput,
    type Quiz,
    type EvaluateAnswerInput,
    type AnswerEvaluation
} from '@/ai/schemas/disaster-simulation-schemas';


// Flow for generating the initial quiz
const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: QuizSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateQuizPrompt',
      input: { schema: GenerateQuizInputSchema },
      output: { schema: QuizSchema },
      prompt: `You are a disaster preparedness expert creating a training quiz for a school administrator about a '{{{disasterType}}}'.
      Generate a quiz with exactly 3 questions.
      Each question should present a realistic, concise scenario followed by a clear question about the best immediate action.
      For each question, provide 4 distinct options: one correct answer and three plausible but incorrect distractors.
      The entire quiz should be focused on the '{{{disasterType}}}'.`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
    return generateQuizFlow(input);
}


// Flow for evaluating the user's answer
const evaluateAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateAnswerFlow',
    inputSchema: EvaluateAnswerInputSchema,
    outputSchema: AnswerEvaluationSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'evaluateAnswerPrompt',
      input: { schema: EvaluateAnswerInputSchema },
      output: { schema: AnswerEvaluationSchema },
      prompt: `You are a disaster response trainer evaluating a quiz answer.
      The question was: "{{{question}}}"
      The options were: {{{options}}}
      The user chose: "{{{userAnswer}}}"

      1.  **Determine Correctness**: Is the user's answer the best choice among the options?
      2.  **Provide Feedback**: Explain why the user's answer is correct or incorrect. If incorrect, explain what the best action would have been and why. The feedback should be concise and educational.`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluation> {
    return evaluateAnswerFlow(input);
}
