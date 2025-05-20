'use server';
/**
 * @fileOverview Generates engaging property descriptions from key attributes using AI.
 *
 * - generatePropertyDescription - A function that generates the property description.
 * - GeneratePropertyDescriptionInput - The input type for the generatePropertyDescription function.
 * - GeneratePropertyDescriptionOutput - The return type for the generatePropertyDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePropertyDescriptionInputSchema = z.object({
  propertyType: z.string().describe('The type of property (e.g., house, apartment, condo).'),
  location: z.string().describe('The location of the property (city, neighborhood).'),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  squareFootage: z.number().describe('The square footage of the property.'),
  amenities: z.string().describe('A list of amenities the property offers, separated by commas.'),
  uniqueFeatures: z
    .string()
    .describe('A description of the unique features of the property, separated by commas.'),
});

export type GeneratePropertyDescriptionInput = z.infer<
  typeof GeneratePropertyDescriptionInputSchema
>;

const GeneratePropertyDescriptionOutputSchema = z.object({
  description: z.string().describe('A captivating description of the property.'),
});

export type GeneratePropertyDescriptionOutput = z.infer<
  typeof GeneratePropertyDescriptionOutputSchema
>;

export async function generatePropertyDescription(
  input: GeneratePropertyDescriptionInput
): Promise<GeneratePropertyDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePropertyDescriptionPrompt',
  input: {schema: GeneratePropertyDescriptionInputSchema},
  output: {schema: GeneratePropertyDescriptionOutputSchema},
  prompt: `You are a real estate copywriter. Your task is to create an engaging and attractive property description based on the given details.

  Property Type: {{propertyType}}
  Location: {{location}}
  Bedrooms: {{bedrooms}}
  Bathrooms: {{bathrooms}}
  Square Footage: {{squareFootage}}
  Amenities: {{amenities}}
  Unique Features: {{uniqueFeatures}}

  Write a compelling description that highlights the best aspects of the property and appeals to potential tenants or buyers. Use positive and evocative language to create a sense of home and comfort. The description should be approximately 150-200 words.
`,
});

const generatePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePropertyDescriptionFlow',
    inputSchema: GeneratePropertyDescriptionInputSchema,
    outputSchema: GeneratePropertyDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
