// src/app/auth/page.tsx - Fixed ESLint errors with escaped quotes
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

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
      } else if (data.user && !data.user.email_confirmed_at) {
        // Show success message for unconfirmed email
        setShowEmailSent(true);
        setMessage({ 
          type: "success", 
          text: `Please check your email (${email}) and click the confirmation link to activate your account.` 
        });
        toast({
          title: "Check your email!",
          description: "We&apos;ve sent you a confirmation link",
        });
      } else if (data.user && data.user.email_confirmed_at) {
        // Email was already confirmed (shouldn't happen on signup, but just in case)
        toast({
          title: "Welcome to Fynl-it!",
          description: "Your account has been created successfully",
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
        // Handle specific error cases
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
          description: "You&apos;ve been signed in successfully",
        });
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setMessage({ type: "error", text: "An unexpected error occurred" });
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
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Checking your session...</h3>
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
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Check Your Email</CardTitle>
              <CardDescription>
                We&apos;ve sent a confirmation link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Click the confirmation link in your email to activate your account and start using Fynl-it.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend confirmation email"
                  )}
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowEmailSent(false);
                    setMessage({ type: "", text: "" });
                  }}
                  className="text-sm"
                >
                  ← Back to sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Fynl-it
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Welcome to Fynl-it</h1>
            <p className="text-muted-foreground">
              Join thousands of freelancers who will never chase payments again.
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-lg relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg" />
          <div className="relative">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Create your account or sign in to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign Up
                  </TabsTrigger>
                  <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign In
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signup" className="space-y-4 mt-0">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          disabled={loading}
                          className="transition-all focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          disabled={loading}
                          className="transition-all focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                        placeholder="your@email.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll send a confirmation link to this email
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 font-medium shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signin" className="space-y-4 mt-0">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
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
                          className="text-xs"
                        >
                          Resend confirmation email
                        </Button>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-11 font-medium shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Message Display */}
              {message.text && (
                <Alert className={`mt-6 border-2 ${
                  message.type === "error" 
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20" 
                    : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                }`}>
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription className={`${
                    message.type === "error" ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
                  }`}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Footer */}
              <div className="mt-6 text-center">
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center space-x-6 px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">30-day free trial</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Secure email verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}