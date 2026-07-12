// src/app/page.tsx - Landing page, comic edition (yellow/gray, hard shadows, tilted frames)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  // CheckCircle, // used only by the hidden feature checklist
  Clock,
  Mail,
  TrendingUp,
  Users,
  Sparkles,
  Zap,
  Shield,
  Target,
  ArrowRight,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import HeroMoneyArt from "@/components/HeroMoneyArt";
import ComicCloud from "@/components/ComicCloud";
import MoneyThrower from "@/components/MoneyThrower";

// Comic logo mark — yellow square, ink border, hard shadow
const LogoMark = ({ size = "w-10 h-10" }: { size?: string }) => (
  <div
    className={`${size} bg-yellow border-[2.5px] border-ink comic-shadow-sm flex items-center justify-center flex-shrink-0`}
  >
    <IndianRupee className="h-5 w-5 text-ink" strokeWidth={2.75} />
  </div>
);

// Solid comic navbar — no frosted glass, just paper + ink rule.
const DynamicNavbar = () => {
  const { user, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 30;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`hero-nav fixed top-0 left-0 right-0 z-50 bg-paper border-b-[2.5px] border-ink transition-shadow duration-200 ${
        isScrolled ? "shadow-[0_4px_0_0_var(--ink)]" : ""
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <LogoMark />
            <span className="font-display font-extrabold text-xl sm:text-2xl text-ink tracking-tight">
              Fynl-It
            </span>
          </Link>

          {/* Navigation */}
          {loading ? (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-9 w-16 bg-gray-panel border-2 border-ink" />
              <div className="h-9 w-24 bg-gray-panel border-2 border-ink" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:block font-mono text-xs text-muted-foreground">
                Hi, {getUserDisplayName()}!
              </span>
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Main Landing Page Component
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (!loading && user) {
    return (
      <div className="min-h-screen bg-paper comic-paper-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-[3px] border-ink bg-yellow animate-spin [animation-duration:1.2s]" />
          <div>
            <h3 className="font-display font-bold text-lg">Welcome back!</h3>
            <p className="font-mono text-sm text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-load min-h-screen bg-white overflow-hidden">
      <DynamicNavbar />

      {/* ===== Hero ===== */}
      {/* Starts pure white; the theme paper color then the dots paint on. */}
      <section className="hero-load relative bg-white pt-28 sm:pt-32 pb-16 sm:pb-20 lg:min-h-screen lg:flex lg:items-center overflow-hidden">
        {/* Layer 1 — the theme paper color paints in diagonally over white. */}
        <div className="hero-wash absolute inset-0 z-0" aria-hidden="true" />
        {/* Layer 2 — dotted paper texture paints in diagonally, after the wash. */}
        <div className="hero-bg-layer comic-paper-bg absolute inset-0 z-0" aria-hidden="true" />
        {/* Money-thrower machine + flying bills — fades in after the paint,
            then starts firing (bills gated by .hero-load, see MoneyThrower). */}
        <div className="hero-machine absolute inset-0 z-0" aria-hidden="true">
          <MoneyThrower />
        </div>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Mobile layout */}
            <div className="block lg:hidden space-y-10">
              <div className="z-10 relative text-center flex flex-col items-center">
                <span className="hero-pop comic-sticker comic-sticker--yellow tilt-l" style={{ "--pop-i": 0 } as React.CSSProperties}>
                  <Zap className="h-3 w-3" />
                  AI-Powered Payment Recovery
                </span>

                {/* Fixed clearance below the eyebrow so the cloud's top lobes
                    never crowd it — consistent on every screen. */}
                <ComicCloud tail="right" className="hero-pop max-w-2xl mt-8" style={{ "--pop-i": 1 } as React.CSSProperties}>
                  <h1 className="text-ink text-[1.6rem] sm:text-[2.2rem]">
                    <span className="block whitespace-nowrap">
                      Never chase clients
                    </span>
                    <span className="block whitespace-nowrap mt-2">
                      <span className="relative inline-block bg-yellow border-[3px] border-ink px-2 comic-shadow-sm -rotate-1">
                        for payment
                      </span>{" "}
                      again
                    </span>
                  </h1>
                </ComicCloud>
              </div>

              <div className="hero-pop relative z-10 px-2" style={{ "--pop-i": 2 } as React.CSSProperties}>
                <HeroMoneyArt />
              </div>

              <div className="space-y-8 z-10 relative text-center">
                {/* Spacer preserves the gap the hidden subtext used to occupy */}
                <div aria-hidden="true" className="h-8" />
                {/* Subtext hidden per request
                <p className="hero-pop text-lg text-ink-soft leading-relaxed px-2" style={{ "--pop-i": 3 } as React.CSSProperties}>
                  Upload your invoice →{" "}
                  <span className="font-bold text-ink">
                    AI sends professional reminders
                  </span>{" "}
                  → <span className="font-bold text-ink">Get paid faster</span>
                  .
                  <span className="block mt-3 font-mono text-sm font-bold uppercase tracking-wide">
                    100% free. No credit card needed.
                  </span>
                </p>
                */}

                <div className="hero-pop flex flex-col items-center justify-center gap-3" style={{ "--pop-i": 4 } as React.CSSProperties}>
                  <Link href="/auth">
                    <Button
                      size="lg"
                      variant="gradient"
                      className="w-full sm:w-auto gap-2 text-base px-8"
                    >
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 lg:items-center">
              <div className="space-y-8 z-10 relative">
                <span className="hero-pop comic-sticker comic-sticker--yellow tilt-l inline-flex" style={{ "--pop-i": 0 } as React.CSSProperties}>
                  <Zap className="h-3 w-3" />
                  AI-Powered Payment Recovery
                </span>

                <ComicCloud
                  tail="right"
                  className="hero-pop -ml-6 lg:w-[118%] xl:w-[112%] relative z-20"
                  style={{ "--pop-i": 1 } as React.CSSProperties}
                >
                  <h1 className="text-ink lg:text-[2.9rem] xl:text-[3.3rem]">
                    <span className="block whitespace-nowrap">
                      Never chase clients
                    </span>
                    <span className="block whitespace-nowrap mt-2">
                      <span className="relative inline-block bg-yellow border-[3px] border-ink px-3 comic-shadow -rotate-1">
                        for payment
                      </span>{" "}
                      again
                    </span>
                  </h1>
                </ComicCloud>

                {/* Spacer preserves the gap the hidden subtext used to occupy */}
                <div aria-hidden="true" className="h-16" />
                {/* Subtext hidden per request
                <p className="hero-pop text-xl text-ink-soft leading-relaxed max-w-xl" style={{ "--pop-i": 3 } as React.CSSProperties}>
                  Upload your invoice →{" "}
                  <span className="font-bold text-ink">
                    AI sends professional reminders
                  </span>{" "}
                  → <span className="font-bold text-ink">Get paid faster</span>
                  .
                  <span className="block mt-3 font-mono text-sm font-bold uppercase tracking-wide">
                    100% free. No credit card needed.
                  </span>
                </p>
                */}

                <div className="hero-pop flex flex-col gap-4" style={{ "--pop-i": 4 } as React.CSSProperties}>
                  <Link href="/auth">
                    <Button
                      size="lg"
                      variant="gradient"
                      className="gap-2 text-base px-12"
                    >
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Feature checklist hidden per request
                <div className="hero-pop grid grid-cols-2 gap-3 pt-4 max-w-md" style={{ "--pop-i": 5 } as React.CSSProperties}>
                  {[
                    "AI Invoice Processing",
                    "UPI Payment Links",
                    "Smart Reminders",
                    "Payment Tracking",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-yellow border-2 border-ink flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-ink" />
                      </span>
                      <span className="font-mono text-xs font-bold uppercase tracking-wide text-ink-soft">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                */}
              </div>

              <div className="hero-pop relative z-10 pt-8" style={{ "--pop-i": 2 } as React.CSSProperties}>
                <HeroMoneyArt />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Why Fynl-It — tilted stat stickers on gray band ===== */}
      <section className="py-16 sm:py-20 bg-gray-panel border-y-[2.5px] border-ink relative">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div className="space-y-8">
                <div className="flex flex-col items-start">
                  <span className="comic-sticker inline-flex">
                    <Shield className="h-3 w-3" />
                    Built for Freelancers
                  </span>
                  {/* Clearance below the sticker so the cloud's top lobes never
                      crowd it — matches the hero's eyebrow→cloud spacing. */}
                  <ComicCloud className="mb-4 mt-8">
                    <h2 className="text-ink">
                      Why choose{" "}
                      <span className="inline-block bg-yellow border-[3px] border-ink px-2 rotate-1">
                        Fynl-It
                      </span>
                      ?
                    </h2>
                  </ComicCloud>
                  <p className="text-lg text-ink-soft">
                    Designed specifically for Indian freelancers who want to
                    get paid faster without damaging client relationships.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Sparkles,
                      title: "AI-Powered Messages",
                      text: "Professional reminders that maintain client relationships",
                    },
                    {
                      icon: IndianRupee,
                      title: "UPI Instant Payments",
                      text: "QR codes and payment links for immediate collection",
                    },
                    {
                      icon: Clock,
                      title: "Automatic Follow-ups",
                      text: "Never miss a payment reminder again",
                    },
                    {
                      icon: Shield,
                      title: "Relationship Safe",
                      text: "Professional tone that preserves client trust",
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow border-2 border-ink flex items-center justify-center flex-shrink-0 mt-1">
                        <Icon className="h-4 w-4 text-ink" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold mb-1">
                          {title}
                        </h3>
                        <p className="text-sm text-ink-soft">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tilted stat cards */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="comic-panel tilt-l tilt-straighten p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-yellow border-2 border-ink flex items-center justify-center">
                          <Zap className="h-4 w-4 text-ink" />
                        </div>
                        <span className="font-display font-extrabold text-lg">
                          85% Faster
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Payment collection vs. manual follow-ups
                      </p>
                    </div>

                    <div className="comic-panel tilt-r tilt-straighten p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gray-panel border-2 border-ink flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-ink" />
                        </div>
                        <span className="font-display font-extrabold text-lg">
                          10 Hours
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Saved per month per freelancer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-5 pt-8">
                    <div className="comic-panel tilt-r tilt-straighten p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gray-panel border-2 border-ink flex items-center justify-center">
                          <Shield className="h-4 w-4 text-ink" />
                        </div>
                        <span className="font-display font-extrabold text-lg">
                          99.9%
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Uptime with reliable email delivery
                      </p>
                    </div>

                    <div className="comic-panel tilt-l tilt-straighten p-4 bg-yellow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-paper-panel border-2 border-ink flex items-center justify-center">
                          <Target className="h-4 w-4 text-ink" />
                        </div>
                        <span className="font-display font-extrabold text-lg">
                          Zero Effort
                        </span>
                      </div>
                      <p className="font-mono text-xs text-ink">
                        Set once, works automatically forever
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it works — 3 numbered comic panels ===== */}
      <section className="py-16 sm:py-20 lg:py-24 comic-paper-bg relative">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-12 lg:mb-16 flex flex-col items-center">
            <span className="comic-sticker comic-sticker--yellow inline-flex">
              <Sparkles className="h-3 w-3" />
              How It Works
            </span>
            {/* Clearance below the sticker so the cloud's top lobes never crowd it. */}
            <ComicCloud className="mb-4 mt-8">
              <h2 className="text-ink">Simple. Automated. Professional.</h2>
            </ComicCloud>
            <p className="text-lg text-ink-soft max-w-2xl mx-auto px-4">
              Everything happens automatically while maintaining your
              professional relationships.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                n: "1",
                icon: Mail,
                tilt: "tilt-l",
                title: "Add your invoice",
                text: "Upload via AI scanner or enter details manually. We generate UPI payment links automatically.",
              },
              {
                n: "2",
                icon: Zap,
                tilt: "tilt-r",
                title: "Auto follow-ups",
                text: "AI-powered reminders that get progressively more assertive. Professional tone that preserves relationships.",
              },
              {
                n: "3",
                icon: TrendingUp,
                tilt: "tilt-l",
                title: "Get paid faster",
                text: "Instant UPI payments with QR codes. Auto-detection stops reminders and sends thank you notes.",
              },
            ].map(({ n, icon: Icon, tilt, title, text }, i) => (
              <div
                key={n}
                className={`comic-panel ${tilt} tilt-straighten p-6 text-center relative ${
                  i === 2 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Step number chip — the sequence is real information */}
                <div className="absolute -top-4 -left-3 w-9 h-9 bg-yellow border-[2.5px] border-ink comic-shadow-sm flex items-center justify-center">
                  <span className="font-display font-extrabold text-lg text-ink">
                    {n}
                  </span>
                </div>
                <div className="w-14 h-14 bg-gray-panel border-[2.5px] border-ink flex items-center justify-center mx-auto mb-5 mt-2">
                  <Icon className="h-7 w-7 text-ink" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">
                  {title}
                </h3>
                <p className="text-sm text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Founder + CTA ===== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-panel border-y-[2.5px] border-ink relative">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              {/* Founder story — speech bubble */}
              <div className="comic-bubble p-6 sm:p-8 mb-6 lg:mb-0">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-[2.5px] border-ink overflow-hidden flex-shrink-0 comic-shadow-sm -rotate-2">
                    <Image
                      src="https://pbs.twimg.com/profile_images/2019910949482975232/-vPVNpC6_400x400.jpg"
                      alt="Rohit - Founder & Developer"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold mb-1">
                      Built by a freelancer, for freelancers
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                      Rohit • Founder & Developer
                    </p>
                  </div>
                </div>
                <blockquote className="text-sm sm:text-base text-ink-soft leading-relaxed mb-5">
                  &quot;I was spending 5+ hours every month writing awkward
                  &apos;gentle reminder&apos; emails to clients. It was
                  affecting my relationships and my cash flow. So I built this
                  tool to automate the process professionally.&quot;
                </blockquote>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="https://x.com/rohiitcodes">
                      <Mail className="h-4 w-4" />
                      Contact Founder
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a
                      href="https://chat.whatsapp.com/ISXLzprKTWdJjiv4dOaS2F?mode=ac_t"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Users className="h-4 w-4" />
                      Join Community
                    </a>
                  </Button>
                </div>
              </div>

              {/* Main CTA */}
              <div className="text-center lg:text-left space-y-6">
                <ComicCloud tail="left" className="-ml-4">
                  <h2 className="text-ink">
                    Ready to stop chasing{" "}
                    <span className="inline-block bg-yellow border-[3px] border-ink px-2 -rotate-1">
                      payments
                    </span>
                    ?
                  </h2>
                </ComicCloud>
                {/* Spacer preserves the gap the hidden subtext used to occupy */}
                <div aria-hidden="true" className="h-10" />
                {/* CTA subtext hidden per request
                <p className="text-base sm:text-lg text-ink-soft">
                  Join our early community of freelancers who are building this
                  together. Your feedback shapes the product.
                </p>
                */}
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="gradient"
                    className="w-full lg:w-auto gap-2 text-base px-12"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-paper">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <LogoMark />
                <span className="font-display text-lg font-extrabold text-ink">
                  Fynl-It
                </span>
              </div>

              <p className="font-mono text-xs text-muted-foreground text-center sm:text-left">
                © 2025 Fynl-It. Built for Indian freelancers who deserve to
                get paid on time.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
