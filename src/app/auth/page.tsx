// src/app/auth/page.tsx - Revamped with original color palette
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  Globe,
  ChevronLeft,
  Mail,
  FileText,
  CreditCard,
  MessageCircle,
  Calendar,
  Sparkles,
  Target
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { FcGoogle } from "react-icons/fc";

// Floating elements data for auth page
const floatingElements = [
  {
    icon: DollarSign,
    delay: 0,
    duration: 6,
    position: { top: "20%", left: "8%" },
  },
  {
    icon: FileText,
    delay: 1,
    duration: 8,
    position: { top: "60%", left: "92%" },
  },
  { 
    icon: Mail, 
    delay: 2, 
    duration: 7, 
    position: { top: "35%", left: "12%" } 
  },
  {
    icon: CreditCard,
    delay: 3,
    duration: 9,
    position: { top: "75%", left: "88%" },
  },
  {
    icon: MessageCircle,
    delay: 1.5,
    duration: 6.5,
    position: { top: "25%", left: "85%" },
  },
  {
    icon: Calendar,
    delay: 4,
    duration: 8,
    position: { top: "80%", left: "15%" },
  },
  {
    icon: Sparkles,
    delay: 2.5,
    duration: 7.5,
    position: { top: "12%", left: "75%" },
  },
  {
    icon: Target,
    delay: 0.5,
    duration: 9,
    position: { top: "45%", left: "3%" },
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

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();



  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        toast({
          title: "Google sign in failed",
          description: error.message,
        });
      }
      // Note: Successful OAuth redirects automatically, so no success handling needed here
    } catch (err) {
      console.error('Google sign in error:', err);
      setMessage({ type: "error", text: "Failed to sign in with Google" });
      toast({
        title: "Google sign in failed",
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };


  // Show loading spinner while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50 dark:from-background dark:via-card/30 dark:to-card/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-primary">
              Checking your session...
            </h3>
            <p className="text-muted-foreground">
              Please wait while we verify your authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is already authenticated, show loading (AuthProvider will redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50 dark:from-background dark:via-card/30 dark:to-card/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">You&apos;re already signed in!</h3>
            <p className="text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((element, index) => (
          <FloatingElement
            key={index}
            icon={element.icon}
            delay={element.delay}
            duration={element.duration}
            position={element.position}
          />
        ))}
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding & Benefits */}
          <div className="hidden lg:block space-y-8 animate-fade-in">
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                Fynl-It
              </span>
            </Link>

            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Start getting paid <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  on autopilot
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Join thousands of freelancers who never chase payments anymore.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-green-700 transition-colors">Lightning Fast Setup</h3>
                  <p className="text-sm text-muted-foreground">Get started in under 5 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-emerald-700 transition-colors">Bank-level Security</h3>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and secure</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Globe className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-teal-700 transition-colors">Made for India</h3>
                  <p className="text-sm text-muted-foreground">UPI, PhonePe, Google Pay ready</p>
                </div>
              </div>
            </div>

            
          </div>

          {/* Right side - Auth Form */}
          <div className="w-full">
            <Card className="backdrop-blur-xl bg-card/95 dark:bg-card/95 shadow-2xl border border-border p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    Fynl-It
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to Fynl-It
                </h2>
                <p className="text-muted-foreground">
                  Create your account or sign in to continue
                </p>
              </div>

              {/* Single Google Sign-In Button */}
              <div className="space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-16 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  ) : (
                    <FcGoogle className="h-6 w-6 mr-3" />
                  )}
                  Continue with Google
                </Button>

                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-green-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>30-day free trial • No credit card required</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-green-50/30 border border-green-200/30 rounded-lg p-3">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Secure</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-green-50/30 border border-green-200/30 rounded-lg p-3">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Instant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Display */}
              {message.text && (
                <Alert className={`mt-6 border-2 ${message.type === "error"
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-primary/50 bg-primary/10"
                  }`}>
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                  <AlertDescription className={`${message.type === "error" ? "text-destructive" : "text-primary"
                    }`}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 font-medium"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
