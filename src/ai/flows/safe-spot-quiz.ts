'use server';

/**
 * @fileOverview Generates a "find the safe spot" quiz for gamified learning.
 *
 * - generateSafeSpotQuiz - Creates a quiz for a given disaster type.
 */

import { ai } from '@/ai/genkit';
import { GenerateSafeSpotQuizInputSchema, SafeSpotQuestionSchema, type GenerateSafeSpotQuizInput, type SafeSpotQuestion } from '@/ai/schemas/safe-spot-quiz-schemas';

// --- Flows ---

export async function generateSafeSpotQuiz(input: GenerateSafeSpotQuizInput): Promise<SafeSpotQuestion> {
  const flow = ai.defineFlow(
    {
      name: 'generateSafeSpotQuizFlow',
      inputSchema: GenerateSafeSpotQuizInputSchema,
      outputSchema: SafeSpotQuestionSchema,
    },
    async ({ disasterType }) => {
      const prompt = ai.definePrompt({
        name: 'generateSafeSpotQuizPrompt',
        output: { schema: SafeSpotQuestionSchema },
        prompt: `You are an expert in disaster safety education for children. 
        Create a "Find the Safe Spot" game scenario for a '{{{disasterType}}}' in a school setting.

        1.  **Scenario**: Write a simple, one-sentence scenario. Example: "An earthquake starts while you are in the library."
        2.  **Image Hint**: Provide a 1-2 word hint for a background image that matches the scenario (e.g., 'school library', 'classroom').
        3.  **Spots**: List exactly 4 potential spots. One must be the correct safe spot, and three must be plausible but incorrect. Give each a short ID and a descriptive name.
        4.  **Correct Spot**: Identify the ID of the correct spot.
        5.  **Explanation**: Briefly explain why the correct spot is safe and the others are not, in simple terms a child can understand.
        
        Disaster Type: {{{disasterType}}}`,
      });
      
      const { output } = await prompt({ disasterType });
      return output!;
    }
  );
  return flow(input);
}
