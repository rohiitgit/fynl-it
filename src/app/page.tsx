// src/app/page.tsx - Fully Responsive Landing Page with Image Preview for Small Screens
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  TrendingUp,
  Users,
  Bell,
  Sparkles,
  Zap,
  Shield,
  Target,
  ArrowRight,
  FileText,
  CreditCard,
  MessageCircle,
  Calendar,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";

// Floating elements data
const floatingElements = [
  {
    icon: DollarSign,
    delay: 0,
    duration: 6,
    position: { top: "20%", left: "10%" },
  },
  {
    icon: FileText,
    delay: 1,
    duration: 8,
    position: { top: "60%", left: "85%" },
  },
  { icon: Mail, delay: 2, duration: 7, position: { top: "40%", left: "15%" } },
  {
    icon: CreditCard,
    delay: 3,
    duration: 9,
    position: { top: "70%", left: "75%" },
  },
  {
    icon: MessageCircle,
    delay: 1.5,
    duration: 6.5,
    position: { top: "30%", left: "80%" },
  },
  {
    icon: Calendar,
    delay: 4,
    duration: 8,
    position: { top: "80%", left: "20%" },
  },
  {
    icon: Sparkles,
    delay: 2.5,
    duration: 7.5,
    position: { top: "15%", left: "70%" },
  },
  {
    icon: Target,
    delay: 0.5,
    duration: 9,
    position: { top: "50%", left: "5%" },
  },
];

