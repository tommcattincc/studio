
'use client';

import { useEffect, useState } from 'react';
import { PropertyForm } from '@/components/admin/PropertyForm';
import type { Property, Booking } from '@/lib/types';
import { getPropertiesRealtime, getBookingsRealtime } from '@/lib/data'; // Using realtime functions
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Home, UserCircle, PhoneCall, CalendarDays } from 'lucide-react';

// Hardcoded password for demonstration.
const MOCK_PASSWORD = 'admin123';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoadingProperties(true);
    const unsubscribeProperties = getPropertiesRealtime((props) => {
      setProperties(props);
      setIsLoadingProperties(false);
    });

    setIsLoadingBookings(true);
    const unsubscribeBookings = getBookingsRealtime((bks) => {
      setBookings(bks);
      setIsLoadingBookings(false);
    });

    return () => {
      unsubscribeProperties();
      unsubscribeBookings();
    };
  }, [isAuthenticated]);

  const handlePropertyAdded = () => {
    // Realtime listener should handle updates, so this might not be strictly necessary
    // unless an immediate re-sort or specific UI update is desired.
    // For now, rely on Firestore realtime updates.
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordAttempt === MOCK_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Please try again.');
      setIsAuthenticated(false);
    }
    setPasswordAttempt(''); 
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md p-6 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Access Required</CardTitle>
            <CardDescription className="text-center">
              This page is for administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Development Mode Security Notice</AlertTitle>
              <AlertDescription>
                This is a mock password prompt for demonstration purposes only.
                <strong> Do not use this method in a production environment.</strong>
                A proper authentication system is required for real security.
                <br /> Enter '<strong>{MOCK_PASSWORD}</strong>' to proceed.
              </AlertDescription>
            </Alert>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordAttempt}
                  onChange={(e) => setPasswordAttempt(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="mt-1"
                />
              </div>
              {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <PropertyForm onPropertyAdded={handlePropertyAdded} />

      <Card className="mt-12 shadow-lg">
        <CardHeader>
          <CardTitle>Current Property Listings</CardTitle>
          <CardDescription>Manage your existing property listings.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProperties ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={`prop-skel-${i}`} className="flex items-center space-x-4 p-2 border rounded">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No properties listed yet. Add one using the form above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell>
                      <Image 
                        src={prop.imageUrl || 'https://placehold.co/100x100.png'} 
                        alt={prop.name} 
                        width={50} 
                        height={50} 
                        className="rounded-md object-cover"
                        data-ai-hint="property thumbnail"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{prop.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prop.propertyType}</Badge>
                    </TableCell>
                    <TableCell>{prop.location}</TableCell>
                    <TableCell className="text-right">${prop.price.toLocaleString()}</TableCell>
                    <TableCell>{new Date(prop.dateAdded).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-12 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>View recent booking requests from users.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
             <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={`book-skel-${i}`} className="flex items-center space-x-4 p-2 border rounded">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                   <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No bookings yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Home className="inline-block w-4 h-4 mr-1" /> Property Name</TableHead>
                  <TableHead><UserCircle className="inline-block w-4 h-4 mr-1" /> User Name</TableHead>
                  <TableHead><PhoneCall className="inline-block w-4 h-4 mr-1" /> User Phone</TableHead>
                  <TableHead><CalendarDays className="inline-block w-4 h-4 mr-1" /> Booking Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.propertyName}</TableCell>
                    <TableCell>{booking.userName}</TableCell>
                    <TableCell>{booking.userPhone}</TableCell>
                    <TableCell>{new Date(booking.bookingDate).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
