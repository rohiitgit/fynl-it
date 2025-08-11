// src/app/page.tsx - Fully Responsive Landing Page with Mobile-First Design
'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  TrendingUp,
  LogOut,
  BarChart3,
  Users,
  CheckCircle2,
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
  Star
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// Floating elements data
const floatingElements = [
  { icon: DollarSign, delay: 0, duration: 6, position: { top: '20%', left: '10%' } },
  { icon: FileText, delay: 1, duration: 8, position: { top: '60%', left: '85%' } },
  { icon: Mail, delay: 2, duration: 7, position: { top: '40%', left: '15%' } },
  { icon: CreditCard, delay: 3, duration: 9, position: { top: '70%', left: '75%' } },
  { icon: MessageCircle, delay: 1.5, duration: 6.5, position: { top: '30%', left: '80%' } },
  { icon: Calendar, delay: 4, duration: 8, position: { top: '80%', left: '20%' } },
  { icon: Sparkles, delay: 2.5, duration: 7.5, position: { top: '15%', left: '70%' } },
  { icon: Target, delay: 0.5, duration: 9, position: { top: '50%', left: '5%' } },
];

// Floating element component with proper typing
const FloatingElement = ({
  icon: Icon,
  delay,
  duration,
  position
}: {
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
  duration: number;
  position: { top: string; left: string };
}) => {
  return (
    <div
      className="absolute opacity-10 text-primary pointer-events-none hidden xl:block"
      style={{
        ...position,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
    </div>
  );
};

// Dynamic Navbar Component with Fixed Background
const DynamicNavbar = () => {
  const { user, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className={`container mx-auto transition-all duration-500 ease-in-out ${isScrolled
        ? 'px-3 sm:px-4 py-2'
        : 'px-3 sm:px-4 py-4 sm:py-6'
        }`}>
        <div className={`transition-all duration-500 ease-in-out ${isScrolled
          ? 'bg-card/90 backdrop-blur-xl border border-border/50 rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 mx-auto max-w-5xl shadow-lg'
          : 'bg-transparent'
          }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <DollarSign className={`transition-all duration-300 text-primary ${isScrolled ? 'h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6' : 'h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8'
                }`} />
              <span className={`font-bold text-foreground transition-all duration-300 ${isScrolled ? 'text-base sm:text-lg lg:text-xl' : 'text-lg sm:text-xl lg:text-2xl'
                }`}>
                Fynl-It
              </span>
            </div>

            {/* Navigation Items */}
            {loading ? (
              // Loading state
              <div className="flex items-center space-x-2">
                <div className="h-7 w-10 sm:h-8 sm:w-12 lg:h-9 lg:w-16 bg-muted animate-pulse rounded"></div>
                <div className="h-7 w-12 sm:h-8 sm:w-16 lg:h-9 lg:w-24 bg-muted animate-pulse rounded"></div>
              </div>
            ) : user ? (
              // Logged in state
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <span className={`text-muted-foreground truncate max-w-[80px] sm:max-w-[120px] lg:max-w-[200px] transition-all duration-300 ${isScrolled ? 'text-xs lg:text-sm hidden sm:block' : 'text-xs sm:text-sm'
                  }`}>
                  Welcome, {getUserDisplayName()}!
                </span>
                <Link href="/dashboard">
                  <Button
                    size={isScrolled ? "sm" : "default"}
                    className="gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 lg:px-4"
                  >
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className={isScrolled ? 'hidden lg:inline' : 'hidden sm:inline'}>Dashboard</span>
                    <span className={isScrolled ? 'lg:hidden' : 'sm:hidden'}>Go</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size={isScrolled ? "sm" : "default"}
                  onClick={signOut}
                  className="gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 lg:px-4"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={isScrolled ? 'hidden xl:inline' : 'hidden lg:inline'}>Sign Out</span>
                </Button>
              </div>
            ) : (
              // Logged out state
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <Link href="/auth">
                  <Button variant="ghost" size={isScrolled ? "sm" : "default"} className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size={isScrolled ? "sm" : "default"} className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
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
      <div className="relative mx-auto max-w-5xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl sm:rounded-2xl lg:rounded-3xl blur-xl sm:blur-2xl lg:blur-3xl"></div>
        <div className="relative bg-card/80 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl p-3 sm:p-4 lg:p-6 xl:p-8 border border-border/20">
          {/* Dashboard Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Invoice Card Preview */}
            <div className="lg:col-span-2 space-y-2 sm:space-y-3 lg:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 lg:p-4 bg-muted/50 rounded-lg sm:rounded-xl gap-2 sm:gap-3 lg:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm lg:text-base truncate">Sarah Chen</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Invoice #INV-2024-001</p>
                  </div>
                </div>
                <div className="text-left sm:text-right flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1">
                  <p className="text-base sm:text-lg lg:text-2xl font-bold">₹25,000</p>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                    Due in 3 days
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 lg:p-4 bg-muted/50 rounded-lg sm:rounded-xl gap-2 sm:gap-3 lg:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm lg:text-base truncate">Tech Startup Inc</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Invoice #INV-2024-002</p>
                  </div>
                </div>
                <div className="text-left sm:text-right flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1">
                  <p className="text-base sm:text-lg lg:text-2xl font-bold">₹45,000</p>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    Paid
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              <div className="p-2.5 sm:p-3 lg:p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg sm:rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">₹1,25,000</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  +23% from last month
                </p>
              </div>

              <div className="p-2.5 sm:p-3 lg:p-4 bg-muted/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">Collection Rate</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground">87%</p>
                </div>
                <div className="w-full bg-border rounded-full h-1 sm:h-1.5 lg:h-2">
                  <div className="bg-gradient-to-r from-primary to-primary/80 h-1 sm:h-1.5 lg:h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification - Responsive positioning */}
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 lg:-top-4 lg:-right-4 bg-green-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-4 lg:py-2 rounded sm:rounded-md lg:rounded-lg shadow-lg flex items-center gap-1 sm:gap-2 animate-bounce">
            <Bell className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
            <span className="text-xs sm:text-sm font-medium">Payment Received!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Landing Page Component
export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary overflow-hidden">
      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-15px) rotate(3deg); }
        }
      `}</style>

      {/* Dynamic Navbar */}
      <DynamicNavbar />

      {/* Hero Section with Floating Elements */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24 xl:pt-32 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
        {/* Floating Elements - Hidden on mobile and tablet */}
        {floatingElements.map((element, index) => (
          <FloatingElement key={index} {...element} />
        ))}

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 sm:opacity-20 lg:opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(var(--primary), 0.1) 1px, transparent 0)`,
            backgroundSize: '20px 20px sm:30px 30px lg:40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout: Stack vertically */}
            <div className="block lg:hidden space-y-8 sm:space-y-10">
              {/* Mobile: Hero Badge and Heading First */}
              <div className="space-y-4 sm:space-y-6 z-10 relative text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-primary">AI-Powered Payment Recovery</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  Get Paid Without Being
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent block">
                    &quot;That&quot; Freelancer
                  </span>
                </h1>
              </div>

              {/* Mobile: Dashboard Preview Second */}
              <div className="relative z-10">
                <DashboardPreview />
              </div>

              {/* Mobile: Subheading and CTAs Third */}
              <div className="space-y-6 sm:space-y-8 z-10 relative text-center">
                {/* Subheading */}
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed px-2">
                  We handle the awkward nudges so you can focus on your work. Smart automation meets professional communication with AI-powered reminders.
                </p>

                {/* CTA Buttons */}
                {user ? (
                  // Logged in CTA
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-11 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <BarChart3 className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span>View Dashboard</span>
                        <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-11 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg font-medium">
                      See How It Works
                    </Button>
                  </div>
                ) : (
                  // Logged out CTA
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                    <Link href="/auth" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-11 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <span>Start Free Trial</span>
                        <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-11 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg font-medium">
                      See How It Works
                    </Button>
                  </div>
                )}

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                    <span>Free for 30 days</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12 items-center">
              {/* Hero Content */}
              <div className="space-y-6 xl:space-y-8 z-10 relative">
                <div className="space-y-4 xl:space-y-6">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 xl:px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-primary">AI-Powered Payment Recovery</span>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-foreground leading-tight">
                    Get Paid Without Being
                    <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent block">
                      &quot;That&quot; Freelancer
                    </span>
                  </h1>

                  {/* Subheading */}
                  <p className="text-lg xl:text-xl text-muted-foreground leading-relaxed">
                    We handle the awkward nudges so you can focus on your work. Smart automation meets professional communication with AI-powered reminders.
                  </p>
                </div>

                {/* CTA Buttons */}
                {user ? (
                  // Logged in CTA
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-12 xl:h-14 px-6 xl:px-8 text-base xl:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <BarChart3 className="mr-2 h-4 w-4 xl:h-5 xl:w-5" />
                        <span>View Dashboard</span>
                        <ArrowRight className="ml-2 h-4 w-4 xl:h-5 xl:w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 xl:h-14 px-6 xl:px-8 text-base xl:text-lg font-medium">
                      See How It Works
                    </Button>
                  </div>
                ) : (
                  // Logged out CTA
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/auth" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-12 xl:h-14 px-6 xl:px-8 text-base xl:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <span>Start Free Trial</span>
                        <ArrowRight className="ml-2 h-4 w-4 xl:h-5 xl:w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 xl:h-14 px-6 xl:px-8 text-base xl:text-lg font-medium">
                      See How It Works
                    </Button>
                  </div>
                )}

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Free for 30 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="relative z-10">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">How It Works</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Simple, Automated, Professional
            </h2>
            <p className="text-base sm:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              From invoice creation to payment collection, everything happens automatically while maintaining your professional relationships.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <CardHeader className="pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">1. Add Your Invoice</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Upload via AI scanner or enter details manually. We generate UPI payment links automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group">
              <CardHeader className="pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">2. Auto Follow-ups</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  AI-powered reminders that get progressively more assertive. Professional tone that preserves relationships.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 group sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <CardTitle className="text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">3. Get Paid Faster</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Instant UPI payments with QR codes. Auto-detection stops reminders and sends thank you notes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 to-primary/10 relative">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4 sm:mb-6">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-primary">Built for Freelancers</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                    Why Choose Fynl-It?
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
                    Designed specifically for Indian freelancers and small businesses who want to get paid without damaging client relationships.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">UPI Optimized</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Instant payments with QR codes and UPI links</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">AI-Powered</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Smart invoice scanning and message enhancement</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">Saves Time</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Complete automation from reminder to payment</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm sm:text-base">Professional</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Maintains relationships while ensuring payment</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-card/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">85% Faster</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Payment collection compared to manual follow-ups</p>
                    </div>

                    <div className="bg-card/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">10 Hours</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Saved per month per freelancer</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                    <div className="bg-card/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">99.9%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Uptime with reliable email delivery</p>
                    </div>

                    <div className="bg-card/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">Zero Effort</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Set once, works automatically forever</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Different based on auth state */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 text-primary-foreground relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                  backgroundSize: '20px 20px sm:30px 30px'
                }} />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>

                {user ? (
                  // Logged in CTA
                  <>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                      Ready to Manage Your Invoices?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                      Your dashboard is waiting - check your invoices and payment status
                    </p>
                    <Link href="/dashboard">
                      <Button variant="secondary" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-medium">
                        <BarChart3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Open Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  // Logged out CTA
                  <>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                      Ready to Never Chase Payments Again?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                      Join thousands of freelancers who&apos;ve eliminated payment stress and improved their cash flow with AI-powered automation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                      <Link href="/auth" className="w-full sm:w-auto">
                        <Button variant="secondary" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-medium w-full">
                          Start Your Free Trial
                        </Button>
                      </Link>
                    </div>
                  </>
                )}

                <p className="text-xs sm:text-sm opacity-80 mt-4 sm:mt-6">
                  {user ? "Your data is secure and ready to use" : "No credit card required • 30-day free trial • Cancel anytime"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-base sm:text-lg font-bold text-foreground">Fynl-It</span>
              </div>
              <p className="text-muted-foreground mb-3 sm:mb-4 max-w-md text-sm sm:text-base">
                AI-powered payment recovery platform designed for freelancers and small businesses in India.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">Support</a>
              </div>
            </div>

            <div className="order-3 sm:order-2">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p className="hover:text-primary transition-colors cursor-pointer">Features</p>
                <p className="hover:text-primary transition-colors cursor-pointer">Pricing</p>
                <p className="hover:text-primary transition-colors cursor-pointer">API</p>
                <p className="hover:text-primary transition-colors cursor-pointer">Integrations</p>
              </div>
            </div>

            <div className="order-4 sm:order-3">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p className="hover:text-primary transition-colors cursor-pointer">About</p>
                <p className="hover:text-primary transition-colors cursor-pointer">Blog</p>
                <p className="hover:text-primary transition-colors cursor-pointer">Careers</p>
                <p className="hover:text-primary transition-colors cursor-pointer">Contact</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2024 Fynl-It. All rights reserved. Made with ❤️ for freelancers who deserve to get paid on time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}