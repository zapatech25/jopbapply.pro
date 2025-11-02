import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  role: z.enum(["user", "admin"]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  credits: integer("credits").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull().default("one_time"),
  billingPeriod: text("billing_period"),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(["one_time", "subscription"]).optional(),
  billingPeriod: z.enum(["monthly", "yearly"]).optional(),
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

// Phase 7 - Subscriptions (moved here to avoid TDZ error)
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  status: text("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  canceledAt: timestamp("canceled_at"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(["active", "past_due", "canceled", "unpaid", "incomplete"]),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const userPlans = pgTable("user_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  creditsRemaining: integer("credits_remaining").notNull(),
  status: text("status").notNull().default("active"),
  autoRenew: boolean("auto_renew").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  purchasedAt: timestamp("purchased_at").notNull().default(sql`now()`),
});

export const insertUserPlanSchema = createInsertSchema(userPlans).omit({
  id: true,
  purchasedAt: true,
}).extend({
  status: z.enum(["active", "expired", "cancelled"]).optional(),
});

export type InsertUserPlan = z.infer<typeof insertUserPlanSchema>;
export type UserPlan = typeof userPlans.$inferSelect;

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userPlanId: varchar("user_plan_id").notNull().references(() => userPlans.id),
  jobId: text("job_id"),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  jobLink: text("job_link").notNull(),
  status: text("status").notNull().default("applied"),
  batchNumber: integer("batch_number").notNull(),
  appliedDate: timestamp("applied_date").notNull(),
  submissionMode: text("submission_mode").notNull().default("manual"),
  automationJobId: varchar("automation_job_id"),
  source: text("source").notNull().default("csv_upload"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  jobLink: z.string().url("Invalid job link URL"),
  status: z.enum(["applied", "in_review", "interviewing", "rejected", "offer"]),
  submissionMode: z.enum(["manual", "automated"]).optional(),
  source: z.enum(["csv_upload", "automated", "manual_entry"]).optional(),
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Phase 3 - Application Batches (batch lifecycle tracking)
export const applicationBatches = pgTable("application_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  batchNumber: integer("batch_number").notNull(),
  status: text("status").notNull().default("pending"),
  submissionMode: text("submission_mode").notNull().default("manual"),
  automationJobId: varchar("automation_job_id"),
  totalApplications: integer("total_applications").notNull().default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertApplicationBatchSchema = createInsertSchema(applicationBatches).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  submissionMode: z.enum(["manual", "automated"]).optional(),
});

