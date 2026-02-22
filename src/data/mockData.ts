export type Service = {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  icon: string;
};

export type Barber = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  pin: string;
};

export type BookingStatus = "confirmed" | "uncertain" | "canceled";

export type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  barberId: string;
  services: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  status: BookingStatus;
};

export type Customer = {
  phone: string;
  name: string;
  email?: string;
};

export const SERVICES: Service[] = [
  { id: "haircut", name: "Haircut", duration: 30, price: 35, icon: "✂️" },
  { id: "beard", name: "Beard Trim", duration: 20, price: 20, icon: "🪒" },
  { id: "full", name: "Full Service", duration: 50, price: 50, icon: "💈" },
  { id: "lineup", name: "Line Up", duration: 15, price: 15, icon: "📐" },
  { id: "shave", name: "Hot Shave", duration: 25, price: 30, icon: "🧴" },
  { id: "kids", name: "Kids Cut", duration: 20, price: 22, icon: "👦" },
];

export const BARBERS: Barber[] = [
  { id: "b1", name: "Marcus", title: "Senior Barber", avatar: "M", pin: "1234" },
  { id: "b2", name: "Jake", title: "Style Specialist", avatar: "J", pin: "5678" },
  { id: "b3", name: "Devon", title: "Master Barber", avatar: "D", pin: "9012" },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const dayStr = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return fmt(d);
};

export const MOCK_BOOKINGS: Booking[] = [
  { id: "bk1", customerName: "Jake L", customerPhone: "+1234567890", barberId: "b1", services: ["haircut"], date: dayStr(0), time: "09:00", duration: 30, status: "confirmed" },
  { id: "bk2", customerName: "Caroline J", customerPhone: "+1234567891", barberId: "b1", services: ["beard"], date: dayStr(0), time: "10:00", duration: 20, status: "uncertain" },
  { id: "bk3", customerName: "Hannah", customerPhone: "+1234567892", barberId: "b1", services: ["full"], date: dayStr(0), time: "13:00", duration: 50, status: "confirmed" },
  { id: "bk4", customerName: "Lucy", customerPhone: "+1234567893", barberId: "b2", services: ["haircut"], date: dayStr(0), time: "09:30", duration: 30, status: "canceled" },
  { id: "bk5", customerName: "Matthew", customerPhone: "+1234567894", barberId: "b2", services: ["full"], date: dayStr(0), time: "11:00", duration: 50, status: "confirmed" },
  { id: "bk6", customerName: "Michael A", customerPhone: "+1234567895", barberId: "b3", services: ["haircut", "beard"], date: dayStr(0), time: "10:00", duration: 50, status: "confirmed" },
  { id: "bk7", customerName: "Omar", customerPhone: "+1234567896", barberId: "b3", services: ["beard"], date: dayStr(0), time: "14:00", duration: 20, status: "confirmed" },
  { id: "bk8", customerName: "Jakob", customerPhone: "+1234567897", barberId: "b1", services: ["full"], date: dayStr(1), time: "09:30", duration: 50, status: "confirmed" },
  { id: "bk9", customerName: "Ana L", customerPhone: "+1234567898", barberId: "b2", services: ["haircut"], date: dayStr(1), time: "12:00", duration: 30, status: "uncertain" },
  { id: "bk10", customerName: "Ben M", customerPhone: "+1234567899", barberId: "b3", services: ["beard"], date: dayStr(1), time: "09:00", duration: 20, status: "confirmed" },
  { id: "bk11", customerName: "Bryce", customerPhone: "+1234568900", barberId: "b1", services: ["haircut"], date: dayStr(2), time: "10:00", duration: 30, status: "confirmed" },
  { id: "bk12", customerName: "Trey", customerPhone: "+1234568901", barberId: "b2", services: ["full"], date: dayStr(2), time: "15:00", duration: 50, status: "confirmed" },
];

export const KNOWN_CUSTOMERS: Customer[] = [
  { phone: "+1234567890", name: "Jake L", email: "jake@example.com" },
  { phone: "+1234567891", name: "Caroline J" },
  { phone: "+1234567892", name: "Hannah" },
];

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00",
];
