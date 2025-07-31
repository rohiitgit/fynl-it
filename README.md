# 💰 Fynl-It - Freelancer Payment Recovery Platform

<div align="center">

![Fynl-It Logo](https://img.shields.io/badge/Fynl--It-Payment%20Recovery-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+)

**Get Paid Without Being "That" Freelancer**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue?logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

[Live Demo](https://fynl-it.vercel.app) • [Documentation](#documentation) • [API Reference](#api-reference) • [Contributing](#contributing)

</div>

---

## 🚀 **What is Fynl-It?**

Fynl-It is an AI-powered payment recovery platform designed specifically for freelancers and small businesses. It automates the awkward process of chasing payments while maintaining professional relationships with clients.

### **The Problem We Solve**
- 📧 Sending payment reminders feels awkward and unprofessional
- ⏰ Manually tracking due dates and follow-ups is time-consuming  
- 💸 Late payments hurt cash flow and business growth
- 🤖 Generic reminder emails don't get results
- 📱 Clients want easy payment methods (especially UPI in India)

### **Our Solution**
- 🎯 **Automated reminder sequences** with progressive tone escalation
- 🤖 **AI-powered message generation** for personalized communication
- 💳 **UPI payment integration** with QR codes for instant payments
- 📊 **Smart payment detection** that stops reminders automatically
- 📱 **Mobile-first design** optimized for Indian market

---

## ✨ **Key Features**

### 🤖 **AI-Powered Automation**
- **Invoice Scanning**: Upload PDF/image invoices, AI extracts all details
- **Message Enhancement**: AI improves reminder tone and effectiveness
- **Smart Scheduling**: Automatically schedules follow-ups based on due dates

### 💳 **Payment Integration**
- **UPI Payments**: Generate QR codes and payment links instantly
- **Multiple Methods**: Support for cards, net banking, wallets
- **Auto-Detection**: Webhooks automatically detect payments
- **Multi-Currency**: INR, USD, EUR, GBP, and more

### 📧 **Professional Communication**
- **5-Tier Reminder System**: Friendly → Professional → Firm → Urgent → Final
- **Mobile-Optimized Emails**: Beautiful templates that work everywhere
- **Tone Progression**: Messages get more assertive over time
- **Auto-Cancellation**: Stops reminders when payment is received

### 📊 **Dashboard & Analytics**
- **Real-time Status**: Track all invoices and payment status
- **Payment Analytics**: Understand your cash flow patterns
- **Email Activity**: Monitor reminder effectiveness
- **Client Management**: Keep track of all client interactions

---

## 🛠 **Tech Stack**

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Database-level authorization
- **Edge Functions** - Serverless API endpoints
- **Webhooks** - Real-time payment notifications

### **AI & Integrations**
- **Google Gemini AI** - Invoice processing and message enhancement
- **Razorpay** - UPI and payment processing for India
- **Resend** - Reliable email delivery
- **React Email** - Beautiful email templates

### **Deployment & DevOps**
- **Vercel** - Serverless deployment and hosting
- **Vercel Cron** - Scheduled reminder jobs
- **GitHub Actions** - CI/CD pipeline
- **ESLint + Prettier** - Code quality and formatting

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Razorpay account (for payments)
- Google AI Studio API key
- Resend account (for emails)

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/fynl-it.git
cd fynl-it
npm install
```

### **2. Environment Setup**
Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Processing
GEMINI_API_KEY=your_google_gemini_api_key

# Payment Processing
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
SCHEDULER_API_KEY=your_scheduler_secret_key
```

### **3. Database Setup**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### **4. Run Development Server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 **Project Structure**

```
fynl-it/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Main dashboard
│   │   └── invoices/          # Invoice management
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   └── custom/           # Custom components
│   ├── lib/                   # Utilities and configurations
│   │   ├── hooks/            # Custom React hooks
│   │   ├── email/            # Email templates and service
│   │   ├── payments/         # Payment processing
│   │   └── utils/            # Helper functions
│   └── types/                 # TypeScript type definitions
├── supabase/
│   ├── migrations/           # Database migrations
│   └── config.toml          # Supabase configuration
├── public/                   # Static assets
└── docs/                    # Documentation
```

---

## 🔧 **Configuration**

### **Database Schema**
The application uses these main tables:
- `profiles` - User profile information
- `invoices` - Invoice data and status
- `follow_ups` - Scheduled reminder messages
- `email_logs` - Email delivery tracking
- `payment_events` - Payment webhook logs

### **Payment Integration**
Configure Razorpay for UPI payments:
1. Create Razorpay account
2. Enable Payment Links API
3. Set up webhooks for payment detection
4. Configure UPI as primary payment method

### **Email Templates**
Customize email templates in `src/lib/email/templates.tsx`:
- Professional, mobile-optimized design
- Dynamic content based on invoice data
- UPI payment links and QR codes
- Progressive tone escalation

---

## 🚦 **API Reference**

### **Invoice Management**
```typescript
POST /api/invoices/create
PUT  /api/invoices/[id]
GET  /api/invoices/[id]
```

### **Payment Processing**
```typescript
POST /api/payments/create-link    # Generate UPI payment link
POST /api/webhooks/razorpay      # Payment webhook handler
```

### **AI Features**
```typescript
POST /api/process-invoice        # AI invoice scanning
POST /api/enhance-message       # AI message enhancement
```

### **Email System**
```typescript
POST /api/email/send            # Send reminder email
POST /api/email/test           # Test email configuration
POST /api/scheduler/send-due-emails  # Cron job endpoint
```

---

## 🔄 **Automated Workflows**

### **Reminder Sequence**
1. **Due Date** (Day 0): Friendly reminder
2. **+3 Days**: Professional follow-up
3. **+7 Days**: Firm notice
4. **+14 Days**: Urgent warning
5. **+21 Days**: Final notice before escalation

### **Payment Detection**
- Webhook receives payment notification
- Invoice status updated to "paid"
- All pending reminders cancelled
- Thank you email sent automatically

### **AI Enhancement**
- Invoice upload triggers AI processing
- Fields extracted and pre-filled
- Message tone adapted to context
- Personalization based on client relationship

---

## 🌍 **Deployment**

### **Vercel Deployment (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with automatic HTTPS and CDN
4. Set up Vercel Cron for scheduled jobs

### **Manual Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Database Migration**
```bash
# Production migration
supabase db push --linked

# Backup before migration
supabase db dump --linked > backup.sql
```

---

## 🧪 **Testing**

### **Run Tests**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

### **Manual Testing Checklist**
- [ ] User registration and email verification
- [ ] Invoice creation with AI scanning
- [ ] Payment link generation
- [ ] Email reminder sending
- [ ] Payment webhook processing
- [ ] Dashboard analytics display

---

## 🔒 **Security**

### **Authentication**
- Supabase Auth with email verification
- Row Level Security (RLS) policies
- Protected API routes
- Session management with refresh tokens

### **Data Protection**
- All sensitive data encrypted at rest
- HTTPS enforced in production
- API rate limiting
- Input validation and sanitization

### **Payment Security**
- PCI DSS compliant payment processing
- Webhook signature verification
- Secure token handling
- No card data stored locally

---

## 🎯 **Roadmap**

### **Phase 1 - Core MVP** ✅
- [x] Invoice management
- [x] Automated reminders
- [x] UPI payments
- [x] AI features
- [x] Mobile responsive

### **Phase 2 - Enhanced Features** 🚧
- [ ] Advanced analytics
- [ ] Bulk operations
- [ ] Custom email domains
- [ ] SMS reminders
- [ ] Client portal

### **Phase 3 - Scale & Growth** 📋
- [ ] Team collaboration
- [ ] API for integrations
- [ ] Mobile applications
- [ ] International payments
- [ ] Advanced reporting

---

## 🤝 **Contributing**

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Process**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 **Support & Community**

- 📧 **Email**: support@fynl-it.com
- 💬 **Discord**: [Join our community](https://discord.gg/fynl-it)
- 🐦 **Twitter**: [@FynlIt](https://twitter.com/fynlit)
- 📖 **Documentation**: [docs.fynl-it.com](https://docs.fynl-it.com)

---

## 🙏 **Acknowledgments**

- **Supabase** for the excellent backend-as-a-service
- **Vercel** for seamless deployment and hosting
- **shadcn/ui** for the beautiful component library
- **Razorpay** for UPI payment integration
- **Google AI** for invoice processing capabilities
- **Resend** for reliable email delivery

---

## 📊 **Analytics & Metrics**

![GitHub Stars](https://img.shields.io/github/stars/yourusername/fynl-it?style=social)
![GitHub Forks](https://img.shields.io/github/forks/yourusername/fynl-it?style=social)
![GitHub Issues](https://img.shields.io/github/issues/yourusername/fynl-it)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/yourusername/fynl-it)

---

<div align="center">

**Made with ❤️ for freelancers who deserve to get paid on time**

[⭐ Star this repo](https://github.com/yourusername/fynl-it) if you find it helpful!

</div>

