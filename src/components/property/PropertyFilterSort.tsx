
'use client';

import { useState, useMemo } from 'react';
import type { Property } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, ArrowUpDown, X } from 'lucide-react';

interface PropertyFilterSortProps {
  properties: Property[];
  onFilterChange: (filteredProperties: Property[]) => void;
}

const ALL_LOCATIONS_VALUE = "__ALL_LOCATIONS__"; // Special value for "All Locations" item

export function PropertyFilterSort({ properties, onFilterChange }: PropertyFilterSortProps) {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [location, setLocation] = useState(''); // Empty string means all locations
  const [bedrooms, setBedrooms] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded_desc'); // Default sort: newest first

  const uniqueLocations = useMemo(() => {
    const locations = new Set(properties.map(p => p.location));
    return Array.from(locations).sort();
  }, [properties]);

  const applyFiltersAndSort = () => {
    let filtered = [...properties];

    if (priceMin) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceMax));
    }
    if (location && location !== ALL_LOCATIONS_VALUE) { // Filter if location is set and not the special 'all' value
      filtered = filtered.filter(p => p.location === location);
    }
    if (bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(bedrooms, 10));
    }

    // Sorting
    const [sortField, sortOrder] = sortBy.split('_');
    filtered.sort((a, b) => {
      let valA = (a as any)[sortField];
      let valB = (b as any)[sortField];

      if (sortField === 'dateAdded') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    onFilterChange(filtered);
  };

  const resetFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setLocation(''); 
    setBedrooms('');
    setSortBy('dateAdded_desc');
    const defaultSorted = [...properties].sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    onFilterChange(defaultSorted);
  };

  const handleLocationChange = (selectedValue: string) => {
    if (selectedValue === ALL_LOCATIONS_VALUE) {
      setLocation(''); // Set actual state to empty string for "All Locations"
    } else {
      setLocation(selectedValue);
    }
  };
  
  // When using the Select component, its value prop should reflect the actual state.
  // If location state is '', it means "All Locations", so Select's value should be ALL_LOCATIONS_VALUE.
  const selectValueForLocation = location === '' ? ALL_LOCATIONS_VALUE : location;

  return (
    <Card className="mb-8 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-6 h-6 text-primary" />
          Filter & Sort Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="priceMin">Min Price</Label>
            <Input id="priceMin" type="number" placeholder="e.g., 500" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="priceMax">Max Price</Label>
            <Input id="priceMax" type="number" placeholder="e.g., 3000" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={selectValueForLocation} onValueChange={handleLocationChange}>
              <SelectTrigger id="location">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS_VALUE}>All Locations</SelectItem>
                {uniqueLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bedrooms">Min Bedrooms</Label>
            <Input id="bedrooms" type="number" placeholder="e.g., 2" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="sortBy">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Sort properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="dateAdded_desc">Newest First</SelectItem>
                <SelectItem value="dateAdded_asc">Oldest First</SelectItem>
                <SelectItem value="bedrooms_asc">Bedrooms: Low to High</SelectItem>
                <SelectItem value="bedrooms_desc">Bedrooms: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={applyFiltersAndSort} className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button onClick={resetFilters} variant="outline" className="w-full md:w-auto">
               <X className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
