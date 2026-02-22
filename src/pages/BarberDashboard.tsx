import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Scissors, Calendar, Clock, Copy, ChevronDown,
  X, RefreshCw, Lock, LogOut, User, Phone,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BARBERS, SERVICES, type Barber, type Booking, type BookingStatus } from "@/data/mockData";
import { useBookings } from "@/context/BookingContext";

const STATUS_DOT: Record<BookingStatus, string> = {
  confirmed: "bg-[hsl(152,56%,40%)]",
  uncertain: "bg-[hsl(40,80%,50%)]",
  canceled: "bg-[hsl(0,55%,45%)]",
};

const STATUS_BORDER: Record<BookingStatus, string> = {
  confirmed: "border-[hsl(152,45%,35%)]",
  uncertain: "border-[hsl(40,65%,42%)]",
  canceled: "border-[hsl(0,45%,40%)]",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i); // 9-19
// Half-hour slots for fine-grained grid positioning
const HALF_HOUR_SLOTS = HOURS.flatMap((h) => [h, h + 0.5]);
const TOTAL_SLOTS = HALF_HOUR_SLOTS.length; // 22 slots

const BarberDashboard = () => {
  const navigate = useNavigate();
  const { bookings, updateBooking } = useBookings();
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const handlePinSubmit = () => {
    const barber = BARBERS.find((b) => b.pin === pin);
    if (barber) {
      setSelectedBarber(barber);
      setAuthed(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // PIN Screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-background dark flex flex-col items-center justify-center px-6 gap-6">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
            Barber Login
          </h2>
          <p className="text-sm text-muted-foreground">Enter your 4-digit PIN</p>
        </div>
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="password"
              inputMode="numeric"
              maxLength={1}
              autoFocus={i === 0}
              value={pin[i] || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                const next = pin.split("");
                next[i] = val;
                setPin(next.join(""));
                if (val && i < 3) {
                  const el = e.target.nextElementSibling as HTMLInputElement;
                  el?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !pin[i] && i > 0) {
                  const el = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  el?.focus();
                }
              }}
              className="w-14 h-14 text-center text-xl font-bold bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          ))}
        </div>
        {pinError && <p className="text-destructive text-xs">Invalid PIN. Try again.</p>}
        <button
          onClick={handlePinSubmit}
          disabled={pin.length < 4}
          className="w-full max-w-xs bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition-all"
        >
          Enter
        </button>
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to home
        </button>
      </div>
    );
  }

  // Calendar dashboard
  const getMonday = () => {
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const monday = getMonday();
  const weekDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const getWeekLabel = () => {
    const start = weekDates[0];
    const end = weekDates[5];
    return `${start.getDate()} ${start.toLocaleDateString("en", { month: "short" })} — ${end.getDate()} ${end.toLocaleDateString("en", { month: "short" })}`;
  };

  const barberBookings = bookings.filter((b) => b.barberId === selectedBarber?.id);

  const getBookingsForDay = (date: Date) => {
    const ds = date.toISOString().split("T")[0];
    return barberBookings.filter((b) => b.date === ds);
  };

  const todayBookings = barberBookings.filter(
    (b) => b.date === new Date().toISOString().split("T")[0] && b.status !== "canceled"
  );

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scissors className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-wider text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
              FADE & CO
            </span>
            <span className="text-xs text-muted-foreground border-l border-border pl-3 ml-1">
              {selectedBarber?.name}'s Calendar
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${STATUS_DOT.confirmed}`} /> Confirmed</div>
              <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${STATUS_DOT.uncertain}`} /> Uncertain</div>
              <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${STATUS_DOT.canceled}`} /> Canceled</div>
            </div>
            <button
              onClick={() => { setAuthed(false); setPin(""); }}
              className="h-7 px-2.5 flex items-center gap-1.5 rounded-lg bg-secondary text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-3 flex-1 flex flex-col gap-3">
        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
              <Calendar className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-foreground">{getWeekLabel()}</span>
            </div>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{todayBookings.length}</span> appointments today
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-xl border border-border bg-card overflow-x-auto flex-1">
          <div className="grid min-w-[900px]" style={{ gridTemplateColumns: `60px repeat(${TOTAL_SLOTS}, 1fr)` }}>
            {/* Hour header */}
            <div className="border-r border-b border-border h-8" />
            {HALF_HOUR_SLOTS.map((t, i) => (
              <div key={i} className={`h-8 flex items-end justify-start border-b border-border ${t % 1 === 0 ? "border-l" : ""} pl-1 pb-1`}>
                {t % 1 === 0 && (
                  <span className="text-[9px] font-medium text-muted-foreground">{`${Math.floor(t).toString().padStart(2, "0")}:00`}</span>
                )}
              </div>
            ))}

            {/* Day rows */}
            {weekDates.map((date, dayIdx) => {
              const dayBookings = getBookingsForDay(date);
              const isToday = date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
              const isLast = dayIdx === weekDates.length - 1;

              return (
                <div
                  key={dayIdx}
                  className={`grid min-w-[900px] ${!isLast ? "border-b border-border" : ""}`}
                  style={{
                    gridTemplateColumns: `60px repeat(${TOTAL_SLOTS}, 1fr)`,
                    gridTemplateRows: "1fr",
                    minHeight: "42px",
                  }}
                >
                  {/* Day label */}
                  <div className={`flex flex-col items-center justify-center border-r border-border text-[10px] font-semibold uppercase tracking-wider z-10 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    <span>{DAYS[dayIdx]}</span>
                    <span className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{date.getDate()}</span>
                  </div>

                  {/* Grid lines */}
                  {HALF_HOUR_SLOTS.map((t, i) => (
                    <div key={i} className={t % 1 === 0 ? "border-l border-border" : ""} />
                  ))}

                  {/* Booking overlays */}
                  {dayBookings.map((booking) => {
                    const [bH, bM] = booking.time.split(":").map(Number);
                    const startSlot = (bH - 9) * 2 + Math.round(bM / 30);
                    const durationSlots = Math.round(booking.duration / 30);
                    const colStart = startSlot + 2; // +2: col 1 = day label (1-indexed)
                    const colEnd = colStart + durationSlots;
                    const serviceNames = booking.services.map((sid) => SERVICES.find((s) => s.id === sid)?.name || sid).join(", ");

                    return (
                      <div
                        key={booking.id}
                        className={`bg-secondary border ${STATUS_BORDER[booking.status]} rounded-md flex items-center justify-between px-2 mx-px my-[3px] cursor-default text-foreground hover:brightness-110 transition-all`}
                        style={{
                          gridColumn: `${colStart} / ${colEnd}`,
                          gridRow: 1,
                          zIndex: 5,
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 truncate">
                          <span className={`text-[10px] font-medium truncate ${booking.status === "canceled" ? "line-through opacity-50" : ""}`}>
                            {booking.customerName}
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate">· {serviceNames}</span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 ml-1">
                          <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-4 w-4 flex items-center justify-center rounded hover:bg-muted transition-colors">
                                <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[140px]">
                              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                <User className="h-3 w-3" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                <Phone className="h-3 w-3" />
                                Call Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                                <RefreshCw className="h-3 w-3" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => updateBooking(booking.id, { status: "canceled" })}
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BarberDashboard;
