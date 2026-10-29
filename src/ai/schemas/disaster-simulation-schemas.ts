import { z } from 'zod';

// Schema for generating a quiz
export const GenerateQuizInputSchema = z.object({
  disasterType: z.string().describe('The type of natural disaster for the simulation (e.g., Earthquake, Hurricane, Wildfire).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const QuizQuestionSchema = z.object({
    question: z.string().describe("A scenario-based question about the disaster."),
    options: z.array(z.string()).length(4).describe("A list of 4 possible answers, one of which is correct."),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).length(3).describe("A list of exactly 3 questions for the quiz."),
});
export type Quiz = z.infer<typeof QuizSchema>;


// Schema for evaluating an answer
export const EvaluateAnswerInputSchema = z.object({
  question: z.string().describe("The question that was asked."),
  options: z.array(z.string()).describe("The multiple choice options presented to the user."),
  userAnswer: z.string().describe("The user's chosen answer."),
});
export type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInputSchema>;

export const AnswerEvaluationSchema = z.object({
  isCorrect: z.boolean().describe("Whether the user's answer was correct."),
  feedback: z.string().describe("Constructive feedback explaining why the answer is correct or incorrect, and what the best practice is."),
});
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>;
