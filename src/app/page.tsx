'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Property } from '@/lib/types';
import { getProperties } from '@/lib/actions';
import { PropertyList } from '@/components/property/PropertyList';
import { PropertyFilterSort } from '@/components/property/PropertyFilterSort';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const properties = await getProperties();
      // Default sort: newest first
      const sortedProperties = [...properties].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      setAllProperties(sortedProperties);
      setDisplayedProperties(sortedProperties);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      // Handle error display if necessary
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetProperties();
  }, [fetchAndSetProperties]);

  const handleFilterChange = (filteredProperties: Property[]) => {
    setDisplayedProperties(filteredProperties);
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-40 w-full mb-8" /> {/* Placeholder for filter card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-center">
        Discover Your Next <span className="text-primary">Home</span>
      </h1>
      <PropertyFilterSort properties={allProperties} onFilterChange={handleFilterChange} />
      
      <div className="pt-4">
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">
          Explore Our Listings
        </h2>
        <PropertyList properties={displayedProperties} />
      </div>
    </div>
  );
}
