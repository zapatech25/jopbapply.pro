# JobApply.pro

## Overview

JobApply.pro is a job application automation and career support platform designed to streamline the job search process. It offers a credit-based system for job applications, allowing users to purchase credit plans, track application statuses, and access CV enhancement services. The platform supports a role-based system for users and administrators, with administrators managing pricing plans and uploading application status data. The business vision is to provide a comprehensive solution for job seekers, enhancing their efficiency and success in the competitive job market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite for fast development and optimized builds. It leverages Shadcn/ui and Radix UI for components, styled with Tailwind CSS following a mobile-first, modern SaaS design aesthetic. Key design inspirations include Stripe, Linear, and Notion, with a custom blue/green color scheme and Inter font family. State management utilizes TanStack React Query for server state and custom hooks for authentication.

### Backend Architecture

The backend is an Express.js server developed with TypeScript and Node.js. It features a RESTful API with session-based authentication and role-based access control (user/admin). Session management uses connect-pg-simple to store sessions in PostgreSQL, ensuring persistence across server restarts and proper functionality in production environments. Multer handles CSV file uploads. Core functionalities include user management, plan management, application tracking, batch processing, and administrative tools for user and application data oversight. Bcrypt is used for password hashing.

### Data Storage

The platform uses a PostgreSQL database hosted on Neon (serverless), with Drizzle ORM for type-safe interactions. The database schema, defined in `shared/schema.ts`, includes tables for Users, Plans, User Plans, Applications, Application Batches, Automation Jobs, User Notification Preferences, AI Artifacts, Resources, Blog Posts, and User Resources. Drizzle Kit manages schema migrations.

### System Design Choices

The system supports a credit-based model where applications deduct credits from user plans. A batch processing system allows admins to upload application data, automatically deducting credits and managing application statuses (applied, in_review, interviewing, rejected, offer). Automation infrastructure is designed for future integration with job board APIs, managing a job queue and batch lifecycle. A comprehensive content management system for career resources and a blog platform is integrated, supporting both credit-based and payment-based access to content. SEO-friendly slugs are used for content.

### Analytics System (Phase 5)

The platform features a comprehensive analytics system with visual dashboards for both users and administrators. User analytics provide insights into application performance with status distribution pie charts, application timeline trends, success rate calculations, and credit usage tracking. Admin analytics offer platform-wide metrics including user growth trends, application volumes, revenue tracking, and system-wide statistics. Both user and admin analytics support CSV export functionality for data analysis. The analytics system uses Recharts for responsive, mobile-friendly data visualizations with proper loading states and error handling. Analytics data is aggregated in real-time from the applications and user_plans tables, calculating metrics such as success rates (offers/total applications), credit utilization, and temporal trends.

### Notification System (Phase 6)

The platform implements a comprehensive notification system to keep users informed about their application progress. The notification center, accessible via a bell icon in the header, displays unread counts and recent notifications in a dropdown popover. Users can view full notification history at /dashboard/notifications with all/unread filters and mark individual or all notifications as read. The notification preferences page allows users to configure email and SMS channels (SMS marked as "Coming Soon") and toggle specific alert types for batch completions and status updates. Notifications are stored in the database and optionally delivered via email using Resend (billed to RESEND_API_KEY). The system triggers notifications automatically when batch processing completes or application statuses change, respecting user preferences. A phone number field is available for future SMS integration. All notification-related pages feature mobile-responsive design with proper loading states and error handling.

### AI Assistance Features (Phase 6)

The platform integrates AI-powered career assistance tools using OpenAI via Replit AI Integrations (no API key required, billed to Replit credits). The CV Optimizer analyzes user CVs and provides personalized optimization tips, supporting optional target role and industry specifications. The Cover Letter Generator creates professional, tailored cover letters based on job details, with optional job description and user CV context for better personalization. Both tools use the gpt-4o-mini model and store generated content as AI artifacts in the database for future reference. The AI History page allows users to view, expand, and review all previously generated content with clear type badges and timestamps. All AI pages are accessible from quick-access links on the dashboard and feature mobile-responsive layouts with proper loading states, error handling, and copy-to-clipboard functionality for generated content.

### Payment & Subscription System (Phase 7)

