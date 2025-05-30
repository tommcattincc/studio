// src/lib/data.ts
import { db } from './firebase'; // Assuming db is successfully initialized
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Property, Booking } from './types';

const PROPERTIES_COLLECTION = 'properties';
const BOOKINGS_COLLECTION = 'bookings';

// Helper to convert Firestore doc to Property, ensuring dateAdded is a string
const mapDocToProperty = (doc: QueryDocumentSnapshot<DocumentData>): Property => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dateAdded: (data.dateAdded instanceof Timestamp) ? data.dateAdded.toDate().toISOString() : data.dateAdded,
    // Ensure amenities and uniqueFeatures are arrays, even if empty or not present
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    uniqueFeatures: Array.isArray(data.uniqueFeatures) ? data.uniqueFeatures : [],
  } as Property;
};

// Helper to convert Firestore doc to Booking
const mapDocToBooking = (doc: QueryDocumentSnapshot<DocumentData>): Booking => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    bookingDate: (data.bookingDate instanceof Timestamp) ? data.bookingDate.toDate().toISOString() : data.bookingDate,
  } as Booking;
};


export const getPropertiesRealtime = (callback: (properties: Property[]) => void): (() => void) => {
  if (!db) {
    console.error("Firestore not initialized. Cannot fetch properties.");
    callback([]);
    return () => {}; // Return an empty unsubscribe function
  }
  const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('dateAdded', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const properties = querySnapshot.docs.map(mapDocToProperty);
    callback(properties);
  }, (error) => {
    console.error("Error fetching properties realtime: ", error);
    callback([]); // Send empty array on error
  });
  return unsubscribe; // Return the unsubscribe function
};

export const addPropertyToFirestore = async (propertyData: Omit<Property, 'id' | 'dateAdded'>): Promise<Property> => {
  if (!db) {
    throw new Error("Firestore not initialized. Cannot add property.");
  }
  const propertyWithDate = {
    ...propertyData,
    dateAdded: Timestamp.now(), // Use Firestore Timestamp
  };
  const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), propertyWithDate);
  return { ...propertyWithDate, id: docRef.id, dateAdded: propertyWithDate.dateAdded.toDate().toISOString() };
};

export const addBookingToFirestore = async (bookingData: Omit<Booking, 'id' | 'bookingDate'>): Promise<Booking> => {
  if (!db) {
    throw new Error("Firestore not initialized. Cannot add booking.");
  }
  const bookingWithDate = {
    ...bookingData,
    bookingDate: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingWithDate);
  return { ...bookingWithDate, id: docRef.id, bookingDate: bookingWithDate.bookingDate.toDate().toISOString() };
};

export const getBookingsRealtime = (callback: (bookings: Booking[]) => void): (() => void) => {
  if (!db) {
    console.error("Firestore not initialized. Cannot fetch bookings.");
    callback([]);
    return () => {};
  }
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('bookingDate', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const bookings = querySnapshot.docs.map(mapDocToBooking);
    callback(bookings);
  }, (error) => {
    console.error("Error fetching bookings realtime: ", error);
    callback([]);
  });
  return unsubscribe;
};

// Fallback getProperties for initial load or if realtime isn't setup in a component yet
export const getPropertiesFromStore = async (): Promise<Property[]> => {
  if (!db) {
    console.error("Firestore not initialized. Cannot fetch properties.");
    return [];
  }
  try {
    const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('dateAdded', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToProperty);
  } catch (error) {
    console.error("Error fetching properties from Firestore: ", error);
    return [];
  }
};
