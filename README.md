# Nudgr (Fynl-It) 💸

## AI-Powered Payment Recovery Platform for Freelancers & Small Businesses

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-black.svg)

*Never chase payments again. Let AI do the work.*

[🚀 Live Demo](https://fynl.it)
</div>

---

## 📋 **Table of Contents**

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)

---

## 🎯 **Overview**

Nudgr (branded as Fynl-It) is a comprehensive AI-powered payment recovery platform designed specifically for freelancers and small businesses in India. It automates the entire invoice follow-up process while maintaining professional client relationships through intelligent, progressive communication.

### **The Problem We Solve**
- **45% of freelancers** struggle with late payments
- **60+ hours per month** spent on payment follow-ups
- **Awkward client conversations** about overdue invoices
- **Cash flow disruption** affecting business growth

### **Our Solution**
- **AI-powered automation** for payment reminders
- **Progressive 5-tier** escalation system
- **UPI-optimized payments** for instant collection
- **Professional communication** that preserves relationships

---

## ✨ **Key Features**

### 🤖 **AI-Powered Intelligence**
- **Invoice Processing**: Automatic data extraction from PDF/images using Google Gemini
- **Message Enhancement**: AI improves reminder tone and effectiveness
- **Smart Scheduling**: Based on due dates and payment history
- **Personalization**: Context-aware messaging for different client relationships

### 💳 **UPI-Optimized Payments**
- **Instant Payment Links**: Generate QR codes and payment links instantly
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

## 📁 **Project Structure**

```
nudgr/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── auth/          # Login/signup
│   │   │   └── callback/      # Auth callback
│   │   ├── api/               # API routes
│   │   │   ├── email/         # Email services
│   │   │   ├── payments/      # Payment processing
│   │   │   ├── webhooks/      # External webhooks
│   │   │   ├── scheduler/     # Cron jobs
│   │   │   └── ai/           # AI processing
│   │   ├── dashboard/         # Main dashboard
│   │   ├── invoices/          # Invoice management
│   │   │   ├── [id]/         # Individual invoice
│   │   │   └── setup-messages/ # Message configuration
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AuthProvider.tsx  # Authentication wrapper
│   │   ├── EmailSettings.tsx # Email configuration
│   │   └── NewInvoiceModal.tsx # Invoice creation
│   ├── lib/                   # Utilities and configurations
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── use-email.ts  # Email operations
│   │   │   ├── use-toast.ts  # Toast notifications
│   │   │   └── use-auth.ts   # Authentication
│   │   ├── email/            # Email templates and service
│   │   │   ├── templates.tsx # React Email templates
│   │   │   └── service.ts    # Email service logic
│   │   ├── payments/         # Payment processing
│   │   │   └── razorpay-upi.ts # UPI integration
│   │   ├── utils/            # Helper functions
│   │   └── supabase.ts       # Database client
│   └── types/                 # TypeScript type definitions
│       └── supabase.ts       # Database types
├── supabase/
│   ├── migrations/           # Database migrations
│   └── config.toml          # Supabase configuration
├── tests/                    # Test files
│   ├── resend-test.js       # Email testing
│   ├── test-razorpay-webhook.js # Payment testing
│   └── verified-sender-test.js # Domain verification
├── public/                   # Static assets
├── components.json          # shadcn/ui configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── CLAUDE.md              # Development guidance
```

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
git clone https://github.com/yourusername/nudgr.git
cd nudgr
npm install
```

### **2. Environment Setup**
Copy `.env.example` to `.env.local` and configure:

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

## 🔧 **Configuration**

### **Database Schema**
The application uses these main tables:

#### **Core Tables**
- `profiles` - User profile and business information
- `invoices` - Invoice data with payment status
- `follow_ups` - Scheduled reminder messages with progressive escalation
- `email_logs` - Email delivery tracking and analytics
- `payment_events` - Payment webhook logs

#### **Views**
- `email_activity` - Aggregated email engagement metrics
- `invoice_analytics` - Payment analytics and cash flow insights

### **Payment Integration**
Configure Razorpay for UPI payments:
1. Create Razorpay account at [razorpay.com](https://razorpay.com)
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

### **Authentication**
All API routes require authentication via Supabase Auth headers.

### **Invoice Management**
```typescript
# Create new invoice
POST /api/invoices/create
Body: {
  client_name: string
  client_email: string
  invoice_number: string
  amount: number
  currency: string
  due_date: string
  description?: string
}

