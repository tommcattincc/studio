
'use client';
import Image from 'next/image';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Bath, LocateFixed, Home as HomeIcon, Maximize, Phone, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { createBookingAction } from '@/lib/actions';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBookingSubmit = async () => {
    if (!userName || !userPhone) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and phone number.",
        variant: "destructive",
      });
      return;
    }
    setIsBooking(true);
    try {
      const result = await createBookingAction({
        propertyId: property.id,
        propertyName: property.name,
        userName,
        userPhone,
      });

      if (result?.errors) {
        toast({
          title: "Booking Failed",
          description: result.message || "Please check your input.",
          variant: "destructive",
        });
      } else if (result?.message.includes('Error') || result?.message.includes('Failed')) {
        toast({
          title: "Booking Failed",
          description: result.message,
          variant: "destructive",
        });
      }
       else {
        toast({
          title: "Booking Successful!",
          description: `You've requested to book ${property.name}. We'll contact you shortly.`,
        });
        setIsDialogOpen(false); // Close dialog on success
        setUserName(''); // Reset fields
        setUserPhone('');
      }
    } catch (error) {
      toast({
        title: "Booking Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };


  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0 relative">
        <Image
          src={property.imageUrl || 'https://placehold.co/600x400.png'}
          alt={property.name}
          width={600}
          height={400}
          className="object-cover w-full h-48"
          data-ai-hint="house exterior"
        />
        <Badge variant="secondary" className="absolute top-2 right-2">
          {property.propertyType}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-1 truncate" title={property.name}>{property.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3 truncate" title={property.address}>
          <LocateFixed className="inline-block w-4 h-4 mr-1" /> {property.address}
        </CardDescription>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center text-muted-foreground">
            <BedDouble className="w-4 h-4 mr-2 text-primary" /> {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Bath className="w-4 h-4 mr-2 text-primary" /> {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Maximize className="w-4 h-4 mr-2 text-primary" /> {property.squareFootage.toLocaleString()} sqft
          </div>
           <div className="flex items-center text-muted-foreground">
            <HomeIcon className="w-4 h-4 mr-2 text-primary" /> {property.location}
          </div>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-3 mb-3">{property.description}</p>
        
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">Amenities:</h4>
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
              ))}
              {property.amenities.length > 3 && <Badge variant="outline" className="text-xs">+{property.amenities.length - 3} more</Badge>}
            </div>
          </div>
        )}

      </CardContent>
      <CardFooter className="p-4 bg-muted/50 border-t">
        <div className="flex items-center justify-between w-full">
          <p className="text-lg font-bold text-primary">
            ${property.price.toLocaleString()}
            {property.propertyType.toLowerCase().includes('airbnb') || property.propertyType.toLowerCase().includes('rental') ? <span className="text-xs font-normal text-muted-foreground">/month</span> : ''}
          </p>
          
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="default" size="sm">
                <Send className="mr-2 h-4 w-4" /> Book
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Book: {property.name}</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your details to request a booking. We will contact you to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="userName" className="flex items-center mb-1">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" /> Your Name
                  </Label>
                  <Input 
                    id="userName" 
                    placeholder="Enter your full name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="userPhone" className="flex items-center mb-1">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" /> Your Phone
                  </Label>
                  <Input 
                    id="userPhone" 
                    type="tel"
                    placeholder="Enter your phone number"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setUserName(''); setUserPhone('');}}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBookingSubmit} disabled={isBooking}>
                  {isBooking ? 'Submitting...' : 'Submit Booking Request'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </CardFooter>
    </Card>
  );
}
