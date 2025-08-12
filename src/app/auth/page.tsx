// src/app/auth/page.tsx - Revamped with original color palette
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
  ChevronLeft,
  Star
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showEmailSent, setShowEmailSent] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        toast({
          title: "Sign up failed",
          description: error.message,
        });
      } else if (data.user?.identities?.length === 0) {
        // This is a fake user object - user already exists and is confirmed
        setMessage({
          type: "error",
          text: "User already exists with this email. Please sign in instead or use a different email address."
        });
        toast({
          title: "Account already exists",
          description: "Please try signing in instead",
        });
      } else if (data.user && !data.user.email_confirmed_at) {
        // Real new user - show email confirmation
        setShowEmailSent(true);
        setMessage({
          type: "success",
          text: `Please check your email (${email}) and click the confirmation link to activate your account.`
        });
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link",
        });
      } else if (data.user && data.user.email_confirmed_at) {
        // This shouldn't happen but handle it
        setMessage({
          type: "error",
          text: "This email is already registered and confirmed. Please sign in instead."
        });
        toast({
          title: "Account already exists",
          description: "Please use the sign in tab",
        });
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          setMessage({
            type: "error",
            text: "Please check your email and click the confirmation link before signing in."
          });
          toast({
            title: "Email not verified",
            description: "Please confirm your email address first",
          });
        } else {
          setMessage({ type: "error", text: error.message });
          toast({
            title: "Sign in failed",
            description: error.message,
          });
        }
      } else if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully",
        });
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

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

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        toast({
          title: "Failed to resend",
          description: error.message,
        });
      } else {
        toast({
          title: "Email sent!",
          description: "Please check your inbox for the confirmation link",
        });
      }
    } catch (err) {
      console.error('Resend error:', err);
      toast({
        title: "Error",
        description: "Failed to resend confirmation email",
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

  // Show email sent confirmation screen
  if (showEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50 dark:from-background dark:via-card/30 dark:to-card/50 flex items-center justify-center p-4">
        {/* Animated gradient orbs with your color scheme */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-muted/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="backdrop-blur-xl bg-card/95 dark:bg-card/95 shadow-2xl border border-border p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <Mail className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">
                Check Your Email!
              </h2>
              <p className="text-muted-foreground mb-6">
                We&apos;ve sent a confirmation link to
              </p>
              <div className="bg-muted rounded-xl p-4 mb-6">
                <p className="font-semibold text-foreground">{email}</p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm text-primary/90">
                  Click the confirmation link in your email to activate your account and start using Fynl-It.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full border-2 hover:bg-muted"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend confirmation email
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowEmailSent(false);
                    setMessage({ type: "", text: "" });
                  }}
                  className="text-sm hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50 dark:from-background dark:via-card/30 dark:to-card/50 flex items-center justify-center p-4 relative">
      {/* Animated gradient orbs with your color scheme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-muted/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding & Benefits */}
          <div className="hidden lg:block space-y-8 animate-fade-in">
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <DollarSign className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold text-primary">
                Fynl-It
              </span>
            </Link>

            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Start getting paid <br />
                <span className="text-primary">
                  on autopilot
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Join thousands of freelancers who never chase payments anymore.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Lightning Fast Setup</h3>
                  <p className="text-sm text-muted-foreground">Get started in under 5 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-secondary/70 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Bank-level Security</h3>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and secure</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-accent/70 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Made for India</h3>
                  <p className="text-sm text-muted-foreground">UPI, PhonePe, Google Pay ready</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted rounded-2xl border border-border">
              <Sparkles className="h-6 w-6 text-primary mb-3" />
              <p className="text-foreground font-semibold mb-2">
                &quot;Fynl-It recovered ₹2.5L in pending payments in my first month!&quot;
              </p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">5.0</span>
              </div>
              <p className="text-sm text-muted-foreground">
                - Priya S., Freelance Designer
              </p>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="w-full">
            <Card className="backdrop-blur-xl bg-card/95 dark:bg-card/95 shadow-2xl border border-border p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-2xl font-bold text-primary">
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

              {/* Google Sign-In Button - Add this before your Tabs component */}
              <div>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-12 border-2 hover:bg-muted transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <FcGoogle className="h-5 w-5 mr-2" />
                  )}
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-xl">
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:shadow-md rounded-lg transition-all"
                  >
                    Sign Up
                  </TabsTrigger>
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:shadow-md rounded-lg transition-all"
                  >
                    Sign In
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                          First Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            disabled={loading}
                            className="pl-10 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                          Last Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            disabled={loading}
                            className="pl-10 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          className="pl-10 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll send a confirmation link to this email
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          minLength={6}
                          className="pl-10 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Free Account
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>30-day free trial • No credit card required</span>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signin" className="space-y-4 mt-0">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          className="pl-10 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="pl-10 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {/* Email not confirmed message */}
                    {message.type === "error" && message.text.includes("Email not confirmed") && (
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendConfirmation}
                          disabled={loading}
                          className="text-xs border-primary text-primary hover:bg-primary/10"
                        >
                          Resend confirmation email
                        </Button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In to Dashboard
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <a href="#" className="text-sm text-primary hover:text-primary/80 font-medium">
                        Forgot your password?
                      </a>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

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
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
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