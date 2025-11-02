import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Plan,
  type InsertPlan,
  type UserPlan,
  type InsertUserPlan,
  type Application,
  type InsertApplication,
  type ApplicationBatch,
  type InsertApplicationBatch,
  type AutomationJob,
  type InsertAutomationJob,
  type UserNotificationPreferences,
  type InsertUserNotificationPreferences,
  type Notification,
  type InsertNotification,
  type AiArtifact,
  type InsertAiArtifact,
  type Resource,
  type InsertResource,
  type BlogPost,
  type InsertBlogPost,
  type UserResource,
  type InsertUserResource,
  type Subscription,
  type InsertSubscription,
  type Transaction,
  type InsertTransaction,
  type PromoCode,
  type InsertPromoCode,
  type PaymentMethod,
  type InsertPaymentMethod,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type JobRole,
  type InsertJobRole,
  type CvUpload,
  type InsertCvUpload,
  type UserJobPreferences,
  type InsertUserJobPreferences,
  type CvEnhancementOrder,
  type InsertCvEnhancementOrder,
  users,
  plans,
  userPlans,
  applications,
  applicationBatches,
  automationJobs,
  userNotificationPreferences,
  notifications,
  aiArtifacts,
  resources,
  blogPosts,
  userResources,
  subscriptions,
  transactions,
  promoCodes,
  paymentMethods,
  passwordResetTokens,
  jobRoles,
  cvUploads,
  userJobPreferences,
  cvEnhancementOrders,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserProfile(userId: string, data: { fullName?: string; phone?: string; email?: string }): Promise<User | undefined>;
  updateUserPassword(userId: string, newPasswordHash: string): Promise<User | undefined>;

  // Password Reset Token methods
  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date, requestIp?: string): Promise<void>;
  findPasswordResetToken(tokenHash: string): Promise<{ userId: string; expiresAt: Date; consumedAt: Date | null } | undefined>;
  consumePasswordResetToken(tokenHash: string): Promise<void>;

  // Plan methods
  getAllPlans(): Promise<Plan[]>;
  getActivePlans(): Promise<Plan[]>;
  getPlanById(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: Partial<InsertPlan>): Promise<Plan | undefined>;

  // User Plan methods
  getUserPlans(userId: string): Promise<(UserPlan & { plan: Plan })[]>;
  createUserPlan(userPlan: InsertUserPlan): Promise<UserPlan>;
  getUserPlanById(id: string): Promise<UserPlan | undefined>;
  updateUserPlanCredits(id: string, creditsRemaining: number): Promise<UserPlan | undefined>;

  // Application methods
  getApplications(userId: string, filters?: { status?: string; batchNumber?: number; submissionMode?: string }): Promise<Application[]>;
  createApplications(apps: InsertApplication[]): Promise<Application[]>;
  getNextBatchNumber(userId: string): Promise<number>;
  getUserApplicationStats(userId: string): Promise<{ totalApplications: number; batches: number[]; automatedCount: number; manualCount: number }>;

  // Batch methods (Phase 3)
  createBatch(batch: InsertApplicationBatch): Promise<ApplicationBatch>;
  getBatch(id: string): Promise<ApplicationBatch | undefined>;
  getBatchByUserAndNumber(userId: string, batchNumber: number): Promise<ApplicationBatch | undefined>;
  getUserBatches(userId: string): Promise<ApplicationBatch[]>;
  getAllBatches(): Promise<(ApplicationBatch & { user: User })[]>;
  updateBatchStatus(id: string, status: string, additionalFields?: { startedAt?: Date; completedAt?: Date }): Promise<ApplicationBatch | undefined>;

  // Automation Job methods (Phase 3)
  createAutomationJob(job: InsertAutomationJob): Promise<AutomationJob>;
  getAutomationJob(id: string): Promise<AutomationJob | undefined>;
  getUserAutomationJobs(userId: string): Promise<AutomationJob[]>;
  getAllAutomationJobs(): Promise<AutomationJob[]>;
  updateAutomationJobStatus(id: string, status: string, errorLog?: string, executedAt?: Date): Promise<AutomationJob | undefined>;

  // Notification Preferences methods (Phase 3)
  getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | undefined>;
  createUserNotificationPreferences(prefs: InsertUserNotificationPreferences): Promise<UserNotificationPreferences>;
  updateUserNotificationPreferences(userId: string, prefs: Partial<InsertUserNotificationPreferences>): Promise<UserNotificationPreferences | undefined>;

  // Notification methods (Phase 3 & 6)
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean, limit?: number, offset?: number): Promise<Notification[]>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<number>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  updateUserPhone(userId: string, phone: string): Promise<User | undefined>;

  // AI Artifact methods (Phase 3)
  createAiArtifact(artifact: InsertAiArtifact): Promise<AiArtifact>;
  getApplicationArtifacts(applicationId: string): Promise<AiArtifact[]>;
  getUserArtifacts(userId: string): Promise<AiArtifact[]>;

  // Resource methods (Phase 4)
  getAllResources(filters?: { category?: string; isPaid?: boolean; featured?: boolean }): Promise<Resource[]>;
  getActiveResources(filters?: { category?: string; isPaid?: boolean; featured?: boolean }): Promise<Resource[]>;
  getResourceById(id: string): Promise<Resource | undefined>;
  getResourceBySlug(slug: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: string): Promise<boolean>;

  // Blog Post methods (Phase 4)
  getAllBlogPosts(filters?: { category?: string; featured?: boolean }): Promise<BlogPost[]>;
  getPublishedBlogPosts(filters?: { category?: string; featured?: boolean }): Promise<BlogPost[]>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;

  // User Resource methods (Phase 4)
  getUserResources(userId: string): Promise<(UserResource & { resource: Resource })[]>;
  hasUserPurchasedResource(userId: string, resourceId: string): Promise<boolean>;
  createUserResource(userResource: InsertUserResource): Promise<UserResource>;

  // Subscription methods (Phase 7)
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionById(id: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  getAllSubscriptions(): Promise<Subscription[]>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  getUserPlansBySubscriptionId(subscriptionId: string): Promise<UserPlan[]>;
  updateUserPlan(id: string, updates: Partial<InsertUserPlan>): Promise<UserPlan | undefined>;
  getExpiredUserPlans(gracePeriodEnd: Date): Promise<UserPlan[]>;

  // Transaction methods (Phase 7)
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  getAllTransactions(limit?: number, offset?: number): Promise<(Transaction & { user: User })[]>;

  // Promo Code methods (Phase 7)
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  getAllPromoCodes(): Promise<PromoCode[]>;
  updatePromoCode(id: string, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: string): Promise<boolean>;
  incrementPromoCodeUsage(id: string): Promise<PromoCode | undefined>;
  validatePromoCode(code: string): Promise<{ valid: boolean; promoCode?: PromoCode; error?: string }>;

  // Payment Method methods (Phase 7)
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  deletePaymentMethod(id: string): Promise<boolean>;
  setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void>;

  // Analytics methods (Phase 5)
  getUserAnalytics(userId: string): Promise<{
    totalApplications: number;
    statusBreakdown: { status: string; count: number }[];
    applicationTimeline: { date: string; count: number }[];
    creditsUsed: number;
    creditsRemaining: number;
    successRate: number;
    batchStats: { batchNumber: number; count: number; statuses: Record<string, number> }[];
  }>;
  getAdminAnalytics(): Promise<{
    totalUsers: number;
    totalApplications: number;
    totalCreditsDistributed: number;
    totalCreditsUsed: number;
    platformSuccessRate: number;
    userActivity: { date: string; newUsers: number; applications: number }[];
    batchPerformance: { totalBatches: number; avgApplicationsPerBatch: number };
  }>;

  // Job Role methods (Phase 8)
  getAllJobRoles(): Promise<JobRole[]>;
  getActiveJobRoles(): Promise<JobRole[]>;
  getJobRoleById(id: string): Promise<JobRole | undefined>;
  getJobRoleByRoleId(roleId: string): Promise<JobRole | undefined>;
  createJobRole(jobRole: InsertJobRole): Promise<JobRole>;
  createJobRoles(jobRoles: InsertJobRole[]): Promise<JobRole[]>;
  updateJobRole(id: string, jobRole: Partial<InsertJobRole>): Promise<JobRole | undefined>;
  deleteJobRole(id: string): Promise<boolean>;

  // CV Upload methods (Phase 8)
  getUserCvUploads(userId: string): Promise<CvUpload[]>;
  getLatestCvUpload(userId: string): Promise<CvUpload | undefined>;
  getCvUploadById(id: string): Promise<CvUpload | undefined>;
  createCvUpload(cvUpload: InsertCvUpload): Promise<CvUpload>;
  updateCvUpload(id: string, updates: Partial<InsertCvUpload>): Promise<CvUpload | undefined>;

  // User Job Preferences methods (Phase 8)
  getUserJobPreferences(userId: string): Promise<UserJobPreferences | undefined>;
  createUserJobPreferences(preferences: InsertUserJobPreferences): Promise<UserJobPreferences>;
  updateUserJobPreferences(userId: string, updates: Partial<InsertUserJobPreferences>): Promise<UserJobPreferences | undefined>;
  getUsersAwaitingApproval(): Promise<(UserJobPreferences & { user: User; cvUpload?: CvUpload })[]>;
  approveUser(userId: string, adminId: string, notes?: string): Promise<UserJobPreferences | undefined>;

  // CV Enhancement Order methods (Phase 8)
  createCvEnhancementOrder(order: InsertCvEnhancementOrder): Promise<CvEnhancementOrder>;
  getCvEnhancementOrderById(id: string): Promise<CvEnhancementOrder | undefined>;
  getUserCvEnhancementOrders(userId: string): Promise<(CvEnhancementOrder & { cvUpload: CvUpload })[]>;
  getAllCvEnhancementOrders(): Promise<(CvEnhancementOrder & { user: User; cvUpload: CvUpload })[]>;
  updateCvEnhancementOrder(id: string, updates: Partial<InsertCvEnhancementOrder>): Promise<CvEnhancementOrder | undefined>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllPlans(): Promise<Plan[]> {
    return db.select().from(plans);
  }

  async getActivePlans(): Promise<Plan[]> {
    return db.select().from(plans).where(eq(plans.active, true));
  }

  async getPlanById(id: string): Promise<Plan | undefined> {
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0];
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const result = await db.insert(plans).values(insertPlan).returning();
    return result[0];
  }

  async updatePlan(id: string, planUpdate: Partial<InsertPlan>): Promise<Plan | undefined> {
    const result = await db
      .update(plans)
      .set(planUpdate)
      .where(eq(plans.id, id))
      .returning();
    return result[0];
  }

  async getUserPlans(userId: string): Promise<(UserPlan & { plan: Plan })[]> {
    const result = await db
      .select()
      .from(userPlans)
      .leftJoin(plans, eq(userPlans.planId, plans.id))
      .where(eq(userPlans.userId, userId));

    return result.map((row) => ({
      ...row.user_plans,
      plan: row.plans!,
    }));
  }

  async createUserPlan(insertUserPlan: InsertUserPlan): Promise<UserPlan> {
    const result = await db.insert(userPlans).values(insertUserPlan).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUserProfile(userId: string, data: { fullName?: string; phone?: string; email?: string }): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ password: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date, requestIp?: string): Promise<void> {
    await db.insert(passwordResetTokens).values({
      userId,
      tokenHash,
      expiresAt,
      requestIp,
    });
  }

  async findPasswordResetToken(tokenHash: string): Promise<{ userId: string; expiresAt: Date; consumedAt: Date | null } | undefined> {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      userId: result[0].userId,
      expiresAt: result[0].expiresAt,
      consumedAt: result[0].consumedAt,
    };
  }

  async consumePasswordResetToken(tokenHash: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ consumedAt: new Date() })
      .where(eq(passwordResetTokens.tokenHash, tokenHash));
  }

  async getUserPlanById(id: string): Promise<UserPlan | undefined> {
    const result = await db.select().from(userPlans).where(eq(userPlans.id, id)).limit(1);
    return result[0];
  }

  async updateUserPlanCredits(id: string, creditsRemaining: number): Promise<UserPlan | undefined> {
    const result = await db
      .update(userPlans)
      .set({ creditsRemaining })
      .where(eq(userPlans.id, id))
      .returning();
    return result[0];
  }

  async getApplications(
    userId: string,
    filters?: { status?: string; batchNumber?: number; submissionMode?: string }
  ): Promise<Application[]> {
    const conditions = [eq(applications.userId, userId)];

    if (filters?.status) {
      conditions.push(eq(applications.status, filters.status));
    }

    if (filters?.batchNumber !== undefined) {
      conditions.push(eq(applications.batchNumber, filters.batchNumber));
    }

    if (filters?.submissionMode) {
      conditions.push(eq(applications.submissionMode, filters.submissionMode));
    }

    return db
      .select()
      .from(applications)
      .where(and(...conditions))
      .orderBy(desc(applications.appliedDate));
  }

  async createApplications(apps: InsertApplication[]): Promise<Application[]> {
    if (apps.length === 0) return [];
    const result = await db.insert(applications).values(apps).returning();
    return result;
  }

  async getNextBatchNumber(userId: string): Promise<number> {
    const result = await db
      .select({ maxBatch: sql<number>`COALESCE(MAX(${applications.batchNumber}), 0)` })
      .from(applications)
      .where(eq(applications.userId, userId));

    return (result[0]?.maxBatch || 0) + 1;
  }

  async getUserApplicationStats(
    userId: string
  ): Promise<{ totalApplications: number; batches: number[]; automatedCount: number; manualCount: number }> {
    const apps = await db.select().from(applications).where(eq(applications.userId, userId));

    const uniqueBatches = new Set(apps.map((app) => app.batchNumber));
    const batches = Array.from(uniqueBatches).sort((a, b) => a - b);

    const automatedCount = apps.filter(app => app.submissionMode === 'automated').length;
    const manualCount = apps.filter(app => app.submissionMode === 'manual').length;

    return {
      totalApplications: apps.length,
      batches,
      automatedCount,
      manualCount,
    };
  }

  // Batch methods (Phase 3)
  async createBatch(insertBatch: InsertApplicationBatch): Promise<ApplicationBatch> {
    const result = await db.insert(applicationBatches).values(insertBatch).returning();
    return result[0];
  }

  async getBatch(id: string): Promise<ApplicationBatch | undefined> {
    const result = await db.select().from(applicationBatches).where(eq(applicationBatches.id, id)).limit(1);
    return result[0];
  }

  async getBatchByUserAndNumber(userId: string, batchNumber: number): Promise<ApplicationBatch | undefined> {
    const result = await db
      .select()
      .from(applicationBatches)
      .where(and(eq(applicationBatches.userId, userId), eq(applicationBatches.batchNumber, batchNumber)))
      .limit(1);
    return result[0];
  }

  async getUserBatches(userId: string): Promise<ApplicationBatch[]> {
    return db
      .select()
      .from(applicationBatches)
      .where(eq(applicationBatches.userId, userId))
      .orderBy(desc(applicationBatches.batchNumber));
  }

  async getAllBatches(): Promise<(ApplicationBatch & { user: User })[]> {
    const result = await db
      .select()
      .from(applicationBatches)
      .leftJoin(users, eq(applicationBatches.userId, users.id))
      .orderBy(desc(applicationBatches.createdAt));

    return result.map((row) => ({
      ...row.application_batches,
      user: row.users!,
    }));
  }

  async updateBatchStatus(
    id: string,
    status: string,
    additionalFields?: { startedAt?: Date; completedAt?: Date }
  ): Promise<ApplicationBatch | undefined> {
    const updateData: any = { status };
    if (additionalFields?.startedAt) {
      updateData.startedAt = additionalFields.startedAt;
    }
    if (additionalFields?.completedAt) {
      updateData.completedAt = additionalFields.completedAt;
    }

    const result = await db
      .update(applicationBatches)
      .set(updateData)
      .where(eq(applicationBatches.id, id))
      .returning();
    return result[0];
  }

  // Automation Job methods (Phase 3)
  async createAutomationJob(insertJob: InsertAutomationJob): Promise<AutomationJob> {
    const result = await db.insert(automationJobs).values(insertJob).returning();
    return result[0];
  }

  async getAutomationJob(id: string): Promise<AutomationJob | undefined> {
    const result = await db.select().from(automationJobs).where(eq(automationJobs.id, id)).limit(1);
    return result[0];
  }

  async getUserAutomationJobs(userId: string): Promise<AutomationJob[]> {
    return db
      .select()
      .from(automationJobs)
      .where(eq(automationJobs.userId, userId))
      .orderBy(desc(automationJobs.createdAt));
  }

  async getAllAutomationJobs(): Promise<AutomationJob[]> {
    return db
      .select()
      .from(automationJobs)
      .orderBy(desc(automationJobs.createdAt));
  }

  async updateAutomationJobStatus(
    id: string,
    status: string,
    errorLog?: string,
    executedAt?: Date
  ): Promise<AutomationJob | undefined> {
    const updateData: any = { status };
    if (errorLog) {
      updateData.errorLog = errorLog;
    }
    if (executedAt) {
      updateData.executedAt = executedAt;
    }

    const result = await db
      .update(automationJobs)
      .set(updateData)
      .where(eq(automationJobs.id, id))
      .returning();
    return result[0];
  }

  // Notification Preferences methods (Phase 3)
  async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | undefined> {
    const result = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId))
      .limit(1);
    return result[0];
  }

  async createUserNotificationPreferences(
    insertPrefs: InsertUserNotificationPreferences
  ): Promise<UserNotificationPreferences> {
    const result = await db.insert(userNotificationPreferences).values(insertPrefs).returning();
    return result[0];
  }

  async updateUserNotificationPreferences(
    userId: string,
    prefsUpdate: Partial<InsertUserNotificationPreferences>
  ): Promise<UserNotificationPreferences | undefined> {
    const result = await db
      .update(userNotificationPreferences)
      .set({ ...prefsUpdate, updatedAt: new Date() })
      .where(eq(userNotificationPreferences.userId, userId))
      .returning();
    return result[0];
  }

  // Notification methods (Phase 3)
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    return db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return result[0];
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .returning();
    return result.length;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return Number(result[0]?.count || 0);
  }

  async updateUserPhone(userId: string, phone: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ phone })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  // AI Artifact methods (Phase 3)
  async createAiArtifact(insertArtifact: InsertAiArtifact): Promise<AiArtifact> {
    const result = await db.insert(aiArtifacts).values(insertArtifact).returning();
    return result[0];
  }

  async getApplicationArtifacts(applicationId: string): Promise<AiArtifact[]> {
    return db
      .select()
      .from(aiArtifacts)
      .where(eq(aiArtifacts.applicationId, applicationId))
      .orderBy(desc(aiArtifacts.generatedAt));
  }

  async getUserArtifacts(userId: string): Promise<AiArtifact[]> {
    return db
      .select()
      .from(aiArtifacts)
      .where(eq(aiArtifacts.userId, userId))
      .orderBy(desc(aiArtifacts.generatedAt));
  }

  // Resource methods (Phase 4)
  async getAllResources(filters?: { category?: string; isPaid?: boolean; featured?: boolean }): Promise<Resource[]> {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.isPaid !== undefined) {
      conditions.push(eq(resources.isPaid, filters.isPaid));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(resources.featured, filters.featured));
    }

    return db
      .select()
      .from(resources)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(resources.createdAt));
  }

  async getActiveResources(filters?: { category?: string; isPaid?: boolean; featured?: boolean }): Promise<Resource[]> {
    const conditions = [eq(resources.active, true)];
    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.isPaid !== undefined) {
      conditions.push(eq(resources.isPaid, filters.isPaid));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(resources.featured, filters.featured));
    }

    return db
      .select()
      .from(resources)
      .where(and(...conditions))
      .orderBy(desc(resources.createdAt));
  }

  async getResourceById(id: string): Promise<Resource | undefined> {
    const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    return result[0];
  }

  async getResourceBySlug(slug: string): Promise<Resource | undefined> {
    const result = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
    return result[0];
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const result = await db.insert(resources).values(insertResource).returning();
    return result[0];
  }

  async updateResource(id: string, resourceUpdate: Partial<InsertResource>): Promise<Resource | undefined> {
    const result = await db
      .update(resources)
      .set({ ...resourceUpdate, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return result[0];
  }

  async deleteResource(id: string): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning();
    return result.length > 0;
  }

  // Blog Post methods (Phase 4)
  async getAllBlogPosts(filters?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(blogPosts.category, filters.category));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(blogPosts.featured, filters.featured));
    }

    return db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getPublishedBlogPosts(filters?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
    const conditions = [eq(blogPosts.published, true)];
    if (filters?.category) {
      conditions.push(eq(blogPosts.category, filters.category));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(blogPosts.featured, filters.featured));
    }

    return db
      .select()
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return result[0];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result[0];
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(insertBlogPost).returning();
    return result[0];
  }

  async updateBlogPost(id: string, postUpdate: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const result = await db
      .update(blogPosts)
      .set({ ...postUpdate, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return result[0];
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }

  // User Resource methods (Phase 4)
  async getUserResources(userId: string): Promise<(UserResource & { resource: Resource })[]> {
    const result = await db
      .select()
      .from(userResources)
      .leftJoin(resources, eq(userResources.resourceId, resources.id))
      .where(eq(userResources.userId, userId))
      .orderBy(desc(userResources.purchasedAt));

    return result.map(row => ({
      ...row.user_resources,
      resource: row.resources!,
    }));
  }

  async hasUserPurchasedResource(userId: string, resourceId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userResources)
      .where(and(eq(userResources.userId, userId), eq(userResources.resourceId, resourceId)))
      .limit(1);
    
    return result.length > 0;
  }

  async createUserResource(insertUserResource: InsertUserResource): Promise<UserResource> {
    const result = await db.insert(userResources).values(insertUserResource).returning();
    return result[0];
  }

  // Analytics methods (Phase 5)
  async getUserAnalytics(userId: string) {
    const apps = await db.select().from(applications).where(eq(applications.userId, userId));
    const userPlansData = await db.select().from(userPlans).where(eq(userPlans.userId, userId));

    const totalApplications = apps.length;

    const statusBreakdown = apps.reduce((acc, app) => {
      const existing = acc.find(item => item.status === app.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: app.status, count: 1 });
      }
      return acc;
    }, [] as { status: string; count: number }[]);

    const timelineMap = apps.reduce((acc, app) => {
      const date = app.appliedDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const applicationTimeline = Object.entries(timelineMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalCreditsFromPlans = userPlansData.reduce((sum, plan) => {
      return sum + (plan.creditsRemaining || 0);
    }, 0);

    const creditsRemaining = totalCreditsFromPlans;
    const creditsUsed = totalApplications;

    const offersCount = apps.filter(app => app.status === 'offer').length;
    const successRate = totalApplications > 0 ? (offersCount / totalApplications) * 100 : 0;

    const batchMap = apps.reduce((acc, app) => {
      if (!acc[app.batchNumber]) {
        acc[app.batchNumber] = { count: 0, statuses: {} };
      }
      acc[app.batchNumber].count++;
      acc[app.batchNumber].statuses[app.status] = (acc[app.batchNumber].statuses[app.status] || 0) + 1;
      return acc;
    }, {} as Record<number, { count: number; statuses: Record<string, number> }>);

    const batchStats = Object.entries(batchMap)
      .map(([batchNumber, data]) => ({
        batchNumber: parseInt(batchNumber),
        count: data.count,
        statuses: data.statuses,
      }))
      .sort((a, b) => b.batchNumber - a.batchNumber);

    return {
      totalApplications,
      statusBreakdown,
      applicationTimeline,
      creditsUsed,
      creditsRemaining,
      successRate,
      batchStats,
    };
  }

  async getAdminAnalytics() {
    const allUsers = await db.select().from(users);
    const allApplications = await db.select().from(applications);
    const allUserPlans = await db.select().from(userPlans);
    const allBatches = await db.select().from(applicationBatches);

    const totalUsers = allUsers.length;
    const totalApplications = allApplications.length;

    const totalCreditsDistributed = allUserPlans.reduce((sum, plan) => {
      return sum + (plan.creditsRemaining || 0);
    }, 0);

    const totalCreditsUsed = totalApplications;

    const offersCount = allApplications.filter(app => app.status === 'offer').length;
    const platformSuccessRate = totalApplications > 0 ? (offersCount / totalApplications) * 100 : 0;

    const userActivityMap = allUsers.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { newUsers: 0, applications: 0 };
      }
      acc[date].newUsers++;
      return acc;
    }, {} as Record<string, { newUsers: number; applications: number }>);

    allApplications.forEach(app => {
      const date = app.appliedDate.toISOString().split('T')[0];
      if (userActivityMap[date]) {
        userActivityMap[date].applications++;
      } else {
        userActivityMap[date] = { newUsers: 0, applications: 1 };
      }
    });

    const userActivity = Object.entries(userActivityMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalBatches = allBatches.length;
    const avgApplicationsPerBatch = totalBatches > 0 ? totalApplications / totalBatches : 0;

    return {
      totalUsers,
      totalApplications,
      totalCreditsDistributed,
      totalCreditsUsed,
      platformSuccessRate,
      userActivity,
      batchPerformance: { totalBatches, avgApplicationsPerBatch },
    };
  }

  // Phase 7 - Subscription methods
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(insertSubscription).returning();
    return result[0];
  }

  async getSubscriptionById(id: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    return result[0];
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)).limit(1);
    return result[0];
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt));
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set({ ...updates, updatedAt: new Date() }).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  async getUserPlansBySubscriptionId(subscriptionId: string): Promise<UserPlan[]> {
    return db.select().from(userPlans).where(eq(userPlans.subscriptionId, subscriptionId));
  }

  async updateUserPlan(id: string, updates: Partial<InsertUserPlan>): Promise<UserPlan | undefined> {
    const result = await db.update(userPlans).set(updates).where(eq(userPlans.id, id)).returning();
    return result[0];
  }

  async getExpiredUserPlans(gracePeriodEnd: Date): Promise<UserPlan[]> {
    return db.select().from(userPlans).where(
      and(
        eq(userPlans.status, 'active'),
        sql`${userPlans.expiresAt} < ${gracePeriodEnd}`
      )
    );
  }

  // Phase 7 - Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  async getUserTransactions(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(limit).offset(offset);
  }

  async getAllTransactions(limit: number = 100, offset: number = 0): Promise<(Transaction & { user: User })[]> {
    const results = await db
      .select()
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map(row => ({
      ...row.transactions,
      user: row.users!,
    }));
  }

  // Phase 7 - Promo Code methods
  async createPromoCode(insertPromoCode: InsertPromoCode): Promise<PromoCode> {
    const result = await db.insert(promoCodes).values(insertPromoCode).returning();
    return result[0];
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase())).limit(1);
    return result[0];
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async updatePromoCode(id: string, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const result = await db.update(promoCodes).set(updates).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }

  async deletePromoCode(id: string): Promise<boolean> {
    const result = await db.delete(promoCodes).where(eq(promoCodes.id, id)).returning();
    return result.length > 0;
  }

  async incrementPromoCodeUsage(id: string): Promise<PromoCode | undefined> {
    const result = await db.update(promoCodes).set({ currentUses: sql`${promoCodes.currentUses} + 1` }).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }

  async validatePromoCode(code: string): Promise<{ valid: boolean; promoCode?: PromoCode; error?: string }> {
    const promoCode = await this.getPromoCodeByCode(code);

    if (!promoCode) {
      return { valid: false, error: 'Promo code not found' };
    }

    if (!promoCode.active) {
      return { valid: false, error: 'Promo code is no longer active' };
    }

    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return { valid: false, error: 'Promo code has expired' };
    }

    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    return { valid: true, promoCode };
  }

  // Phase 7 - Payment Method methods
  async createPaymentMethod(insertPaymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const result = await db.insert(paymentMethods).values(insertPaymentMethod).returning();
    return result[0];
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.isDefault));
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return result.length > 0;
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
    await db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, paymentMethodId));
  }

  // Phase 8 - Job Role methods
  async getAllJobRoles(): Promise<JobRole[]> {
    return db.select().from(jobRoles).orderBy(jobRoles.roleType, jobRoles.roleName);
  }

  async getActiveJobRoles(): Promise<JobRole[]> {
    return db.select().from(jobRoles).where(eq(jobRoles.active, true)).orderBy(jobRoles.roleType, jobRoles.roleName);
  }

  async getJobRoleById(id: string): Promise<JobRole | undefined> {
    const result = await db.select().from(jobRoles).where(eq(jobRoles.id, id)).limit(1);
    return result[0];
  }

  async getJobRoleByRoleId(roleId: string): Promise<JobRole | undefined> {
    const result = await db.select().from(jobRoles).where(eq(jobRoles.roleId, roleId)).limit(1);
    return result[0];
  }

  async createJobRole(insertJobRole: InsertJobRole): Promise<JobRole> {
    const result = await db.insert(jobRoles).values(insertJobRole).returning();
    return result[0];
  }

  async createJobRoles(insertJobRoles: InsertJobRole[]): Promise<JobRole[]> {
    const result = await db.insert(jobRoles).values(insertJobRoles).returning();
    return result;
  }

  async updateJobRole(id: string, updates: Partial<InsertJobRole>): Promise<JobRole | undefined> {
    const result = await db.update(jobRoles).set({ ...updates, updatedAt: new Date() }).where(eq(jobRoles.id, id)).returning();
    return result[0];
  }

  async deleteJobRole(id: string): Promise<boolean> {
    const result = await db.delete(jobRoles).where(eq(jobRoles.id, id)).returning();
    return result.length > 0;
  }

  // Phase 8 - CV Upload methods
  async getUserCvUploads(userId: string): Promise<CvUpload[]> {
    return db.select().from(cvUploads).where(eq(cvUploads.userId, userId)).orderBy(desc(cvUploads.uploadedAt));
  }

  async getLatestCvUpload(userId: string): Promise<CvUpload | undefined> {
    const result = await db.select().from(cvUploads).where(eq(cvUploads.userId, userId)).orderBy(desc(cvUploads.uploadedAt)).limit(1);
    return result[0];
  }

  async getCvUploadById(id: string): Promise<CvUpload | undefined> {
    const result = await db.select().from(cvUploads).where(eq(cvUploads.id, id)).limit(1);
    return result[0];
  }

  async createCvUpload(insertCvUpload: InsertCvUpload): Promise<CvUpload> {
    const result = await db.insert(cvUploads).values(insertCvUpload).returning();
    return result[0];
  }

  async updateCvUpload(id: string, updates: Partial<InsertCvUpload>): Promise<CvUpload | undefined> {
    const result = await db.update(cvUploads).set(updates).where(eq(cvUploads.id, id)).returning();
    return result[0];
  }

  // Phase 8 - User Job Preferences methods
  async getUserJobPreferences(userId: string): Promise<UserJobPreferences | undefined> {
    const result = await db.select().from(userJobPreferences).where(eq(userJobPreferences.userId, userId)).limit(1);
    return result[0];
  }

  async createUserJobPreferences(insertPreferences: InsertUserJobPreferences): Promise<UserJobPreferences> {
    const result = await db.insert(userJobPreferences).values(insertPreferences).returning();
    return result[0];
  }

  async updateUserJobPreferences(userId: string, updates: Partial<InsertUserJobPreferences>): Promise<UserJobPreferences | undefined> {
    const result = await db.update(userJobPreferences).set({ ...updates, updatedAt: new Date() }).where(eq(userJobPreferences.userId, userId)).returning();
    return result[0];
  }

  async getUsersAwaitingApproval(): Promise<(UserJobPreferences & { user: User; cvUpload?: CvUpload })[]> {
    const results = await db
      .select()
      .from(userJobPreferences)
      .leftJoin(users, eq(userJobPreferences.userId, users.id))
      .leftJoin(cvUploads, eq(users.id, cvUploads.userId))
      .where(
        and(
          eq(userJobPreferences.setupCompleted, true),
          eq(userJobPreferences.adminApproved, false)
        )
      )
      .orderBy(desc(userJobPreferences.createdAt));

    return results.map(row => ({
      ...row.user_job_preferences,
      user: row.users!,
      cvUpload: row.cv_uploads || undefined,
    }));
  }

  async approveUser(userId: string, adminId: string, notes?: string): Promise<UserJobPreferences | undefined> {
    const result = await db.update(userJobPreferences).set({
      adminApproved: true,
      adminApprovedBy: adminId,
      adminApprovedAt: new Date(),
      adminNotes: notes,
      updatedAt: new Date(),
    }).where(eq(userJobPreferences.userId, userId)).returning();
    return result[0];
  }

  // Phase 8 - CV Enhancement Order methods
  async createCvEnhancementOrder(insertOrder: InsertCvEnhancementOrder): Promise<CvEnhancementOrder> {
    const result = await db.insert(cvEnhancementOrders).values(insertOrder).returning();
    return result[0];
  }

  async getCvEnhancementOrderById(id: string): Promise<CvEnhancementOrder | undefined> {
    const result = await db.select().from(cvEnhancementOrders).where(eq(cvEnhancementOrders.id, id)).limit(1);
    return result[0];
  }

  async getUserCvEnhancementOrders(userId: string): Promise<(CvEnhancementOrder & { cvUpload: CvUpload })[]> {
    const results = await db
      .select()
      .from(cvEnhancementOrders)
      .leftJoin(cvUploads, eq(cvEnhancementOrders.cvUploadId, cvUploads.id))
      .where(eq(cvEnhancementOrders.userId, userId))
      .orderBy(desc(cvEnhancementOrders.createdAt));

    return results.map(row => ({
      ...row.cv_enhancement_orders,
      cvUpload: row.cv_uploads!,
    }));
  }

  async getAllCvEnhancementOrders(): Promise<(CvEnhancementOrder & { user: User; cvUpload: CvUpload })[]> {
    const results = await db
      .select()
      .from(cvEnhancementOrders)
      .leftJoin(users, eq(cvEnhancementOrders.userId, users.id))
      .leftJoin(cvUploads, eq(cvEnhancementOrders.cvUploadId, cvUploads.id))
      .orderBy(desc(cvEnhancementOrders.createdAt));

    return results.map(row => ({
      ...row.cv_enhancement_orders,
      user: row.users!,
      cvUpload: row.cv_uploads!,
    }));
  }

  async updateCvEnhancementOrder(id: string, updates: Partial<InsertCvEnhancementOrder>): Promise<CvEnhancementOrder | undefined> {
    const result = await db.update(cvEnhancementOrders).set(updates).where(eq(cvEnhancementOrders.id, id)).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
