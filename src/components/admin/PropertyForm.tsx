'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { addPropertyAction, generateDescriptionAction } from '@/lib/actions';
import type { GeneratePropertyDescriptionInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';

const propertyFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  propertyType: z.string().min(3, 'Property type is required (e.g., House, Apartment)'),
  location: z.string().min(2, 'Location is required (e.g., City name)'),
  price: z.coerce.number().positive('Price must be a positive number'),
  bedrooms: z.coerce.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.coerce.number().min(0, 'Bathrooms cannot be negative'),
  squareFootage: z.coerce.number().positive('Square footage must be positive'),
  amenities: z.string().min(1, 'Enter at least one amenity, comma-separated'),
  uniqueFeatures: z.string().min(1, 'Enter at least one unique feature, comma-separated'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  imageUrl: z.string().url('Must be a valid URL (e.g., https://placehold.co/600x400.png)').optional().or(z.literal('')),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export function PropertyForm({ onPropertyAdded }: { onPropertyAdded: () => void }) {
  const { toast } = useToast();
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: '',
      address: '',
      propertyType: '',
      location: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFootage: 0,
      amenities: '',
      uniqueFeatures: '',
      description: '',
      imageUrl: '',
    },
  });

  async function onSubmit(data: PropertyFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const result = await addPropertyAction(formData);

    if (result?.errors) {
      // Handle field-specific errors if necessary, though react-hook-form does this.
      toast({
        title: 'Error adding property',
        description: result.message || 'Please check the form for errors.',
        variant: 'destructive',
      });
    } else if (result?.message.includes('Error') || result?.message.includes('Failed')) {
       toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: result?.message || 'Property added successfully.',
      });
      form.reset();
      onPropertyAdded(); // Callback to refresh property list
    }
  }

  const handleGenerateDescription = async () => {
    const values = form.getValues();
    const { propertyType, location, bedrooms, bathrooms, squareFootage, amenities, uniqueFeatures } = values;

    if (!propertyType || !location || bedrooms === undefined || bathrooms === undefined || squareFootage === undefined || !amenities || !uniqueFeatures) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in Property Type, Location, Bedrooms, Bathrooms, Sq. Footage, Amenities, and Unique Features to generate a description.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingDesc(true);
    const aiInput: GeneratePropertyDescriptionInput = {
      propertyType,
      location,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      squareFootage: Number(squareFootage),
      amenities: amenities, // These are already strings from the form
      uniqueFeatures: uniqueFeatures,
    };

    const result = await generateDescriptionAction(aiInput);
    setIsGeneratingDesc(false);

    if (result.description) {
      form.setValue('description', result.description);
      toast({
        title: 'Description Generated!',
        description: 'The AI has crafted a description for your property.',
      });
    } else {
      toast({
        title: 'Generation Failed',
        description: result.error || 'Could not generate description. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Add New Property</CardTitle>
        <CardDescription>Fill in the details for the new property listing.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Cozy Downtown Apartment" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="e.g., 123 Main St, City, State" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <FormControl><Input placeholder="e.g., House, Apartment, Airbnb" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (City/Area)</FormLabel>
                    <FormControl><Input placeholder="e.g., Nashville" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 1500" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl><Input type="number" step="0.5" placeholder="e.g., 2.5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sq. Footage</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 1200" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <FormControl><Input placeholder="Comma-separated, e.g., Pool, Gym, Balcony" {...field} /></FormControl>
                  <FormDescription>Provide a comma-separated list of amenities.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uniqueFeatures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unique Features</FormLabel>
                  <FormControl><Input placeholder="Comma-separated, e.g., Ocean view, Smart home" {...field} /></FormControl>
                  <FormDescription>Provide a comma-separated list of unique features.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGeneratingDesc}>
                      {isGeneratingDesc ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  <FormControl><Textarea placeholder="Enter property description or generate with AI..." className="min-h-[120px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input placeholder="https://placehold.co/600x400.png" {...field} /></FormControl>
                  <FormDescription>Link to the property image. Leave blank for default placeholder.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Property
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
