'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Property, GeneratePropertyDescriptionInput as GenDescInputType } from './types';
import { getPropertiesFromStore, addPropertyToStore } from './data';
import { generatePropertyDescription as genkitGenerateDescription } from '@/ai/flows/generate-property-description';

// Schema for adding a new property
const AddPropertySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  propertyType: z.string().min(3, 'Property type is required'),
  location: z.string().min(2, 'Location is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  bedrooms: z.coerce.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.coerce.number().min(0, 'Bathrooms cannot be negative'),
  squareFootage: z.coerce.number().positive('Square footage must be positive'),
  amenities: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(s => s.length > 0)),
  uniqueFeatures: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(s => s.length > 0)),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),
});

export async function getProperties(): Promise<Property[]> {
  return getPropertiesFromStore();
}

export async function addPropertyAction(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = AddPropertySchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add property due to validation errors.',
    };
  }

  const data = validatedFields.data;
  const newProperty: Property = {
    id: Date.now().toString(), // Simple ID generation
    ...data,
    imageUrl: data.imageUrl || `https://placehold.co/600x400.png`, // Default placeholder
    dateAdded: new Date().toISOString(),
  };

  try {
    addPropertyToStore(newProperty);
    revalidatePath('/');
    revalidatePath('/admin');
    return {
      message: 'Property added successfully!',
      property: newProperty,
    };
  } catch (error) {
    console.error('Failed to add property:', error);
    return {
      message: 'Database Error: Failed to add property.',
    };
  }
}

export async function generateDescriptionAction(input: GenDescInputType): Promise<{ description?: string; error?: string }> {
  try {
    const result = await genkitGenerateDescription({
      propertyType: input.propertyType,
      location: input.location,
      bedrooms: Number(input.bedrooms),
      bathrooms: Number(input.bathrooms),
      squareFootage: Number(input.squareFootage),
      amenities: input.amenities, // Already a comma-separated string from form
      uniqueFeatures: input.uniqueFeatures, // Already a comma-separated string from form
    });
    return { description: result.description };
  } catch (error) {
    console.error('AI description generation failed:', error);
    return { error: 'Failed to generate description. Please try again.' };
  }
}
