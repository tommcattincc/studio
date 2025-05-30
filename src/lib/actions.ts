
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Property, GeneratePropertyDescriptionInput as GenDescInputType, Booking } from './types';
import { 
  addPropertyToFirestore, 
  getPropertiesFromStore, // Keep for non-realtime if needed, or switch to a realtime setup action
  addBookingToFirestore
} from './data'; // Updated to use Firestore
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

// This action now serves more as an initial fetch if needed,
// but primary data loading in components should use realtime listeners.
export async function getProperties(): Promise<Property[]> {
  // For server components or initial load, this can fetch once.
  // Client components will use getPropertiesRealtime via useEffect.
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
  const newPropertyData = {
    ...data,
    imageUrl: data.imageUrl || `https://placehold.co/600x400.png`, // Default placeholder
  };

  try {
    // dateAdded will be handled by addPropertyToFirestore
    const addedProperty = await addPropertyToFirestore(newPropertyData as Omit<Property, 'id' | 'dateAdded'>);
    revalidatePath('/'); // May not be strictly necessary with realtime updates, but good for SSR/ISR
    revalidatePath('/admin');
    return {
      message: 'Property added successfully to Firestore!',
      property: addedProperty,
    };
  } catch (error) {
    console.error('Failed to add property to Firestore:', error);
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
      amenities: input.amenities, 
      uniqueFeatures: input.uniqueFeatures,
    });
    return { description: result.description };
  } catch (error) {
    console.error('AI description generation failed:', error);
    return { error: 'Failed to generate description. Please try again.' };
  }
}

// Schema for creating a booking
const CreateBookingSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  propertyName: z.string().min(1, "Property name is required"),
  userName: z.string().min(2, "User name must be at least 2 characters"),
  userPhone: z.string().min(5, "Phone number must be at least 5 characters"), // Simple validation
});

export async function createBookingAction(data: {
  propertyId: string;
  propertyName: string;
  userName: string;
  userPhone: string;
}) {
  const validatedFields = CreateBookingSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create booking due to validation errors.',
    };
  }
  
  try {
    const newBooking = await addBookingToFirestore(validatedFields.data);
    // Revalidate admin path if it shows bookings, not strictly needed for client-side realtime
    revalidatePath('/admin'); 
    return {
      message: 'Booking created successfully!',
      booking: newBooking,
    };
  } catch (error) {
    console.error('Failed to create booking:', error);
    return {
      message: 'Database Error: Failed to create booking.',
    };
  }
}
