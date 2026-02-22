import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Phone, Scissors, User, Calendar, Clock } from "lucide-react";
import { SERVICES, BARBERS, TIME_SLOTS, KNOWN_CUSTOMERS, type Service } from "@/data/mockData";
import { useBookings } from "@/context/BookingContext";

type Step = "phone" | "otp" | "details" | "services" | "barber" | "time" | "confirm";

const STEPS: Step[] = ["phone", "otp", "details", "services", "barber", "time", "confirm"];

const BookingFlow = () => {
  const navigate = useNavigate();
  const { addBooking, bookings } = useBookings();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booked, setBooked] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].toISOString().split("T")[0]);
    }
  }, []);

  const totalDuration = selectedServices.reduce((sum, id) => {
    const s = SERVICES.find((sv) => sv.id === id);
    return sum + (s?.duration || 0);
  }, 0);

  const totalPrice = selectedServices.reduce((sum, id) => {
    const s = SERVICES.find((sv) => sv.id === id);
    return sum + (s?.price || 0);
  }, 0);

  const getAvailableSlots = () => {
    if (!selectedBarber || !selectedDate) return TIME_SLOTS;
    const barberBookings = bookings.filter(
      (b) => b.barberId === selectedBarber && b.date === selectedDate && b.status !== "canceled"
    );
    return TIME_SLOTS.filter((slot) => {
      const slotMin = parseInt(slot.split(":")[0]) * 60 + parseInt(slot.split(":")[1]);
      return !barberBookings.some((b) => {
        const bMin = parseInt(b.time.split(":")[0]) * 60 + parseInt(b.time.split(":")[1]);
        return slotMin >= bMin && slotMin < bMin + b.duration;
      });
    });
  };

  const handlePhoneSubmit = () => {
    if (phone.length >= 7) setStep("otp");
  };

  const handleOtpSubmit = () => {
    const code = otp.join("");
    if (code.length === 4) {
      const known = KNOWN_CUSTOMERS.find((c) => c.phone === phone);
      if (known) {
        setName(known.name);
        setIsReturning(true);
        setStep("services"); // skip details
      } else {
        setStep("details");
      }
    }
  };

  const handleDetailsSubmit = () => {
    if (name.trim()) setStep("services");
  };

  const handleServicesNext = () => {
    if (selectedServices.length > 0) setStep("barber");
  };

  const handleBarberNext = () => {
    if (selectedBarber) setStep("time");
  };

  const handleBook = () => {
    const id = `bk_${Date.now()}`;
    addBooking({
      id,
      customerName: name,
      customerPhone: phone,
      barberId: selectedBarber,
      services: selectedServices,
      date: selectedDate,
      time: selectedTime,
      duration: totalDuration,
      status: "confirmed",
    });
    setBooked(true);
  };

  const stepIndex = STEPS.indexOf(step);
  const adjustedSteps = isReturning ? STEPS.filter((s) => s !== "details") : STEPS;
  const progress = ((adjustedSteps.indexOf(step) + 1) / adjustedSteps.length) * 100;

  if (booked) {
    const barber = BARBERS.find((b) => b.id === selectedBarber);
    return (
      <div className="min-h-screen bg-background dark flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>You're booked!</h2>
          <p className="text-muted-foreground text-sm">
            {selectedDate} at {selectedTime} with {barber?.name}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 w-full max-w-xs text-left space-y-2">
          {selectedServices.map((id) => {
            const s = SERVICES.find((sv) => sv.id === id);
            return (
              <div key={id} className="flex justify-between text-sm">
                <span className="text-foreground">{s?.name}</span>
                <span className="text-muted-foreground">${s?.price}</span>
              </div>
            );
          })}
          <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">${totalPrice}</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => {
            if (step === "phone") navigate("/");
            else {
              const idx = adjustedSteps.indexOf(step);
              if (idx > 0) setStep(adjustedSteps[idx - 1]);
            }
          }}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-6 max-w-lg mx-auto w-full">
        {/* Phone step */}
        {step === "phone" && (
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
                What's your number?
              </h2>
              <p className="text-sm text-muted-foreground">We'll send a quick code to verify.</p>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
            <button
              onClick={handlePhoneSubmit}
              disabled={phone.length < 7}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
                Enter the code
              </h2>
              <p className="text-sm text-muted-foreground">Sent to {phone}</p>
            </div>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const next = [...otp];
                    next[i] = val;
                    setOtp(next);
                    if (val && i < 3) {
                      const el = e.target.nextElementSibling as HTMLInputElement;
                      el?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      const el = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      el?.focus();
                    }
                  }}
                  className="w-14 h-14 text-center text-xl font-semibold bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              ))}
            </div>
            <button
              onClick={handleOtpSubmit}
              disabled={otp.join("").length < 4}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition-all"
            >
              Verify
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Didn't get a code?{" "}
              <button className="text-primary hover:underline">Resend</button>
            </p>
          </div>
        )}

        {/* Details step (new customers only) */}
        {step === "details" && (
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
                What's your name?
              </h2>
              <p className="text-sm text-muted-foreground">So your barber knows who you are.</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
            <button
              onClick={handleDetailsSubmit}
              disabled={!name.trim()}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Services step */}
        {step === "services" && (
          <div className="flex-1 flex flex-col gap-5">
            <div className="space-y-1 pt-2">
              {isReturning && (
                <p className="text-xs text-primary font-medium">Welcome back, {name}! 👋</p>
              )}
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
                What do you need?
              </h2>
              <p className="text-sm text-muted-foreground">Pick one or more services.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES.map((s) => {
                const isSelected = selectedServices.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() =>
                      setSelectedServices((prev) =>
                        isSelected ? prev.filter((x) => x !== s.id) : [...prev, s.id]
                      )
                    }
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <p className="text-sm font-semibold text-foreground mt-2">{s.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{s.duration}min</span>
                      <span className="text-xs font-semibold text-primary">${s.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-auto pt-4 space-y-3">
                <div className="flex justify-between text-sm px-1">
                  <span className="text-muted-foreground">{totalDuration}min · {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""}</span>
                  <span className="font-semibold text-primary">${totalPrice}</span>
                </div>
                <button
                  onClick={handleServicesNext}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Choose barber <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Barber step */}
        {step === "barber" && (
          <div className="flex-1 flex flex-col gap-5">
            <div className="space-y-1 pt-2">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
                Pick your barber
              </h2>
            </div>
            <div className="space-y-3">
              {BARBERS.map((b) => {
                const isSelected = selectedBarber === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBarber(b.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
                      {b.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.title}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedBarber && (
              <button
                onClick={handleBarberNext}
                className="mt-auto w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Pick a time <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Time step */}
        {step === "time" && (
          <div className="flex-1 flex flex-col gap-5">
            <div className="space-y-1 pt-2">
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
                When works for you?
              </h2>
            </div>

            {/* Date picker */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {dates.map((d) => {
                const ds = d.toISOString().split("T")[0];
                const isSelected = selectedDate === ds;
                const isToday = ds === new Date().toISOString().split("T")[0];
                return (
                  <button
                    key={ds}
                    onClick={() => { setSelectedDate(ds); setSelectedTime(""); }}
                    className={`flex flex-col items-center min-w-[56px] py-2.5 px-2 rounded-xl border transition-all shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      {isToday ? "Today" : d.toLocaleDateString("en", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-bold text-foreground">{d.getDate()}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {d.toLocaleDateString("en", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            <div className="grid grid-cols-3 gap-2">
              {getAvailableSlots().map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            {selectedTime && (
              <button
                onClick={() => setStep("confirm")}
                className="mt-auto w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Review booking <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Confirm step */}
        {step === "confirm" && (
          <div className="flex-1 flex flex-col gap-5 justify-center">
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
              Looking good ✨
            </h2>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{selectedDate}</span>
                <Clock className="h-4 w-4 text-primary ml-2" />
                <span className="text-sm text-foreground">{selectedTime}</span>
              </div>

              <div className="flex items-center gap-3">
                <Scissors className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">
                  {BARBERS.find((b) => b.id === selectedBarber)?.name}
                </span>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                {selectedServices.map((id) => {
                  const s = SERVICES.find((sv) => sv.id === id);
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-foreground">{s?.name}</span>
                      <span className="text-muted-foreground">${s?.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-3 flex justify-between text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${totalPrice}</span>
              </div>
            </div>

            <button
              onClick={handleBook}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all text-base"
            >
              Confirm Booking
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingFlow;