# Update invoice
PUT /api/invoices/[id]
Body: { [field]: value }

# Get invoice details
GET /api/invoices/[id]
```

### **Payment Processing**
```typescript
# Generate UPI payment link
POST /api/payments/create-link
Body: {
  invoice_id: string
  amount: number
  currency: string
}

# Payment webhook handler (Razorpay)
POST /api/webhooks/razorpay
Headers: {
  'x-razorpay-signature': string
}
```

### **AI Features**
```typescript
# AI invoice scanning
POST /api/process-invoice
Body: {
  file: File | base64
  type: 'pdf' | 'image'
}

# AI message enhancement
POST /api/enhance-message
Body: {
  message: string
  context: 'reminder' | 'followup' | 'final'
  tone: 'friendly' | 'professional' | 'firm'
}
```

### **Email System**
```typescript
# Send reminder email
POST /api/email/send
Body: {
  type: 'reminder' | 'thank_you'
  to: string
  subject: string
  templateProps: EmailTemplateProps
}

# Test email configuration
POST /api/email/test
Body: {
  testEmail: string
}

# Automated cron job endpoint
POST /api/scheduler/send-due-emails
Headers: {
  'x-scheduler-key': string
}
```

---

## 📊 **Database Schema**

### **Tables Structure**

```sql
-- User profiles and business information
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT,
  email TEXT,
  preferred_from_email TEXT,
  preferred_from_name TEXT,
  custom_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Invoice data and payment status
invoices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  due_date DATE NOT NULL,
  description TEXT,
  payment_link TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Scheduled reminder messages
follow_ups (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  invoice_id UUID REFERENCES invoices,
  tier INTEGER NOT NULL, -- 1-5 escalation tier
  scheduled_date DATE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  sent_at TIMESTAMP,
  message_id TEXT,
  created_at TIMESTAMP
)

-- Email delivery tracking
email_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  invoice_id UUID REFERENCES invoices,
  follow_up_id UUID REFERENCES follow_ups,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_id TEXT,
  status TEXT DEFAULT 'sent',
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### **Row Level Security (RLS)**
All tables implement RLS policies to ensure users can only access their own data:

```sql
-- Example RLS policy for invoices
CREATE POLICY "Users can only access their own invoices"
ON invoices FOR ALL
USING (auth.uid() = user_id);
```

---

## 🔄 **Automated Workflows**

### **Reminder Sequence**
The platform uses a 5-tier progressive reminder system:

1. **Day 0** (Due Date): Friendly reminder
   - Tone: Gentle and professional
   - Subject: "Friendly reminder: Invoice [NUMBER] due today"

2. **Day +3**: Professional follow-up
   - Tone: Business-like but courteous
   - Subject: "Follow-up: Invoice [NUMBER] payment pending"

3. **Day +7**: Firm notice
   - Tone: More direct and assertive
   - Subject: "Payment Required: Invoice [NUMBER] is overdue"

4. **Day +14**: Urgent warning
   - Tone: Serious and urgent
   - Subject: "URGENT: Invoice [NUMBER] payment overdue"

5. **Day +21**: Final notice
   - Tone: Final warning before escalation
   - Subject: "FINAL NOTICE: Invoice [NUMBER] payment required"

### **Payment Detection Flow**
1. Invoice created → UPI payment link generated via Razorpay
2. Email sent with payment link and QR code
3. Webhook detects payment → Invoice marked as paid
4. All pending reminders automatically cancelled
5. Thank you email sent to client

### **AI Integration**
- Invoice PDF/image processing extracts client details automatically
- Message enhancement improves reminder tone and effectiveness
- Smart scheduling based on due dates and payment history
- Personalization based on client relationship context

---

## 💻 **Development**

### **Development Commands**
```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Database Operations
supabase login              # Login to Supabase CLI
supabase link --project-ref <ref>  # Link to project
supabase db push           # Run migrations
supabase db pull           # Pull schema changes
```

### **Key Services**

#### **Email Service** (`src/lib/email/email-service.ts`)
- Handles reminder sequences with 5-tier escalation system
- Integrates with React Email templates for mobile-optimized emails
- Automatic cancellation when payments are received
- Email tracking and analytics

#### **Payment Service** (`src/lib/payments/razorpay-upi.ts`)
- UPI-optimized payment links with QR codes
- Webhook handling for real-time payment detection
- Multi-currency support with INR focus
- Payment status tracking and validation

