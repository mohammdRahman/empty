import { useNavigate } from "react-router-dom";
import { Scissors, ArrowRight, Clock, Star, Shield } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            FADE & CO
          </span>
        </div>
        <button
          onClick={() => navigate("/barber")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Barber Login
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Clock className="h-3 w-3" />
            Book in under 60 seconds
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Your next fresh cut,{" "}
            <span className="text-primary">sorted.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
            No app download. No account. Just pick your service, choose a time, and you're booked.
          </p>
        </div>

        <button
          onClick={() => navigate("/book")}
          className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          Book Now
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Trust signals */}
        <div className="flex items-center gap-6 text-muted-foreground text-xs">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span>4.9 rating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>No account needed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Free cancellation</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        © 2026 Fade & Co. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