The platform implements a comprehensive payment and subscription management system powered by Stripe. The system supports both one-time purchases and recurring subscriptions for credit plans, with monthly and yearly billing periods. Key features include:

**Payment Infrastructure:**
- Stripe Checkout integration for secure payment processing using Stripe API version 2025-10-29.clover
- Customer management with automatic customer creation and retrieval
- Webhook handlers for real-time subscription lifecycle events (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed)
- Transaction recording for all payments with metadata including plan details and discount information
- Promo code system supporting both percentage and fixed amount discounts with usage tracking and expiration

**Subscription Management:**
- Automatic subscription lifecycle handling including creation, updates, cancellation, and renewal
- 3-day grace period for failed renewal payments with automatic retry mechanism
- User-controlled subscription management (cancel at period end, immediate cancellation, reactivation)
- Subscription status tracking (active, past_due, canceled, unpaid, incomplete) synchronized with Stripe
- Current period tracking with automatic credit renewal on successful payments

**Financial Services:**
The system includes two core service modules: `paymentService.ts` handles Stripe interactions (checkout sessions, customer management, payment intents, subscription operations) and `subscriptionService.ts` manages subscription lifecycle (webhook event processing, renewal logic, credit allocation, status synchronization). These services integrate with the storage layer to maintain consistency between Stripe and local database states.

**API Endpoints:**
Payment endpoints include checkout session creation (/api/payment/create-checkout-session), webhook event processing (/api/payment/webhook), subscription management (/api/subscription/cancel, /api/subscription/reactivate), transaction history (/api/transactions), and promo code validation (/api/promo-code/validate). Admin endpoints provide financial metrics (/api/admin/financial-metrics) and promo code management (/api/admin/promo-codes).

**Frontend Integration:**
The pricing page has been enhanced with Stripe checkout integration, promo code input and validation, real-time discount preview, and login requirement enforcement. User subscription management page allows viewing plan details and managing subscriptions. Billing history page displays transaction records and receipts. Admin financial dashboard provides revenue charts and MRR tracking. All pricing displays use GBP (£) currency throughout the platform (resources, pricing, billing).

**Security & Data Integrity:**
Webhook signature verification ensures authentic Stripe events (STRIPE_WEBHOOK_SECRET environment variable). All financial data is stored with decimal precision for accurate calculations. Transaction records include full audit trail with Stripe payment intent IDs, subscription IDs, and discount metadata. The system uses TypeScript for type-safe payment processing and proper handling of decimal types from PostgreSQL.

**Recent Improvements (October 2025):**
- Currency standardization: All resource and plan pricing displays now use GBP (£) instead of USD ($)
- Global navigation: Resources and Blog pages now include consistent Navigation header and Footer components
- Admin route fix: Corrected admin financial dashboard route from /admin/financial to /admin/financial-dashboard
- Financial metrics enhancement: Added getAllSubscriptions() storage method for accurate admin financial reporting
- Database schema sync: Successfully synchronized subscriptions.amount column to production database using Drizzle Kit

**Critical Production Fix (November 2025):**
- Session Storage: Migrated from MemoryStore to PostgreSQL-based session storage using connect-pg-simple to resolve production login/dashboard loading issues. Sessions now persist in a dedicated "session" table with automatic creation, 7-day expiration, and proper security configuration (httpOnly, secure in production). Added `app.set('trust proxy', 1)` to ensure Express correctly handles secure cookies when deployed behind Replit's reverse proxy. This complete fix ensures users can successfully log in and access the dashboard in production environments without getting stuck on the loading screen.

## External Dependencies

-   **Database:** Neon (PostgreSQL)
-   **Email Service:** Resend (for email notifications)
-   **AI Service:** OpenAI via Replit AI Integrations (gpt-4o-mini model)
-   **Payment Processing:** Stripe (checkout, subscriptions, customer management)
-   **Frontend Libraries:** React, TanStack Query, Radix UI, Tailwind CSS, Wouter, React Hook Form, Zod, date-fns, Recharts, Stripe.js, React Stripe.js
-   **Backend Libraries:** Express.js, Drizzle ORM, Bcrypt, express-session, connect-pg-simple, Multer, OpenAI, Resend, Stripe SDK
-   **Development Tools:** Vite, TypeScript, tsx, esbuild
-   **Typography:** Google Fonts (Inter, JetBrains Mono)