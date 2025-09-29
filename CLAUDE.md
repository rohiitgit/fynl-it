# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nudgr (branded as Fynl-It) is an AI-powered payment recovery platform for freelancers and small businesses. It automates invoice reminders while maintaining professional client relationships through:

- **AI-powered message generation** using Google Gemini for invoice processing and reminder enhancement
- **Automated reminder sequences** with progressive tone escalation (5-tier system)
- **UPI payment integration** via Razorpay for instant payments in India
- **Email automation** using Resend with React Email templates
- **Real-time payment detection** through webhooks

## Development Commands

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

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **Payments**: Razorpay for UPI and payment links
- **Email**: Resend with React Email templates  
- **AI**: Google Gemini API for invoice processing
- **Deployment**: Vercel with scheduled cron jobs

### Database Schema
Core tables:
- `profiles` - User profile and business information
- `invoices` - Invoice data with payment status
- `follow_ups` - Scheduled reminder messages with progressive escalation
- `email_logs` - Email delivery tracking and analytics

**Important**: All tables use Row Level Security (RLS) policies to ensure users can only access their own data. The database is set up via Supabase migrations in the `supabase/migrations/` directory.

Views:
- `email_activity` - Aggregated email engagement metrics
- `invoice_analytics` - Payment analytics and cash flow insights

### Key Services

**Email Service** (`src/lib/email/email-service.ts`):
- Handles reminder sequences with 5-tier escalation system
- Integrates with React Email templates for mobile-optimized emails
- Automatic cancellation when payments are received
- Email tracking and analytics

**Payment Service** (`src/lib/payments/razorpay-upi.ts`):
- UPI-optimized payment links with QR codes
- Webhook handling for real-time payment detection
- Multi-currency support with INR focus
- Payment status tracking and validation

**Supabase Client** (`src/lib/supabase.ts`):
- Enhanced client with custom storage key
- PKCE flow authentication
- Row Level Security enforcement
- Real-time subscriptions for payment updates

### API Routes Structure
```
/api/
├── email/
│   ├── send/          # Send manual reminder emails
│   └── test/          # Test email configuration
├── payments/
│   └── create-link/   # Generate UPI payment links
├── webhooks/
│   └── razorpay/      # Payment webhook handler
├── scheduler/
│   └── send-due-emails/ # Cron job for automated reminders
├── enhance-message/   # AI message enhancement
├── generate-message/  # AI message generation
└── process-invoice/   # AI invoice scanning
```

### Environment Variables Required
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

## Key Implementation Details

### Reminder System
The platform uses a 5-tier progressive reminder system:
1. **Day 0** (Due Date): Friendly reminder
2. **+3 Days**: Professional follow-up
3. **+7 Days**: Firm notice
4. **+14 Days**: Urgent warning
5. **+21 Days**: Final notice

Each tier has distinct AI-enhanced messaging and escalated tone.

### Payment Flow
1. Invoice created → UPI payment link generated via Razorpay
2. Email sent with payment link and QR code
3. Webhook detects payment → Invoice marked as paid
4. All pending reminders automatically cancelled
5. Thank you email sent to client

### AI Integration
- Invoice PDF/image processing extracts client details automatically
- Message enhancement improves reminder tone and effectiveness
- Smart scheduling based on due dates and payment history
- Personalization based on client relationship context

## Testing

**Note**: The `/tests/` directory mentioned in the README does not currently exist in the codebase. Testing infrastructure needs to be set up.

For testing individual components and API routes, you can:
- Test API endpoints directly via curl or Postman
- Use the built-in email test functionality in the dashboard
- Verify payment webhooks using Razorpay dashboard

## Development Notes

- All email templates use React Email for consistent mobile rendering
- Payment amounts are stored in rupees but converted to paise for Razorpay API
- Database uses RLS policies - ensure user context is properly set
- Webhook signature verification is critical for payment security
- Email tracking uses Resend webhooks for delivery status
- Cron jobs run on Vercel for automated reminder scheduling

## Common Patterns

- Use `supabase` client from `src/lib/supabase.ts` for all database operations
- Import types from `src/types/supabase.ts` for type safety
- Email templates are in `src/lib/email/templates.tsx`
- Payment utilities are centralized in `src/lib/payments/razorpay-upi.ts`
- Use React Query hooks from `src/lib/hooks/` for data fetching
- All API routes include proper error handling and logging

## Component Structure

- UI components are in `src/components/ui/` (shadcn/ui components)
- Custom components are in `src/components/` (AuthProvider, EmailSettings, etc.)
- Pages follow Next.js 15 App Router structure in `src/app/`
- Authentication pages are in `src/app/(auth)/`
- Main dashboard and invoice management in `src/app/dashboard/` and `src/app/invoices/`

## Scheduled Jobs

The application uses Vercel Cron for scheduled reminders:
- Configured in `vercel.json` to run daily at 9 AM UTC
- Endpoint: `/api/scheduler/send-due-emails`
- Processes all scheduled follow-ups and sends reminder emails