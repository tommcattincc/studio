
export interface Property {
  id: string;
  name: string; // e.g., "Cozy Downtown Apartment"
  address: string;
  propertyType: string; // e.g., "Apartment", "House", "Condo", "Airbnb Room"
  location: string; // City or specific area
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  amenities: string[]; // List of amenities
  uniqueFeatures: string[]; // List of unique features
  description: string;
  imageUrl: string;
  dateAdded: string; // ISO date string
}

// For AI description generation, mapping to existing schema
export interface GeneratePropertyDescriptionInput {
  propertyType: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  amenities: string; // Comma-separated
  uniqueFeatures: string; // Comma-separated
}

export interface GeneratePropertyDescriptionOutput {
  description: string;
}
