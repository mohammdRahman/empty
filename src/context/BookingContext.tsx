import { createContext, useContext, useState, ReactNode } from "react";
import { Booking, MOCK_BOOKINGS } from "@/data/mockData";

type BookingContextType = {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
};

const BookingContext = createContext<BookingContextType | null>(null);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
};