// Floating element component
const FloatingElement = ({
  icon: Icon,
  delay,
  duration,
  position,
}: {
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
  duration: number;
  position: { top: string; left: string };
}) => {
  return (
    <div
      className="absolute opacity-20 text-green-500 pointer-events-none hidden xl:block"
      style={{
        ...position,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
    </div>
  );
};

// Dynamic Navbar Component with Attractive Scroll Transformations
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
      const scrolled = window.scrollY > 30; // Trigger earlier for smoother feel
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 will-change-transform">
      <div
        className={`container mx-auto transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu ${isScrolled ? "px-3 sm:px-4 py-1.5" : "px-3 sm:px-4 py-4 sm:py-6"
          }`}
      >
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu will-change-transform ${isScrolled
            ? "bg-card/95 backdrop-blur-xl border border-border/60 rounded-full px-4 sm:px-5 lg:px-7 py-2.5 sm:py-3.5 mx-auto max-w-4xl shadow-xl shadow-green-500/25"
            : "bg-transparent backdrop-blur-none border-transparent rounded-none px-0 py-0 shadow-none"
            }`}
        >
          <div
            className={`transform-gpu transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${isScrolled
              ? "translate-y-0 scale-100"
              : "translate-y-0 scale-100"
              }`}
          >
            <div className="flex items-center justify-between">
              {/* Logo with Smooth Scaling */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                <div
                  className={`transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu origin-center ${isScrolled ? "scale-95" : "scale-100"
                    }`}
                >
                  <div className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${isScrolled ? "w-10 h-10" : "w-12 h-12"}`}>
                    <DollarSign className={`text-white transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${isScrolled ? "h-5 w-5" : "h-7 w-7"}`} />
                  </div>
                </div>

                <span
                  className={`font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu origin-left ${isScrolled
                    ? "text-lg sm:text-xl scale-98"
                    : "text-xl sm:text-2xl scale-100"
                    }`}
                >
                  Fynl-It
                </span>
              </div>

              {/* Navigation Items with Smooth Transitions */}
              <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu ${isScrolled
                  ? "translate-x-0 opacity-100"
                  : "translate-x-0 opacity-100"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2 animate-pulse">
                    <div
                      className={`bg-muted rounded transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${isScrolled
                        ? "h-8 w-12 sm:h-8 sm:w-14"
                        : "h-9 w-16 sm:h-9 sm:w-18"
                        }`}
                    ></div>
                    <div
                      className={`bg-muted rounded transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${isScrolled
                        ? "h-8 w-16 sm:h-8 sm:w-18"
                        : "h-9 w-20 sm:h-9 sm:w-22"
                        }`}
                    ></div>
                  </div>
                ) : user ? (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span
                      className={`text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] hidden sm:block ${isScrolled ? "text-sm" : "text-sm"
                        }`}
                    >
                      Hi, {getUserDisplayName()}!
                    </span>
                    <Link href="/dashboard">
                      <Button
                        size={isScrolled ? "sm" : "default"}
                        variant="gradient"
                        className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu hover:scale-105 active:scale-95"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size={isScrolled ? "sm" : "default"}
                      onClick={signOut}
                      className={`text-xs sm:text-sm px-2 sm:px-3 lg:px-4 transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu hover:scale-105 active:scale-95 ${isScrolled ? "hover:bg-accent/80" : "hover:bg-accent/60"
                        }`}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Link href="/auth">
                      <Button
                        variant="ghost"
                        size={isScrolled ? "sm" : "default"}
                        className={`text-xs sm:text-sm px-2 sm:px-3 lg:px-4 transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu hover:scale-105 active:scale-95 ${isScrolled
                          ? "hover:bg-accent/80"
                          : "hover:bg-accent/60"
                          }`}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button
                        size={isScrolled ? "sm" : "default"}
                        variant="gradient"
                        className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] transform-gpu hover:scale-105 active:scale-95"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Enhanced Responsive Dashboard Preview Component
const DashboardPreview = () => {
  return (
    <div className="relative w-full">
      <div className="relative mx-auto max-w-3xl lg:max-w-4xl">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl sm:rounded-2xl blur-xl sm:blur-2xl"></div>

        {/* Main container */}
        <div className="relative bg-card/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl shadow-black/10 border border-border/20 overflow-hidden">
          {/* Mobile & Tablet Layout (xs to lg) - Use Image */}
          <div className="block lg:hidden">
            <div className="relative">
              {/* Image container with responsive aspect ratio */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9]">
                {/* You can replace this with your actual dashboard image */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  {/* Mobile Dashboard Mock Image Layout */}
                  <div className="h-full flex flex-col space-y-3 sm:space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/*<div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold">
                          Fynl-It Dashboard
                        </span>*/}
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                        {/*<span className="text-xs text-muted-foreground">
                          Live
                        </span>*/}
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-card/80 rounded-lg p-2 sm:p-3 border border-border/30">
                        <p className="text-xs text-muted-foreground">
                          This Month
                        </p>
                        <p className="text-lg sm:text-xl font-bold">₹1.25L</p>
                        <p className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +23%
                        </p>
                      </div>
                      <div className="bg-card/80 rounded-lg p-2 sm:p-3 border border-border/30">
                        <p className="text-xs text-muted-foreground">
                          Collection Rate
                        </p>
                        <p className="text-lg sm:text-xl font-bold">87%</p>
                        <div className="w-full bg-border rounded-full h-1.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500/80 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: "87%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Invoice List */}
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between bg-card/80 rounded-lg p-2 sm:p-3 border border-border/30">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs sm:text-sm truncate">
                              Sarah Chen
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              INV-001
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-lg font-bold">₹45K</p>
                          <Badge className="bg-success/10 text-success border-success/20 text-xs relative">
                            <div className="absolute inset-0 pattern-dots text-success/20"></div>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-card/80 rounded-lg p-2 sm:p-3 border border-border/30">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs sm:text-sm truncate">
                              Tech Startup
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              INV-002
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-lg font-bold">₹25K</p>
                          <Badge className="bg-warning/10 text-warning border-warning/20 text-xs relative">
                            <div className="absolute inset-0 pattern-diagonal text-warning/20"></div>
                            <Clock className="h-3 w-3 mr-1" />
                            Due
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating notification */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-500 text-white rounded-lg shadow-lg shadow-primary/30 flex items-center gap-1 sm:gap-2 animate-bounce z-20 px-2 py-1 sm:px-3 sm:py-2 max-w-[100px] sm:max-w-[120px]">
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs font-medium truncate">
                      Payment!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout (lg+) - Keep the existing complex layout */}
          <div className="hidden lg:block p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Left side: Invoice Cards (2/3 width) */}
              <div className="col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Sarah Chen</p>
                        <p className="text-sm text-muted-foreground">
                          Invoice #INV-001
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹45,000</p>
                      <Badge className="bg-success/10 text-success border-success/20 relative">
                        <div className="absolute inset-0 pattern-dots text-success/20"></div>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Tech Startup</p>
                        <p className="text-sm text-muted-foreground">
                          Invoice #INV-002
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹25,000</p>
                      <Badge className="bg-warning/10 text-warning border-warning/20 relative">
                        <div className="absolute inset-0 pattern-diagonal text-warning/20"></div>
                        <Clock className="h-3 w-3 mr-1" />
                        Due
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Design Agency</p>
                        <p className="text-sm text-muted-foreground">
                          Invoice #INV-003
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹75,000</p>
                      <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 relative">
                        <div className="absolute inset-0 pattern-dots text-chart-2/20"></div>
                        <Mail className="h-3 w-3 mr-1" />
                        Sent
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: Analytics (1/3 width) */}
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold">₹1,25,000</p>
                  <p className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4" />
                    +23% from last month
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">
                      Collection Rate
                    </p>
                    <p className="text-sm font-bold text-foreground p-1">87%</p>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500/80 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: "87%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Above industry average
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification - Only show on desktop */}
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-lg shadow-lg shadow-primary/30 items-center gap-2 animate-bounce z-20 px-3 py-2 max-w-[120px] hidden lg:flex">
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">Payment!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Landing Page Component
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500/20 border-t-green-500"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-green-600">
              Loading...
            </h3>
            <p className="text-muted-foreground">
              Checking your session
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500/20 border-t-green-500"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              Welcome back!
            </h3>
            <p className="text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary overflow-hidden">
      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-15px) rotate(3deg);
          }
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2);
          }
          50% {
            box-shadow: 0 10px 40px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.4);
          }
        }
        .glow-button {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Dynamic Navbar */}
      <DynamicNavbar />

      {/* Hero Section with Floating Elements */}
      {/*<section className="relative pt-16 sm:pt-20 lg:pt-24 xl:pt-32 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">*/}
      <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 lg:min-h-screen lg:flex lg:items-center lg:pt-0 lg:pb-0 overflow-hidden">
        {/* Floating Elements - Hidden on mobile and tablet */}
        {floatingElements.map((element, index) => (
          <FloatingElement key={index} {...element} />
        ))}

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 sm:opacity-20 lg:opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(var(--primary), 0.1) 1px, transparent 0)`,
              backgroundSize: "20px 20px sm:30px 30px lg:40px 40px",
            }}
          />
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout: Stack vertically */}
            <div className="block lg:hidden space-y-8 sm:space-y-10">
              {/* Mobile: Hero Badge and Heading First */}
              <div className="space-y-4 sm:space-y-6 z-10 relative text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-green-500 border border-green-600 rounded-full">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-white">
                    AI-Powered Payment Recovery
                  </span>
                </div>

                {/* Main Heading - Using fluid typography */}
                <h1 className="font-bold text-foreground leading-tight">
                  Never Chase Clients for
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent block">
                    Payment Again
                  </span>
                </h1>
              </div>

              {/* Mobile: Dashboard Preview Second */}
              <div className="relative z-10">
                <DashboardPreview />
              </div>

              {/* Mobile: Subheading and CTAs Third */}
              <div className="space-y-6 sm:space-y-8 z-10 relative text-center">
                {/* Subheading - Improved readability */}
                <p className="text-lg text-muted-foreground leading-relaxed px-2">
                  Upload your invoice → <span className="font-semibold text-foreground">AI sends professional reminders</span> → <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent font-semibold">Get paid faster</span>.
                  <span className="block mt-3 font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                    100% Free. No credit card needed.
                  </span>
                </p>

                {/* Progressive CTA Strategy */}
                {user ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        variant="gradient"
                        className="w-full sm:w-auto gap-2 text-lg px-8 py-4"
                      >
                        Go to Dashboard
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3">
                    {/* Primary CTA */}
                    <Link href="/auth">
                      <Button
                        size="lg"
                        variant="gradient"
                        className="w-full sm:w-auto gap-2 text-lg px-8 py-4"
                      >
                        Get Started Free
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 lg:items-center ">
              {/* Left side: Hero Content */}
              <div className="space-y-8 z-10 relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 border border-green-600 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">
                    AI-Powered Payment Recovery
                  </span>
                </div>

                {/* Main Heading - Using fluid typography */}
                <h1 className="font-bold text-foreground leading-tight">
                  Never Chase Clients for
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent block">
                    Payment Again
                  </span>
                </h1>

                {/* Subheading - Improved readability */}
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload your invoice → <span className="font-semibold text-foreground">AI sends professional reminders</span> → <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent font-semibold">Get paid faster</span>.
                  <span className="block mt-3 font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent text-lg">
                    100% Free. No credit card needed.
                  </span>
                </p>

                {/* Progressive CTA Strategy - Desktop */}
                {user ? (
                  <div className="flex flex-col gap-4">
                    <Link href="/dashboard">
                      <Button size="lg" variant="gradient" className="gap-2 text-lg px-12 py-4">
                        Go to Dashboard
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Primary CTA */}
                    <Link href="/auth">
                      <Button size="lg" variant="gradient" className="gap-2 text-lg px-12 py-4">
                        Get Started Free
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Features List */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      AI Invoice Processing
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      UPI Payment Links
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Smart Reminders
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Payment Tracking
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side: Dashboard Preview */}
              <div className="relative z-10">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Fynl-It Section */}
      {/* Benefits Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 to-primary-light/10 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-1">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4 sm:mb-6">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-green-600">
                      Built for Freelancers
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                    Why Choose <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Fynl-It</span>?
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
                    Designed specifically for Indian freelancers who want to <span>get paid faster</span>
                    without damaging client relationships.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">
                        AI-Powered Messages
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Professional reminders that maintain client relationships
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">
                        UPI Instant Payments
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        QR codes and payment links for immediate collection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">
                        Automatic Follow-ups
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Never miss a payment reminder again
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">
                        Relationship Safe
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Professional tone that preserves client trust
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative order-2 lg:order-2">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg hover:shadow-success shadow-success transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-green-700 dark:text-green-300" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                          85% Faster
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Payment collection compared to manual follow-ups
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg hover:shadow-info shadow-info transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                          10 Hours
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Saved per month per freelancer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                    <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:shadow-premium shadow-premium transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-700 dark:text-purple-300" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                          99.9%
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Uptime with reliable email delivery
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-lg hover:shadow-warning shadow-warning transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-orange-700 dark:text-orange-300" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                          Zero Effort
                        </span>
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
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

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-600">
                How It Works
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Simple, Automated, Professional
            </h2>
            <p className="text-base sm:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Everything happens automatically while maintaining your <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent font-semibold">professional relationships</span>.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg hover:shadow-primary/30 shadow-primary/20 transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <CardHeader className="pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">
                  1. Add Your Invoice
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Upload via AI scanner or enter details manually. We generate
                  UPI payment links automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg hover:shadow-primary/30 shadow-primary/20 transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <CardHeader className="pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">
                  2. Auto Follow-ups
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  <span className=" font-semibold">AI-powered reminders</span> that get progressively more assertive.
                  Professional tone that preserves relationships.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg hover:shadow-primary/30 shadow-primary/20 transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-500" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">
                  3. Get Paid Faster
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Instant UPI payments with QR codes. Auto-detection stops
                  reminders and sends thank you notes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder Credibility & CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-green-500/5 to-emerald-500/10 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Founder Story */}
              <div className="bg-card p-6 sm:p-8 rounded-xl border shadow-lg shadow-primary/20">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-green-500/20">
                    <Image
                      src="https://pbs.twimg.com/profile_images/1985608719510749190/W9-9HPVI_400x400.jpg"
                      alt="Rohit - Founder & Developer"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Built by a freelancer, for freelancers</h3>
                    <p className="text-sm text-muted-foreground">Rohit • Founder & Developer</p>
                  </div>
                </div>
                <blockquote className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                  &quot;I was spending 5+ hours every month writing awkward &apos;gentle reminder&apos; emails to clients.
                  It was affecting my relationships and my cash flow. So I built this tool to automate the
                  process professionally.&quot;
                </blockquote>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="https://x.com/rohiitcodes">
                      <Mail className="h-4 w-4" />
                      Contact Founder
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="https://chat.whatsapp.com/ISXLzprKTWdJjiv4dOaS2F?mode=ac_t" target="_blank" rel="noopener noreferrer">
                      <Users className="h-4 w-4" />
                      Join Community
                    </a>
                  </Button>
                </div>
              </div>

              {/* Main CTA */}
              <div className="text-center lg:text-left space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Ready to stop chasing <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">payments</span>?
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Join our early community of freelancers who are building this together.
                  Your feedback shapes the product.
                </p>

                {user ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      variant="gradient"
                      className="w-full lg:w-auto gap-2 text-lg px-12 py-4"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-4">
                    <Link href="/auth">
                      <Button
                        size="lg"
                        variant="gradient"
                        className="w-full lg:w-auto gap-2 text-lg px-12 py-4"
                      >
                        Get Started Free
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/90 backdrop-blur-lg">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">

              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  Fynl-It
                </span>
              </div>

              {/* Copyright */}
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                © 2025 Fynl-It. Built for Indian freelancers who deserve to get
                paid on time.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
