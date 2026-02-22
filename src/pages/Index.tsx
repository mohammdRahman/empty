import { useState } from "react";
import { ChevronLeft, ChevronRight, Scissors, Calendar, Clock, Copy, ChevronDown, X, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = 9 + i * 0.25;
  return 9 + Math.floor(i / 4) + (i % 4) * 0.25;
}).filter((_, i) => i < 44);

// Simplified: use 15-min increments from 9:00 to 20:00
const TIME_SLOTS: number[] = [];
for (let h = 9; h < 20; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_SLOTS.push(h + m / 60);
  }
}

function formatTime(t: number) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function isFullHour(t: number) {
  return t % 1 === 0;
}

function formatDuration(d: number) {
  const h = Math.floor(d);
  const m = Math.round((d - h) * 60);
  if (h && m) return `${h}h${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

type BookingStatus = "confirmed" | "uncertain" | "canceled";

type Booking = {
  name: string;
  startTime: number;
  duration: number;
  service: string;
  status: BookingStatus;
};

const STATUS_BORDER: Record<BookingStatus, string> = {
  confirmed: "border-[hsl(145,40%,38%)]",
  uncertain: "border-[hsl(40,55%,45%)]",
  canceled: "border-[hsl(0,45%,45%)]",
};

const MOCK_BOOKINGS: Record<number, Booking[]> = {
  0: [
    { name: "Jake L", startTime: 9, duration: 1.5, service: "Haircut", status: "confirmed" },
    { name: "Caroline J", startTime: 10.75, duration: 1, service: "Beard Trim", status: "uncertain" },
    { name: "Hannah", startTime: 13, duration: 1.25, service: "Full Service", status: "confirmed" },
    { name: "Lucy", startTime: 15, duration: 1, service: "Haircut", status: "canceled" },
    { name: "Matthew", startTime: 17, duration: 1.5, service: "Full Service", status: "confirmed" },
    { name: "Michael A", startTime: 18.75, duration: 1, service: "Beard Trim", status: "confirmed" },
  ],
  1: [
    { name: "Jakob", startTime: 9.5, duration: 2, service: "Full Service", status: "confirmed" },
    { name: "Ana L", startTime: 12, duration: 1.5, service: "Haircut", status: "uncertain" },
    { name: "Omar", startTime: 14.5, duration: 1, service: "Beard Trim", status: "confirmed" },
    { name: "Devon", startTime: 16.5, duration: 1.25, service: "Haircut", status: "confirmed" },
  ],
  2: [
    { name: "Ben M", startTime: 9, duration: 1.5, service: "Beard Trim", status: "confirmed" },
    { name: "Ben M", startTime: 11, duration: 1, service: "Haircut", status: "canceled" },
    { name: "Anders", startTime: 13, duration: 1.5, service: "Full Service", status: "confirmed" },
    { name: "Micky", startTime: 15.5, duration: 1, service: "Haircut", status: "uncertain" },
    { name: "Max", startTime: 17, duration: 1.25, service: "Beard Trim", status: "confirmed" },
    { name: "Lydia S", startTime: 18.5, duration: 1, service: "Full Service", status: "confirmed" },
  ],
  3: [
    { name: "Bryce", startTime: 10, duration: 1.5, service: "Haircut", status: "confirmed" },
    { name: "Omar", startTime: 12.5, duration: 1, service: "Beard Trim", status: "uncertain" },
    { name: "Trey", startTime: 15, duration: 1.5, service: "Full Service", status: "confirmed" },
    { name: "Isaiah", startTime: 17.5, duration: 1, service: "Haircut", status: "canceled" },
  ],
  4: [
    { name: "Chris", startTime: 9, duration: 1.25, service: "Beard Trim", status: "confirmed" },
    { name: "Marcus", startTime: 11, duration: 1.5, service: "Full Service", status: "confirmed" },
    { name: "Kyle", startTime: 13.5, duration: 1, service: "Haircut", status: "uncertain" },
    { name: "Damon", startTime: 15.5, duration: 1.25, service: "Beard Trim", status: "confirmed" },
    { name: "Tom", startTime: 17.5, duration: 1.5, service: "Full Service", status: "confirmed" },
  ],
  5: [
    { name: "James", startTime: 10, duration: 1.5, service: "Haircut", status: "confirmed" },
    { name: "Andre", startTime: 12.5, duration: 1, service: "Beard Trim", status: "confirmed" },
    { name: "Harry", startTime: 14.5, duration: 1.25, service: "Full Service", status: "uncertain" },
    { name: "Malik", startTime: 17, duration: 1, service: "Haircut", status: "confirmed" },
  ],
};

const Index = () => {
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
    return { monday };
  };

  const getWeekLabel = () => {
    const { monday } = getWeekDates();
    const fmt = (d: Date) =>
      `${d.toLocaleString("default", { weekday: "short" })} ${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
    return fmt(monday);
  };

  const slotCount = TIME_SLOTS.length;

  return (
    <div className="min-h-screen bg-[hsl(225,20%,7%)] text-[hsl(220,10%,75%)]">
      {/* Top bar */}
      <header className="border-b border-[hsl(225,15%,13%)] bg-[hsl(225,18%,9%)]">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scissors className="h-4 w-4 text-[hsl(220,10%,50%)]" />
            <span className="text-xs font-medium tracking-wide text-[hsl(220,10%,60%)]">BOOKING TIMETABLE</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-[hsl(225,15%,14%)] transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[hsl(225,15%,12%)] border border-[hsl(225,12%,16%)]">
              <Calendar className="h-3 w-3 text-[hsl(220,10%,45%)]" />
              <span className="text-[11px] font-medium whitespace-nowrap">{getWeekLabel()}</span>
            </div>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="h-6 w-6 flex items-center justify-center rounded hover:bg-[hsl(225,15%,14%)] transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-3">
        {/* Grid */}
        <div className="rounded border border-[hsl(225,12%,13%)] bg-[hsl(225,18%,9%)] overflow-x-auto">
          {/* Time header */}
          <div
            className="grid min-w-[1200px]"
            style={{ gridTemplateColumns: `56px repeat(${slotCount}, 1fr)` }}
          >
            <div className="border-r border-b border-[hsl(225,12%,13%)] h-7" />
            {TIME_SLOTS.map((t, i) => (
              <div
                key={i}
                className={`h-7 flex items-end justify-start border-b border-[hsl(225,12%,13%)] ${
                  isFullHour(t) ? "border-l border-l-[hsl(225,10%,16%)]" : ""
                }`}
              >
                {isFullHour(t) && (
                  <span className="text-[9px] font-medium text-[hsl(220,8%,38%)] pl-1 pb-1 tracking-wide">
                    {formatTime(t)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map((day, dayIdx) => {
            const bookings = MOCK_BOOKINGS[dayIdx] || [];
            const isLast = dayIdx === DAYS.length - 1;

            return (
              <div
                key={day}
                className={`grid min-w-[1200px] ${!isLast ? "border-b border-[hsl(225,12%,11%)]" : ""}`}
                style={{
                  gridTemplateColumns: `56px repeat(${slotCount}, 1fr)`,
                  gridTemplateRows: "1fr",
                  minHeight: "36px",
                  position: "relative",
                }}
              >
                {/* Day label */}
                <div className="flex items-center justify-center border-r border-[hsl(225,12%,13%)] text-[10px] font-semibold text-[hsl(220,8%,35%)] uppercase tracking-wider z-10">
                  {day.slice(0, 3)}
                </div>

                {/* Background grid lines */}
                {TIME_SLOTS.map((t, i) => (
                  <div
                    key={i}
                    className={`${isFullHour(t) ? "border-l border-[hsl(225,10%,12%)]" : ""}`}
                  />
                ))}

                {/* Booking overlays */}
                {bookings.map((booking, bi) => {
                  const startSlot = TIME_SLOTS.findIndex((t) => Math.abs(t - booking.startTime) < 0.01);
                  const durationSlots = Math.round(booking.duration * 4);
                  if (startSlot < 0) return null;

                  const colStart = startSlot + 2; // +2 because col 1 is the day label (1-indexed)
                  const colEnd = colStart + durationSlots;

                  return (
                    <div
                      key={bi}
                      className={`bg-[hsl(225,12%,15%)] border ${STATUS_BORDER[booking.status]} rounded-sm flex items-center justify-between px-2 py-0 mx-px my-[3px] cursor-default text-[hsl(220,10%,72%)] hover:bg-[hsl(225,12%,17%)] transition-colors`}
                      style={{
                        gridColumn: `${colStart} / ${colEnd}`,
                        gridRow: 1,
                        zIndex: 5,
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className={`text-[10px] font-medium truncate ${booking.status === "canceled" ? "line-through opacity-50" : ""}`}>{booking.name}</span>
                        <span className="text-[9px] text-[hsl(220,8%,40%)] truncate">· {booking.service}</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        <Copy className="h-2.5 w-2.5 text-[hsl(220,8%,35%)]" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-4 w-4 flex items-center justify-center rounded hover:bg-[hsl(225,12%,22%)] transition-colors">
                              <ChevronDown className="h-2.5 w-2.5 text-[hsl(220,8%,35%)]" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[140px] bg-[hsl(225,18%,12%)] border-[hsl(225,12%,20%)] text-[hsl(220,10%,75%)]">
                            <DropdownMenuItem className="text-xs gap-2 cursor-pointer focus:bg-[hsl(225,12%,18%)] focus:text-[hsl(220,10%,85%)]">
                              <RefreshCw className="h-3 w-3" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-[hsl(0,45%,55%)] focus:bg-[hsl(0,20%,15%)] focus:text-[hsl(0,50%,65%)]">
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
      </main>
    </div>
  );
};

export default Index;
