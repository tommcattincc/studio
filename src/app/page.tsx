
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Property } from '@/lib/types';
import { getPropertiesRealtime } from '@/lib/data'; // Updated to use realtime function
import { PropertyList } from '@/components/property/PropertyList';
import { PropertyFilterSort } from '@/components/property/PropertyFilterSort';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

function HeroSection() {
  return (
    <div className="relative h-[500px] md:h-[600px] w-full mb-12 rounded-lg overflow-hidden shadow-xl">
      <Image
        src="/images/hero-background.jpg" 
        alt="Modern open-plan living space with kitchen and large windows"
        layout="fill"
        objectFit="cover"
        className="z-0"
        priority
        data-ai-hint="modern interior"
      />
      <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Time to Find Your <span className="text-primary">Dream Home</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-200 max-w-2xl">
          Discover a curated selection of properties tailored to your lifestyle. Whether you're looking to buy, rent, or find the perfect vacation spot, Adilla makes your search seamless and enjoyable.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getPropertiesRealtime((properties) => {
      setAllProperties(properties);
      // Initially display all properties, filters can override this
      setDisplayedProperties(properties); 
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  const handleFilterChange = (filteredProperties: Property[]) => {
    setDisplayedProperties(filteredProperties);
  };
  
  // Show loading skeleton if loading OR if properties haven't arrived yet but we expect them
  const showInitialLoadingSkeleton = isLoading && allProperties.length === 0;

  if (showInitialLoadingSkeleton) { 
    return (
      <>
        <HeroSection />
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            Discover Your Next <span className="text-primary">Property</span>
          </h2>
          <Skeleton className="h-40 w-full mb-8 rounded-lg" /> {/* Filter sort skeleton */}
          <div className="pt-4">
            <h3 className="text-2xl font-semibold mb-6 text-center md:text-left">
             Explore Our Listings
            </h3>
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
        </div>
      </>
    );
  }

  return (
    <>
      <HeroSection />
      <div className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Discover Your Next <span className="text-primary">Property</span>
        </h2>
        <PropertyFilterSort properties={allProperties} onFilterChange={handleFilterChange} />
        
        <div className="pt-4">
          <h3 className="text-2xl font-semibold mb-6 text-center md:text-left">
            Explore Our Listings
          </h3>
          {/* Show skeleton if filtering is in progress (isLoading true but some properties might exist) OR if no properties after load */}
          {isLoading && displayedProperties.length === 0 && allProperties.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="flex flex-col space-y-3">
                 <Skeleton className="h-[200px] w-full rounded-xl" />
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-[250px]" />
                   <Skeleton className="h-4 w-[200px]" />
                 </div>
               </div>
             ))}
           </div>
          ) : (
            <PropertyList properties={displayedProperties} />
          )}
        </div>
      </div>
    </>
  );
}
