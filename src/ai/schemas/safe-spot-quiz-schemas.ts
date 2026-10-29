import { z } from 'zod';

export const GenerateSafeSpotQuizInputSchema = z.object({
  disasterType: z.string().describe('The type of disaster (e.g., Earthquake, Fire).'),
});
export type GenerateSafeSpotQuizInput = z.infer<typeof GenerateSafeSpotQuizInputSchema>;

export const SafeSpotQuestionSchema = z.object({
  scenario: z.string().describe("A brief description of the user's location and the disaster event."),
  imageHint: z.string().describe("A 1-2 word hint to select a relevant background image. e.g., 'school hallway', 'classroom', 'library'"),
  spots: z.array(z.object({
      id: z.string().describe("A unique ID for the spot, e.g., 'under-desk'"),
      description: z.string().describe("The name of the potential safe spot, e.g., 'Under the sturdy desk'"),
  })).length(4).describe("A list of exactly 4 potential spots in the scene."),
  correctSpotId: z.string().describe("The ID of the correct safe spot from the list."),
  explanation: z.string().describe("A brief explanation of why the correct spot is the safest choice and why others are not."),
});
export type SafeSpotQuestion = z.infer<typeof SafeSpotQuestionSchema>;