#### **Supabase Client** (`src/lib/supabase.ts`)
- Enhanced client with custom storage key
- PKCE flow authentication
- Row Level Security enforcement
- Real-time subscriptions for payment updates

### **Custom Hooks**

#### **useEmail Hook** (`src/lib/hooks/use-email.ts`)
```typescript
const {
  sendReminder,
  sendThankYou,
  sendTestEmail,
  sendUPIReminder,
  loading,
  error
} = useEmail();

// Send a payment reminder
await sendReminder(followUpId);

// Send thank you email
await sendThankYou(invoiceId);

// Send test email
await sendTestEmail('test@example.com');
```

### **Environment Variables Required**
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Processing
GEMINI_API_KEY=

# Payment Processing
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email Service
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App Configuration
NEXT_PUBLIC_APP_URL=
SCHEDULER_API_KEY=
```

### **Development Notes**
- All email templates use React Email for consistent mobile rendering
- Payment amounts are stored in rupees but converted to paise for Razorpay API
- Database uses RLS policies - ensure user context is properly set
- Webhook signature verification is critical for payment security
- Email tracking uses Resend webhooks for delivery status
- Cron jobs run on Vercel for automated reminder scheduling

### **Common Patterns**
- Use `supabase` client from `src/lib/supabase.ts` for all database operations
- Import types from `src/types/supabase.ts` for type safety
- Email templates are in `src/lib/email/templates.tsx`
- Payment utilities are centralized in `src/lib/payments/razorpay-upi.ts`
- Use React Query hooks from `src/lib/hooks/` for data fetching
- All API routes include proper error handling and logging

---

## 🧪 **Testing**

Test files are located in `/tests/` directory:

### **Available Tests**
- `resend-test.js` - Email sending functionality
- `test-razorpay-webhook.js` - Payment webhook processing
- `verified-sender-test.js` - Email domain verification

### **Run Tests**
```bash
# Run individual tests with Node.js
node tests/resend-test.js
node tests/test-razorpay-webhook.js
node tests/verified-sender-test.js

# Test email configuration
npm run test:email

# Test payment webhooks
npm run test:payments
```

### **Testing Checklist**
- [ ] Email delivery and templating
- [ ] Payment webhook signature verification
- [ ] Database operations with RLS
- [ ] AI invoice processing
- [ ] Authentication flows
- [ ] API endpoint responses

---

## 🚀 **Deployment**

### **Vercel Deployment**
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Set all required environment variables in Vercel dashboard
3. **Domain Configuration**: Configure custom domain if needed
4. **Cron Jobs**: Set up Vercel Cron for automated reminders

### **Environment Setup**
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
# ... other environment variables
```

### **Database Migration**
```bash
# Run migrations in production
supabase link --project-ref your-production-ref
supabase db push
```

### **Webhook Configuration**
Set up Razorpay webhooks pointing to:
```
https://yourdomain.com/api/webhooks/razorpay
```

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

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
- Follow conventional commit messages

### **Areas for Contribution**
- [ ] Unit and integration tests
- [ ] Additional payment providers
- [ ] Email template improvements
- [ ] Mobile app development
- [ ] Internationalization (i18n)
- [ ] Advanced analytics features

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 **Support & Community**

- 📧 **Email**: support@fynl-it.com
- 💬 **Discord**: [Join our community](https://discord.gg/fynl-it)
- 🐦 **Twitter**: [@FynlIt](https://twitter.com/fynlit)
- 📖 **Documentation**: [docs.fynl-it.com](https://docs.fynl-it.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/nudgr/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/nudgr/discussions)

---

## 🙏 **Acknowledgments**

- **Supabase** for the excellent backend-as-a-service
- **Vercel** for seamless deployment and hosting
- **shadcn/ui** for the beautiful component library
- **Razorpay** for UPI payment integration
- **Google AI** for invoice processing capabilities
- **Resend** for reliable email delivery
- **React Email** for amazing email templates

---

## 📊 **Analytics & Metrics**

![GitHub Stars](https://img.shields.io/github/stars/yourusername/nudgr?style=social)
![GitHub Forks](https://img.shields.io/github/forks/yourusername/nudgr?style=social)
![GitHub Issues](https://img.shields.io/github/issues/yourusername/nudgr)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/yourusername/nudgr)

---

<div align="center">

**Made with ❤️ for freelancers who deserve to get paid on time**

[⭐ Star this repo](https://github.com/yourusername/nudgr) if you find it helpful!

</div>
