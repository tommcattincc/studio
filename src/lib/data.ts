import type { Property } from './types';

export const initialProperties: Property[] = [
  {
    id: '1',
    name: 'Sunny Studio in Green Hills',
    address: '123 Main St, Nashville, TN',
    propertyType: 'Apartment',
    location: 'Nashville',
    price: 1500,
    bedrooms: 0, // Studio
    bathrooms: 1,
    squareFootage: 500,
    amenities: ['Rooftop Pool', 'Gym', 'In-unit Laundry'],
    uniqueFeatures: ['Floor-to-ceiling windows', 'Private balcony'],
    description: 'Bright and airy studio apartment in the heart of Green Hills. Enjoy modern amenities and stunning city views.',
    imageUrl: 'https://placehold.co/600x400.png',
    dateAdded: new Date('2023-10-01T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    name: 'Family Home with Large Yard',
    address: '456 Oak Ave, Franklin, TN',
    propertyType: 'House',
    location: 'Franklin',
    price: 3200,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFootage: 2200,
    amenities: ['Fenced Yard', 'Two-car Garage', 'Updated Kitchen'],
    uniqueFeatures: ['Screened porch', 'Mature trees'],
    description: 'Spacious family home in a quiet Franklin neighborhood. Features a large, fenced backyard perfect for kids and pets.',
    imageUrl: 'https://placehold.co/600x400.png',
    dateAdded: new Date('2023-10-15T14:30:00Z').toISOString(),
  },
  {
    id: '3',
    name: 'Chic Downtown Loft',
    address: '789 Pine St, Nashville, TN',
    propertyType: 'Loft',
    location: 'Nashville',
    price: 2800,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 1200,
    amenities: ['Exposed Brick', 'Stainless Steel Appliances', 'Walk-in Closet'],
    uniqueFeatures: ['15-ft ceilings', 'Polished concrete floors'],
    description: 'Stylish loft in a converted warehouse, located in the vibrant downtown Nashville. Open concept living with industrial-chic details.',
    imageUrl: 'https://placehold.co/600x400.png',
    dateAdded: new Date('2023-11-01T09:00:00Z').toISOString(),
  },
  {
    id: '4',
    name: 'Cozy Airbnb Room near Lake',
    address: '101 Lake Rd, Kingston Springs, TN',
    propertyType: 'Airbnb Room',
    location: 'Kingston Springs',
    price: 80, // per night
    bedrooms: 1,
    bathrooms: 1, // shared or private, for simplicity 1
    squareFootage: 250,
    amenities: ['Private Entrance', 'Mini-fridge', 'Free WiFi'],
    uniqueFeatures: ['Walking distance to lake', 'Quiet retreat'],
    description: 'Comfortable private room in a charming home, perfect for a weekend getaway near the lake. Enjoy peace and nature.',
    imageUrl: 'https://placehold.co/600x400.png',
    dateAdded: new Date('2023-11-05T12:00:00Z').toISOString(),
  },
];

// This is a simple in-memory store. Data will be lost on server restart.
let propertiesStore: Property[] = [...initialProperties];

export const getPropertiesFromStore = (): Property[] => {
  return JSON.parse(JSON.stringify(propertiesStore)); // Return a copy to avoid direct mutation
};

export const addPropertyToStore = (property: Property): Property => {
  propertiesStore.unshift(property); // Add to the beginning of the array
  return property;
};