export type InsertApplicationBatch = z.infer<typeof insertApplicationBatchSchema>;
export type ApplicationBatch = typeof applicationBatches.$inferSelect;

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  requestIp: text("request_ip"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Phase 3 - Automation Jobs (job board integration queue)
export const automationJobs = pgTable("automation_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  batchId: varchar("batch_id").references(() => applicationBatches.id),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("queued"),
  payload: jsonb("payload"),
  errorLog: text("error_log"),
  scheduledAt: timestamp("scheduled_at").notNull().default(sql`now()`),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertAutomationJobSchema = createInsertSchema(automationJobs).omit({
  id: true,
  createdAt: true,
}).extend({
  provider: z.enum(["linkedin", "indeed", "other"]),
  status: z.enum(["queued", "processing", "completed", "failed"]).optional(),
});

export type InsertAutomationJob = z.infer<typeof insertAutomationJobSchema>;
export type AutomationJob = typeof automationJobs.$inferSelect;

// Phase 3 - Notification System
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  channel: text("channel").notNull().default("in_app"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
}).extend({
  channel: z.enum(["email", "sms", "in_app"]).optional(),
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Phase 3 - User Notification Preferences
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  smsEnabled: boolean("sms_enabled").notNull().default(false),
  batchCompletionAlerts: boolean("batch_completion_alerts").notNull().default(true),
  statusUpdateAlerts: boolean("status_update_alerts").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertUserNotificationPreferencesSchema = createInsertSchema(userNotificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserNotificationPreferences = z.infer<typeof insertUserNotificationPreferencesSchema>;
export type UserNotificationPreferences = typeof userNotificationPreferences.$inferSelect;

// Phase 3 - AI Artifacts (AI-generated content)
export const aiArtifacts = pgTable("ai_artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").references(() => applications.id),
  artifactType: text("artifact_type").notNull(),
  content: jsonb("content").notNull(),
  generatedAt: timestamp("generated_at").notNull().default(sql`now()`),
});

export const insertAiArtifactSchema = createInsertSchema(aiArtifacts).omit({
  id: true,
  generatedAt: true,
}).extend({
  artifactType: z.enum(["cover_letter", "cv_optimization", "custom_answer", "job_match_analysis"]),
});

export type InsertAiArtifact = z.infer<typeof insertAiArtifactSchema>;
export type AiArtifact = typeof aiArtifacts.$inferSelect;

// Phase 4 - Resources (career guides, tips, paid content)
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  price: decimal("price", { precision: 10, scale: 2 }),
  credits: integer("credits"),
  tags: text("tags").array(),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: z.enum(["interview_tips", "cv_guides", "job_search", "career_advice", "templates", "courses"]),
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Phase 4 - Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  author: text("author").notNull().default("JobApply Team"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: z.enum(["success_stories", "industry_insights", "job_market", "career_tips", "platform_updates"]),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Phase 4 - User Resources (purchased resources tracking)
export const userResources = pgTable("user_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  resourceId: varchar("resource_id").notNull().references(() => resources.id),
  purchaseMethod: text("purchase_method").notNull(),
  creditsSpent: integer("credits_spent"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
  purchasedAt: timestamp("purchased_at").notNull().default(sql`now()`),
});

export const insertUserResourceSchema = createInsertSchema(userResources).omit({
  id: true,
  purchasedAt: true,
}).extend({
  purchaseMethod: z.enum(["credits", "payment", "free"]),
});

export type InsertUserResource = z.infer<typeof insertUserResourceSchema>;
export type UserResource = typeof userResources.$inferSelect;

// Phase 7 - Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").references(() => plans.id),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeInvoiceId: text("stripe_invoice_id"),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  description: text("description"),
  promoCodeId: varchar("promo_code_id"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(["purchase", "subscription", "renewal", "refund"]),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Phase 7 - Promo Codes
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  currentUses: true,
  createdAt: true,
}).extend({
  discountType: z.enum(["percentage", "fixed"]),
  code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores"),
});

export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// Phase 7 - Payment Methods
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull().unique(),
  type: text("type").notNull(),
  last4: text("last4"),
  brand: text("brand"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Phase 8 - Job Roles (Role Matrix)
export const jobRoles = pgTable("job_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: text("role_id").notNull().unique(),
  roleName: text("role_name").notNull(),
  roleType: text("role_type").notNull(),
  industry: text("industry").notNull(),
  keySkills: text("key_skills").array().notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertJobRoleSchema = createInsertSchema(jobRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobRole = z.infer<typeof insertJobRoleSchema>;
export type JobRole = typeof jobRoles.$inferSelect;

// Phase 8 - CV Uploads
export const cvUploads = pgTable("cv_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalFilename: text("original_filename").notNull(),
  storedFilename: text("stored_filename").notNull(),
  fileSize: integer("file_size").notNull(),
  atsScore: integer("ats_score").notNull(),
  atsDetails: jsonb("ats_details").notNull(),
  enhancementPurchased: boolean("enhancement_purchased").notNull().default(false),
  enhancementCompleted: boolean("enhancement_completed").notNull().default(false),
  enhancementNotes: text("enhancement_notes"),
  enhancedFilename: text("enhanced_filename"),
  uploadedAt: timestamp("uploaded_at").notNull().default(sql`now()`),
  enhancementCompletedAt: timestamp("enhancement_completed_at"),
});

export const insertCvUploadSchema = createInsertSchema(cvUploads).omit({
  id: true,
  uploadedAt: true,
  enhancementCompletedAt: true,
});

export type InsertCvUpload = z.infer<typeof insertCvUploadSchema>;
export type CvUpload = typeof cvUploads.$inferSelect;

// Phase 8 - User Job Preferences
export const userJobPreferences = pgTable("user_job_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  selectedRoleIds: text("selected_role_ids").array().notNull(),
  preferredEmail: text("preferred_email").notNull(),
  interviewPhone: text("interview_phone").notNull(),
  setupCompleted: boolean("setup_completed").notNull().default(false),
  adminApproved: boolean("admin_approved").notNull().default(false),
  adminApprovedBy: varchar("admin_approved_by").references(() => users.id),
  adminApprovedAt: timestamp("admin_approved_at"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertUserJobPreferencesSchema = createInsertSchema(userJobPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  preferredEmail: z.string().email("Invalid email address"),
  interviewPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  selectedRoleIds: z.array(z.string()).min(1, "Select at least 1 role").max(5, "Maximum 5 roles allowed"),
});

export type InsertUserJobPreferences = z.infer<typeof insertUserJobPreferencesSchema>;
export type UserJobPreferences = typeof userJobPreferences.$inferSelect;

// Phase 8 - CV Enhancement Orders
export const cvEnhancementOrders = pgTable("cv_enhancement_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  cvUploadId: varchar("cv_upload_id").notNull().references(() => cvUploads.id),
  planId: varchar("plan_id").references(() => plans.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  orderNotes: text("order_notes"),
  adminAssignedTo: varchar("admin_assigned_to").references(() => users.id),
  completedBy: varchar("completed_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const insertCvEnhancementOrderSchema = createInsertSchema(cvEnhancementOrders).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
});

export type InsertCvEnhancementOrder = z.infer<typeof insertCvEnhancementOrderSchema>;
export type CvEnhancementOrder = typeof cvEnhancementOrders.$inferSelect;
