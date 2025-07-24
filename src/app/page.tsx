'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, DollarSign, Mail, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Nudgr</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="secondary">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button variant="default">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-foreground leading-tight">
              Get Paid Without the
              <span className="text-primary"> Awkward Chase</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Automated follow-up messages that get progressively more assertive (but always professional) until your invoice is paid. Focus on your work, not chasing payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Free for 30 days</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/hero-image.jpg"
              alt="Freelancer managing invoices"
              width={600}
              height={400}
              className="rounded-lg shadow-card w-full h-auto"
              priority
            />
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 animate-pulse">
              <span className="text-xs">💰</span>
              Payment Received!
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple, automated, and professional
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-card transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>1. Add Your Invoice</CardTitle>
              <CardDescription>
                Enter client details, amount, due date, and payment link
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-card transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>2. Auto Follow-ups</CardTitle>
              <CardDescription>
                Smart reminders that get progressively more assertive
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-card transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <CardTitle>3. Get Paid</CardTitle>
              <CardDescription>
                Automatic thank you & reminder stoppage when payment received
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Built for Freelancers, By Freelancers
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of freelancers who've eliminated payment anxiety
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">85%</div>
            <p className="text-muted-foreground">Faster payment collection</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-success mb-2">$2.3M</div>
            <p className="text-muted-foreground">Collected for freelancers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10hrs</div>
            <p className="text-muted-foreground">Saved per month per user</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-primary-glow rounded-2xl p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Never Chase Payments Again?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of freelancers who've eliminated payment stress
          </p>
          <Link href="/auth">
            <Button variant="secondary" size="lg">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">ChaselessCash</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}