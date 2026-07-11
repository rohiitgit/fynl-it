// src/app/auth/page.tsx - Comic edition (yellow/gray, hard borders, tilted frame)
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  Globe,
  IndianRupee,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { FcGoogle } from "react-icons/fc";

// Comic logo mark — yellow square, ink border, hard shadow
const LogoMark = ({ size = "w-12 h-12", icon = "h-7 w-7" }: { size?: string; icon?: string }) => (
  <div
    className={`${size} bg-yellow border-[2.5px] border-ink comic-shadow-sm flex items-center justify-center flex-shrink-0`}
  >
    <IndianRupee className={`${icon} text-ink`} strokeWidth={2.75} />
  </div>
);

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
      <div className="min-h-screen bg-paper comic-paper-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-[3px] border-ink bg-yellow animate-spin [animation-duration:1.2s]" />
          <div>
            <h3 className="font-display font-bold text-lg text-ink">
              Checking your session...
            </h3>
            <p className="font-mono text-sm text-muted-foreground">
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
      <div className="min-h-screen bg-paper comic-paper-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-[3px] border-ink bg-yellow animate-spin [animation-duration:1.2s]" />
          <div>
            <h3 className="font-display font-bold text-lg">You&apos;re already signed in!</h3>
            <p className="font-mono text-sm text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper comic-paper-bg flex items-center justify-center p-4 relative">
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left side - Branding & Benefits */}
          <div className="hidden lg:block space-y-8 animate-fade-in">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <LogoMark />
              <span className="font-display text-3xl font-extrabold text-ink tracking-tight">
                Fynl-It
              </span>
            </Link>

            <div>
              <h1 className="text-ink mb-4">
                Start getting paid <br />
                <span className="inline-block bg-yellow border-[3px] border-ink px-2 comic-shadow-sm -rotate-1 mt-2">
                  on autopilot
                </span>
              </h1>
              <p className="text-lg text-ink-soft mt-4">
                Join freelancers who never chase payments anymore.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast Setup",
                  text: "Get started in under 5 minutes",
                },
                {
                  icon: Shield,
                  title: "Bank-level Security",
                  text: "Your data is encrypted and secure",
                },
                {
                  icon: Globe,
                  title: "Made for India",
                  text: "UPI, PhonePe, Google Pay ready",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow border-2 border-ink comic-shadow-sm flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-ink" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">
                      {title}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Auth Form (tilted comic panel) */}
          <div className="w-full animate-fade-in-up">
            <div className="comic-panel comic-shadow-lg tilt-r tilt-straighten p-8">
              <div className="text-center mb-8">
                <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
                  <LogoMark size="w-10 h-10" icon="h-6 w-6" />
                  <span className="font-display text-2xl font-extrabold text-ink">
                    Fynl-It
                  </span>
                </div>
                <h2 className="text-ink mb-2">Welcome to Fynl-It</h2>
                <p className="font-mono text-sm text-muted-foreground">
                  Create your account or sign in to continue
                </p>
              </div>

              {/* Single Google Sign-In Button */}
              <div className="space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-16 text-base"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 mr-2 animate-spin text-ink" />
                  ) : (
                    <FcGoogle className="h-6 w-6 mr-2" />
                  )}
                  Continue with Google
                </Button>

                <div className="text-center space-y-4">
                  <div className="bg-yellow border-2 border-ink p-4">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-ink">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>100% Free • No credit card required</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="flex items-center justify-center gap-2 border-2 border-ink bg-gray-panel p-3">
                      <Shield className="h-4 w-4 text-ink" />
                      <span className="font-mono text-xs font-bold uppercase text-ink">
                        Secure
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 border-2 border-ink bg-gray-panel p-3">
                      <Zap className="h-4 w-4 text-ink" />
                      <span className="font-mono text-xs font-bold uppercase text-ink">
                        Instant
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Display */}
              {message.text && (
                <Alert
                  className={`mt-6 rounded-none border-2 border-ink ${
                    message.type === "error" ? "bg-[#FFD9CF]" : "bg-[#C9F2CF]"
                  }`}
                >
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4 text-ink" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-ink" />
                  )}
                  <AlertDescription className="text-ink">
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Entrance animations */}
      <style jsx>{`
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
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-fade-in-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
