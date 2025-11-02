import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import multer from "multer";
import { pool } from "./db";
import { storage } from "./storage";
import { insertUserSchema, insertPlanSchema, type User } from "@shared/schema";
import { z } from "zod";
import { parseCSV, convertCSVToApplications } from "./utils/csvParser";
import { automationService } from "./services/automation";
import { notificationService } from "./services/notifications";
import { sendEmail, getPasswordResetEmail } from "./services/emailService";
import crypto from "crypto";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  next();
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).send({ error: "Forbidden - Admin access required" });
  }

  next();
};

const upload = multer({ storage: multer.memoryStorage() });

const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  app.set('trust proxy', 1);
  
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "jobapply-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const registrationSchema = insertUserSchema.omit({ role: true });
      const validatedData = registrationSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).send({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: "user",
      });

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).send(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).send({ error: "Failed to register user" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).send({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).send({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.send(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send({ error: "Failed to login" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send({ error: "Failed to logout" });
      }
      res.send({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.send(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).send({ error: "Failed to get user" });
    }
  });

  // Password Reset Routes
  app.post("/api/password/forgot", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(token, 10);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await storage.createPasswordResetToken(user.id, tokenHash, expiresAt, req.ip);

        const origin = req.get('origin') || `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        const resetLink = `${origin}/reset-password?token=${token}`;

        await sendEmail({
          to: user.email,
          subject: 'Password Reset Request - JobApply.pro',
          html: getPasswordResetEmail(resetLink, user.email),
        });
      }

      res.send({ message: "If an account exists with that email, a password reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).send({ error: "Failed to process password reset request" });
    }
  });

  app.post("/api/password/reset", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).send({ error: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).send({ error: "Password must be at least 6 characters" });
      }

      const tokenRecord = await storage.findPasswordResetToken(token);
      
      if (!tokenRecord) {
        return res.status(400).send({ error: "Invalid or expired reset link" });
      }

      if (tokenRecord.consumedAt) {
        return res.status(400).send({ error: "This reset link has already been used" });
      }

      if (new Date() > new Date(tokenRecord.expiresAt)) {
        return res.status(400).send({ error: "This reset link has expired" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(tokenRecord.userId, hashedPassword);
      await storage.consumePasswordResetToken(token);

      res.send({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).send({ error: "Failed to reset password" });
    }
  });

  // Profile Management Routes
  app.get("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.send(userWithoutPassword);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).send({ error: "Failed to get profile" });
    }
  });

  app.patch("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const updateSchema = z.object({
        fullName: z.string().min(1, "Full name is required").optional(),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
        email: z.string().email("Invalid email address").optional(),
      });

      const validatedData = updateSchema.parse(req.body);

      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== req.session.userId) {
          return res.status(400).send({ error: "Email already in use" });
        }
      }

      const updatedUser = await storage.updateUserProfile(req.session.userId!, validatedData);
      
      if (!updatedUser) {
        return res.status(404).send({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.send(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Update profile error:", error);
      res.status(500).send({ error: "Failed to update profile" });
    }
  });

  app.patch("/api/profile/password", requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).send({ error: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).send({ error: "New password must be at least 6 characters" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).send({ error: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.send({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).send({ error: "Failed to update password" });
    }
  });

  app.get("/api/plans", async (req: Request, res: Response) => {
    try {
      const plans = await storage.getActivePlans();
      res.send(plans);
    } catch (error) {
      console.error("Get plans error:", error);
      res.status(500).send({ error: "Failed to get plans" });
    }
  });

  app.get("/api/admin/plans", requireAdmin, async (req: Request, res: Response) => {
    try {
      const plans = await storage.getAllPlans();
      res.send(plans);
    } catch (error) {
      console.error("Get all plans error:", error);
      res.status(500).send({ error: "Failed to get plans" });
    }
  });

  app.post("/api/admin/plans", requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(validatedData);
      res.status(201).send(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Create plan error:", error);
      res.status(500).send({ error: "Failed to create plan" });
    }
  });

  app.patch("/api/admin/plans/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertPlanSchema.partial().parse(req.body);
      
      const updatedPlan = await storage.updatePlan(id, validatedData);
      if (!updatedPlan) {
        return res.status(404).send({ error: "Plan not found" });
      }

      res.send(updatedPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Update plan error:", error);
      res.status(500).send({ error: "Failed to update plan" });
    }
  });

  app.get("/api/user/plans", requireAuth, async (req: Request, res: Response) => {
    try {
      const userPlans = await storage.getUserPlans(req.session.userId!);
      res.send(userPlans);
    } catch (error) {
      console.error("Get user plans error:", error);
      res.status(500).send({ error: "Failed to get user plans" });
    }
  });

  app.get("/api/applications", requireAuth, async (req: Request, res: Response) => {
    try {
      const { status, batchNumber, submissionMode } = req.query;
      const filters: { status?: string; batchNumber?: number; submissionMode?: string } = {};

      if (status && typeof status === "string") {
        filters.status = status;
      }

      if (batchNumber) {
        filters.batchNumber = parseInt(batchNumber as string);
      }

      if (submissionMode && typeof submissionMode === "string") {
        filters.submissionMode = submissionMode;
      }

      const applications = await storage.getApplications(req.session.userId!, filters);
      res.send(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).send({ error: "Failed to get applications" });
    }
  });

  app.get("/api/user/batches", requireAuth, async (req: Request, res: Response) => {
    try {
      const batches = await storage.getUserBatches(req.session.userId!);
      res.send(batches);
    } catch (error) {
      console.error("Get user batches error:", error);
      res.status(500).send({ error: "Failed to get batch information" });
    }
  });

  app.get("/api/user/automation-stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const appStats = await storage.getUserApplicationStats(userId);
      const automationStats = await automationService.getUserAutomationStats(userId);

      res.send({
        ...appStats,
        ...automationStats,
      });
    } catch (error) {
      console.error("Get automation stats error:", error);
      res.status(500).send({ error: "Failed to get automation statistics" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.send(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).send({ error: "Failed to get users" });
    }
  });

  app.post(
    "/api/admin/applications/upload",
    requireAdmin,
    upload.single("csvFile"),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.body;

        if (!userId) {
          return res.status(400).send({ error: "User ID is required" });
        }

        if (!req.file) {
          return res.status(400).send({ error: "CSV file is required" });
        }

        const csvContent = req.file.buffer.toString("utf-8");
        const { data, errors } = parseCSV(csvContent);

        if (errors.length > 0) {
          return res.status(400).send({ error: "CSV validation failed", details: errors });
        }

        if (data.length === 0) {
          return res.status(400).send({ error: "CSV file contains no valid data" });
        }

        const userPlans = await storage.getUserPlans(userId);
        const activePlans = userPlans.filter((up) => up.creditsRemaining > 0);

        if (activePlans.length === 0) {
          return res.status(400).send({ error: "User has no active plans with credits" });
        }

        let totalCreditsAvailable = activePlans.reduce(
          (sum, plan) => sum + plan.creditsRemaining,
          0
        );

        if (totalCreditsAvailable < data.length) {
          return res.status(400).send({
            error: `Insufficient credits. User has ${totalCreditsAvailable} credits but needs ${data.length}`,
          });
        }

        const batchNumber = await storage.getNextBatchNumber(userId);

        const applicationsToCreate = convertCSVToApplications(
          data,
          userId,
          activePlans[0].id,
          batchNumber
        );

        const createdApplications = await storage.createApplications(applicationsToCreate);

        let creditsToDeduct = data.length;
        for (const plan of activePlans) {
          if (creditsToDeduct <= 0) break;

          const deduction = Math.min(creditsToDeduct, plan.creditsRemaining);
          await storage.updateUserPlanCredits(plan.id, plan.creditsRemaining - deduction);
          creditsToDeduct -= deduction;
        }

        const batch = await storage.createBatch({
          userId,
          batchNumber,
          totalApplications: createdApplications.length,
          status: "pending",
          submissionMode: "manual",
        });

        res.send({
          message: `Successfully uploaded ${createdApplications.length} applications`,
          applicationsCreated: createdApplications.length,
          batchNumber,
          creditsDeducted: data.length,
          batchId: batch.id,
        });
      } catch (error) {
        console.error("CSV upload error:", error);
        res.status(500).send({ error: "Failed to upload applications" });
      }
    }
  );

  app.get("/api/admin/batches", requireAdmin, async (req: Request, res: Response) => {
    try {
      const batches = await storage.getAllBatches();
      res.send(batches);
    } catch (error) {
      console.error("Get all batches error:", error);
      res.status(500).send({ error: "Failed to get batches" });
    }
  });

  app.patch("/api/admin/batches/:id/status", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).send({ error: "Status is required" });
      }

      const validStatuses = ["pending", "processing", "completed", "failed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).send({ error: "Invalid status value" });
      }

      const additionalFields: { startedAt?: Date; completedAt?: Date } = {};

      if (status === "processing") {
        additionalFields.startedAt = new Date();
      }

      if (status === "completed" || status === "failed") {
        additionalFields.completedAt = new Date();
      }

      const batch = await storage.updateBatchStatus(id, status, additionalFields);

      if (!batch) {
        return res.status(404).send({ error: "Batch not found" });
      }

      if (status === "processing") {
        await notificationService.notifyBatchProcessing(
          batch.userId,
          batch.batchNumber,
          batch.totalApplications
        );
      }

      if (status === "completed") {
        await notificationService.notifyBatchCompletion(
          batch.userId,
          batch.batchNumber,
          batch.totalApplications
        );
      }

      if (status === "failed") {
        await notificationService.notifyBatchFailure(
          batch.userId,
          batch.batchNumber,
          "Batch processing failed"
        );
      }

      res.send(batch);
    } catch (error) {
      console.error("Update batch status error:", error);
      res.status(500).send({ error: "Failed to update batch status" });
    }
  });

  app.post("/api/admin/batches/:id/complete", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const batch = await storage.updateBatchStatus(id, "completed", {
        completedAt: new Date(),
      });

      if (!batch) {
        return res.status(404).send({ error: "Batch not found" });
      }

      await notificationService.notifyBatchCompletion(
        batch.userId,
        batch.batchNumber,
        batch.totalApplications
      );

      res.send(batch);
    } catch (error) {
      console.error("Complete batch error:", error);
      res.status(500).send({ error: "Failed to complete batch" });
    }
  });

  app.get("/api/admin/automation/jobs", requireAdmin, async (req: Request, res: Response) => {
    try {
      const jobs = await storage.getAllAutomationJobs();
      res.send(jobs);
    } catch (error) {
      console.error("Get automation jobs error:", error);
      res.status(500).send({ error: "Failed to get automation jobs" });
    }
  });

  app.post("/api/admin/automation/jobs", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, batchId, provider, payload } = req.body;

      if (!userId || !provider) {
        return res.status(400).send({ error: "userId and provider are required" });
      }

      const validProviders = ["linkedin", "indeed", "other"];
      if (!validProviders.includes(provider)) {
        return res.status(400).send({ error: "Invalid provider" });
      }

      const job = await automationService.createJob(userId, provider, batchId, payload);

      res.status(201).send(job);
    } catch (error) {
      console.error("Create automation job error:", error);
      res.status(500).send({ error: "Failed to create automation job" });
    }
  });

  app.get("/api/user/notification-preferences", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      let preferences = await storage.getUserNotificationPreferences(userId);

      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          userId,
          emailEnabled: true,
          smsEnabled: false,
          batchCompletionAlerts: true,
          statusUpdateAlerts: true,
        });
      }

      res.send(preferences);
    } catch (error) {
      console.error("Get notification preferences error:", error);
      res.status(500).send({ error: "Failed to get notification preferences" });
    }
  });

  app.put("/api/user/notification-preferences", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { emailEnabled, smsEnabled, batchCompletionAlerts, statusUpdateAlerts } = req.body;

      let preferences = await storage.getUserNotificationPreferences(userId);

      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          userId,
          emailEnabled: emailEnabled ?? true,
          smsEnabled: smsEnabled ?? false,
          batchCompletionAlerts: batchCompletionAlerts ?? true,
          statusUpdateAlerts: statusUpdateAlerts ?? true,
        });
      } else {
        preferences = await storage.updateUserNotificationPreferences(userId, {
          emailEnabled,
          smsEnabled,
          batchCompletionAlerts,
          statusUpdateAlerts,
        });
      }

      res.send(preferences);
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).send({ error: "Failed to update notification preferences" });
    }
  });

  app.put("/api/user/phone", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { phone } = req.body;

      const user = await storage.updateUserPhone(userId, phone || "");
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      res.send({ phone: user.phone });
    } catch (error) {
      console.error("Update phone number error:", error);
      res.status(500).send({ error: "Failed to update phone number" });
    }
  });

  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const unreadOnly = req.query.unreadOnly === "true";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const notifications = await storage.getUserNotifications(userId, unreadOnly, limit, offset);
      res.send(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).send({ error: "Failed to get notifications" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const count = await storage.getUnreadNotificationCount(userId);
      res.send({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).send({ error: "Failed to get unread count" });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      const notification = await storage.markNotificationAsRead(id, userId);

      if (!notification) {
        return res.status(404).send({ error: "Notification not found" });
      }

      res.send(notification);
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).send({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const count = await storage.markAllNotificationsAsRead(userId);
      res.send({ updated: count });
    } catch (error) {
      console.error("Mark all as read error:", error);
      res.status(500).send({ error: "Failed to mark all as read" });
    }
  });

  // Phase 4: Resources Routes (Public)
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const { category, featured } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (featured === "true") filters.featured = true;

      const resources = await storage.getActiveResources(filters);
      res.send(resources);
    } catch (error) {
      console.error("Get resources error:", error);
      res.status(500).send({ error: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const resource = await storage.getResourceBySlug(slug);

      if (!resource) {
        return res.status(404).send({ error: "Resource not found" });
      }

      if (!resource.active) {
        return res.status(404).send({ error: "Resource not available" });
      }

      res.send(resource);
    } catch (error) {
      console.error("Get resource error:", error);
      res.status(500).send({ error: "Failed to fetch resource" });
    }
  });

  // Phase 4: User Resource Routes (Protected)
  app.get("/api/user/resources", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const userResources = await storage.getUserResources(userId);
      res.send(userResources);
    } catch (error) {
      console.error("Get user resources error:", error);
      res.status(500).send({ error: "Failed to fetch user resources" });
    }
  });

  app.post("/api/resources/:id/purchase", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { id } = req.params;
      const { purchaseMethod } = req.body;

      const resource = await storage.getResourceById(id);
      if (!resource) {
        return res.status(404).send({ error: "Resource not found" });
      }

      if (!resource.active) {
        return res.status(400).send({ error: "Resource not available" });
      }

      const alreadyPurchased = await storage.hasUserPurchasedResource(userId, id);
      if (alreadyPurchased) {
        return res.status(400).send({ error: "You already own this resource" });
      }

      if (!resource.isPaid) {
        const userResource = await storage.createUserResource({
          userId,
          resourceId: id,
          purchaseMethod: "free",
          creditsSpent: null,
          amountPaid: null,
        });
        return res.status(201).send(userResource);
      }

      if (purchaseMethod === "credits") {
        if (!resource.credits) {
          return res.status(400).send({ error: "Credits not accepted for this resource" });
        }

        const userPlans = await storage.getUserPlans(userId);
        const totalCredits = userPlans.reduce((sum, up) => sum + up.creditsRemaining, 0);

        if (totalCredits < resource.credits) {
          return res.status(400).send({ error: "Insufficient credits" });
        }

        let creditsToDeduct = resource.credits;
        for (const userPlan of userPlans.sort((a, b) => 
          new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime()
        )) {
          if (creditsToDeduct === 0) break;
          
          const deduction = Math.min(userPlan.creditsRemaining, creditsToDeduct);
          await storage.updateUserPlanCredits(userPlan.id, userPlan.creditsRemaining - deduction);
          creditsToDeduct -= deduction;
        }

        const userResource = await storage.createUserResource({
          userId,
          resourceId: id,
          purchaseMethod: "credits",
          creditsSpent: resource.credits,
          amountPaid: null,
        });

        return res.status(201).send(userResource);
      }

      if (purchaseMethod === "payment") {
        const userResource = await storage.createUserResource({
          userId,
          resourceId: id,
          purchaseMethod: "payment",
          creditsSpent: null,
          amountPaid: resource.price || "0",
        });

        return res.status(201).send(userResource);
      }

      res.status(400).send({ error: "Invalid purchase method" });
    } catch (error) {
      console.error("Purchase resource error:", error);
      res.status(500).send({ error: "Failed to purchase resource" });
    }
  });

  // Phase 4: Blog Routes (Public)
  app.get("/api/blog", async (req: Request, res: Response) => {
    try {
      const { category, featured } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (featured === "true") filters.featured = true;

      const posts = await storage.getPublishedBlogPosts(filters);
      res.send(posts);
    } catch (error) {
      console.error("Get blog posts error:", error);
      res.status(500).send({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);

      if (!post) {
        return res.status(404).send({ error: "Blog post not found" });
      }

      if (!post.published) {
        return res.status(404).send({ error: "Blog post not available" });
      }

      res.send(post);
    } catch (error) {
      console.error("Get blog post error:", error);
      res.status(500).send({ error: "Failed to fetch blog post" });
    }
  });

  // Phase 4: Admin Resource Routes
  app.get("/api/admin/resources", requireAdmin, async (req: Request, res: Response) => {
    try {
      const resources = await storage.getAllResources();
      res.send(resources);
    } catch (error) {
      console.error("Get all resources error:", error);
      res.status(500).send({ error: "Failed to fetch resources" });
    }
  });

  app.post("/api/admin/resources", requireAdmin, async (req: Request, res: Response) => {
    try {
      const resource = await storage.createResource(req.body);
      res.status(201).send(resource);
    } catch (error) {
      console.error("Create resource error:", error);
      res.status(500).send({ error: "Failed to create resource" });
    }
  });

  app.patch("/api/admin/resources/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const resource = await storage.updateResource(id, req.body);

      if (!resource) {
        return res.status(404).send({ error: "Resource not found" });
      }

      res.send(resource);
    } catch (error) {
      console.error("Update resource error:", error);
      res.status(500).send({ error: "Failed to update resource" });
    }
  });

  app.delete("/api/admin/resources/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteResource(id);

      if (!deleted) {
        return res.status(404).send({ error: "Resource not found" });
      }

      res.send({ success: true });
    } catch (error) {
      console.error("Delete resource error:", error);
      res.status(500).send({ error: "Failed to delete resource" });
    }
  });

  // Phase 4: Admin Blog Routes
  app.get("/api/admin/blog", requireAdmin, async (req: Request, res: Response) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.send(posts);
    } catch (error) {
      console.error("Get all blog posts error:", error);
      res.status(500).send({ error: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog", requireAdmin, async (req: Request, res: Response) => {
    try {
      const post = await storage.createBlogPost(req.body);
      res.status(201).send(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(500).send({ error: "Failed to create blog post" });
    }
  });

  app.patch("/api/admin/blog/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const post = await storage.updateBlogPost(id, req.body);

      if (!post) {
        return res.status(404).send({ error: "Blog post not found" });
      }

      res.send(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(500).send({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBlogPost(id);

      if (!deleted) {
        return res.status(404).send({ error: "Blog post not found" });
      }

      res.send({ success: true });
    } catch (error) {
      console.error("Delete blog post error:", error);
      res.status(500).send({ error: "Failed to delete blog post" });
    }
  });

  // Phase 5: Analytics Routes
  app.get("/api/user/analytics", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const analytics = await storage.getUserAnalytics(userId);
      res.send(analytics);
    } catch (error) {
      console.error("Get user analytics error:", error);
      res.status(500).send({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/analytics", requireAdmin, async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.send(analytics);
    } catch (error) {
      console.error("Get admin analytics error:", error);
      res.status(500).send({ error: "Failed to fetch admin analytics" });
    }
  });

  // Phase 8: Job Roles Routes
  app.get("/api/job-roles", async (req: Request, res: Response) => {
    try {
      const roles = await storage.getActiveJobRoles();
      res.send(roles);
    } catch (error) {
      console.error("Get job roles error:", error);
      res.status(500).send({ error: "Failed to fetch job roles" });
    }
  });

  app.get("/api/admin/job-roles", requireAdmin, async (req: Request, res: Response) => {
    try {
      const roles = await storage.getAllJobRoles();
      res.send(roles);
    } catch (error) {
      console.error("Get all job roles error:", error);
      res.status(500).send({ error: "Failed to fetch job roles" });
    }
  });

  app.post("/api/admin/job-roles", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { insertJobRoleSchema } = await import("@shared/schema");
      const validationResult = insertJobRoleSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).send({ error: validationResult.error.issues[0].message });
      }

      const role = await storage.createJobRole(validationResult.data);
      res.status(201).send(role);
    } catch (error) {
      console.error("Create job role error:", error);
      res.status(500).send({ error: "Failed to create job role" });
    }
  });

  app.patch("/api/admin/job-roles/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const role = await storage.updateJobRole(id, req.body);

      if (!role) {
        return res.status(404).send({ error: "Job role not found" });
      }

      res.send(role);
    } catch (error) {
      console.error("Update job role error:", error);
      res.status(500).send({ error: "Failed to update job role" });
    }
  });

  app.delete("/api/admin/job-roles/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteJobRole(id);

      if (!deleted) {
        return res.status(404).send({ error: "Job role not found" });
      }

      res.send({ success: true });
    } catch (error) {
      console.error("Delete job role error:", error);
      res.status(500).send({ error: "Failed to delete job role" });
    }
  });

  // Phase 8: CV Upload Routes
  app.post("/api/user/cv-upload", requireAuth, upload.single('cv'), async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const file = req.file;

      if (!file) {
        return res.status(400).send({ error: "No file uploaded" });
      }

      const { validateCVFile, calculateATSScore } = await import("./utils/atsScoring");
      
      const validation = validateCVFile(file.originalname, file.size);
      if (!validation.valid) {
        return res.status(400).send({ error: validation.error });
      }

      const atsScore = calculateATSScore(file.originalname, file.size);

      const cvUpload = await storage.createCvUpload({
        userId,
        originalFilename: file.originalname,
        storedFilename: file.originalname,
        fileSize: file.size,
        atsScore: atsScore.overallScore,
        atsDetails: {
          overallScore: atsScore.overallScore,
          breakdown: atsScore.breakdown,
          recommendations: atsScore.recommendations,
        },
        enhancementPurchased: false,
        enhancementCompleted: false,
      });

      res.status(201).send({
        upload: cvUpload,
        atsScore,
      });
    } catch (error) {
      console.error("CV upload error:", error);
      res.status(500).send({ error: "Failed to upload CV" });
    }
  });

  app.get("/api/user/cv-uploads", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const uploads = await storage.getUserCvUploads(userId);
      res.send(uploads);
    } catch (error) {
      console.error("Get CV uploads error:", error);
      res.status(500).send({ error: "Failed to fetch CV uploads" });
    }
  });

  app.get("/api/admin/cv-uploads", requireAdmin, async (req: Request, res: Response) => {
    try {
      const uploads = await storage.getAllCVUploads();
      res.send(uploads);
    } catch (error) {
      console.error("Get all CV uploads error:", error);
      res.status(500).send({ error: "Failed to fetch CV uploads" });
    }
  });

  // Phase 8: Job Preferences Routes
  app.post("/api/user/job-preferences", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      const { insertUserJobPreferencesSchema } = await import("@shared/schema");
      const validationResult = insertUserJobPreferencesSchema.safeParse({
        userId,
        ...req.body,
      });

      if (!validationResult.success) {
        return res.status(400).send({ error: validationResult.error.issues[0].message });
      }

      const data = validationResult.data;
      const existing = await storage.getUserJobPreferences(userId);
      
      let preferences;
      if (existing) {
        preferences = await storage.updateUserJobPreferences(userId, {
          selectedRoleIds: data.selectedRoleIds,
          preferredEmail: data.preferredEmail,
          interviewPhone: data.interviewPhone,
        });
      } else {
        preferences = await storage.createUserJobPreferences(data);
      }

      res.send(preferences);
    } catch (error) {
      console.error("Save job preferences error:", error);
      res.status(500).send({ error: "Failed to save job preferences" });
    }
  });

  app.get("/api/user/job-preferences", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const preferences = await storage.getUserJobPreferences(userId);
      res.send(preferences || null);
    } catch (error) {
      console.error("Get job preferences error:", error);
      res.status(500).send({ error: "Failed to fetch job preferences" });
    }
  });

  app.get("/api/admin/user-preferences", requireAdmin, async (req: Request, res: Response) => {
    try {
      const preferences = await storage.getAllUserJobPreferences();
      res.send(preferences);
    } catch (error) {
      console.error("Get all user preferences error:", error);
      res.status(500).send({ error: "Failed to fetch user preferences" });
    }
  });

  // Phase 8: Admin User Approval Routes
  app.get("/api/admin/user-approvals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const pendingUsers = await storage.getUsersPendingApproval();
      res.send(pendingUsers);
    } catch (error) {
      console.error("Get pending users error:", error);
      res.status(500).send({ error: "Failed to fetch pending users" });
    }
  });

  app.post("/api/admin/user-approvals/:userId/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const adminId = req.session.userId!;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      if (user.approvalStatus === "approved") {
        return res.status(400).send({ error: "User is already approved" });
      }

      const updatedUser = await storage.updateUser(userId, {
        approvalStatus: "approved",
        approvedAt: new Date(),
        approvedBy: adminId,
      });

      try {
        await notificationService.sendUserApprovedNotification(userId);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      res.send(updatedUser);
    } catch (error) {
      console.error("Approve user error:", error);
      res.status(500).send({ error: "Failed to approve user" });
    }
  });

  app.post("/api/admin/user-approvals/:userId/reject", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { rejectionReason } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      const updatedUser = await storage.updateUser(userId, {
        approvalStatus: "rejected",
      });

      res.send(updatedUser);
    } catch (error) {
      console.error("Reject user error:", error);
      res.status(500).send({ error: "Failed to reject user" });
    }
  });

  // Phase 8: CV Enhancement Order Routes
  app.get("/api/admin/cv-enhancements", requireAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllCvEnhancementOrders();
      res.send(orders);
    } catch (error) {
      console.error("Get CV enhancement orders error:", error);
      res.status(500).send({ error: "Failed to fetch CV enhancement orders" });
    }
  });

  app.get("/api/user/cv-enhancements", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const orders = await storage.getUserCvEnhancementOrders(userId);
      res.send(orders);
    } catch (error) {
      console.error("Get user CV enhancement orders error:", error);
      res.status(500).send({ error: "Failed to fetch CV enhancement orders" });
    }
  });

  app.post("/api/cv-enhancement/checkout", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { cvUploadId } = req.body;

      if (!cvUploadId) {
        return res.status(400).send({ error: "CV upload ID is required" });
      }

      const cvUpload = await storage.getCvUploadById(cvUploadId);
      if (!cvUpload || cvUpload.userId !== userId) {
        return res.status(404).send({ error: "CV upload not found" });
      }

      const allPlans = await storage.getAllPlans();
      const enhancementPlan = allPlans.find(p => p.name === "CV Enhancement");
      if (!enhancementPlan) {
        return res.status(404).send({ error: "CV Enhancement plan not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      const { createCheckoutSession } = await import("./services/paymentService");
      const session = await createCheckoutSession({
        planId: enhancementPlan.id,
        planName: "CV Enhancement Service",
        amount: Number(enhancementPlan.price),
        type: 'one_time',
        userId: user.id,
        userEmail: user.email,
      });

      const order = await storage.createCvEnhancementOrder({
        userId,
        cvUploadId,
        planId: enhancementPlan.id,
        stripePaymentIntentId: null,
        status: "pending",
        amountPaid: enhancementPlan.price,
      });

      res.send({ url: session.url, orderId: order.id });
    } catch (error) {
      console.error("CV enhancement checkout error:", error);
      res.status(500).send({ error: "Failed to create checkout session" });
    }
  });

  app.patch("/api/admin/cv-enhancements/:id", requireAdmin, upload.single('enhanced_cv'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const { status, orderNotes } = req.body;

      const order = await storage.getCvEnhancementOrderById(id);
      if (!order) {
        return res.status(404).send({ error: "CV enhancement order not found" });
      }

      const updates: any = {};
      
      if (status) {
        updates.status = status;
      }

      if (orderNotes) {
        updates.orderNotes = orderNotes;
      }

      // TODO: Enhanced CV file upload not yet implemented in database
      // if (file) {
      //   updates.enhancedCvFilename = file.originalname;
      //   updates.enhancedCvFileSize = file.size;
      //   updates.enhancedCvFileData = file.buffer.toString('base64');
      // }

      if (status === 'completed') {
        updates.completedAt = new Date();
      }

      const updatedOrder = await storage.updateCvEnhancementOrder(id, updates);

      if (status === 'completed') {
        try {
          await notificationService.sendCVEnhancementCompletedNotification(order.userId, id);
        } catch (emailError) {
          console.error("Failed to send completion email:", emailError);
        }
      }

      res.send(updatedOrder);
    } catch (error) {
      console.error("Update CV enhancement order error:", error);
      res.status(500).send({ error: "Failed to update CV enhancement order" });
    }
  });

  app.get("/api/user/cv-enhancements/:id/download", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;

      const order = await storage.getCvEnhancementOrderById(id);
      if (!order) {
        return res.status(404).send({ error: "CV enhancement order not found" });
      }

      if (order.userId !== userId) {
        return res.status(403).send({ error: "Unauthorized" });
      }

      // TODO: Enhanced CV file download not yet implemented
      return res.status(501).send({ error: "Enhanced CV download feature not yet implemented in database schema" });
    } catch (error) {
      console.error("Download enhanced CV error:", error);
      res.status(500).send({ error: "Failed to download enhanced CV" });
    }
  });

  // Phase 6: AI Routes
  app.post("/api/ai/cv-optimization", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { currentCV, targetRole, targetIndustry } = req.body;

      if (!currentCV || currentCV.trim().length < 50) {
        return res.status(400).send({ error: "Please provide your CV content (minimum 50 characters)" });
      }

      const { generateCVOptimizationTips } = await import("./services/aiService");
      const tips = await generateCVOptimizationTips({ currentCV, targetRole, targetIndustry });

      const artifact = await storage.createAiArtifact({
        userId,
        artifactType: "cv_optimization",
        content: {
          input: { currentCV: currentCV.substring(0, 500) + "...", targetRole, targetIndustry },
          output: tips,
          metadata: { targetRole, targetIndustry }
        },
      });

      res.status(201).send({ tips, artifactId: artifact.id });
    } catch (error) {
      console.error("CV optimization error:", error);
      res.status(500).send({ error: "Failed to generate CV optimization tips" });
    }
  });

  app.post("/api/ai/cover-letter", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { jobTitle, company, jobDescription, userCV, applicationId } = req.body;

      if (!jobTitle || !company) {
        return res.status(400).send({ error: "Job title and company are required" });
      }

      const { generateCoverLetter } = await import("./services/aiService");
      const coverLetter = await generateCoverLetter({ jobTitle, company, jobDescription, userCV });

      const artifact = await storage.createAiArtifact({
        userId,
        artifactType: "cover_letter",
        content: {
          input: { jobTitle, company },
          output: coverLetter,
          metadata: { jobTitle, company, applicationId }
        },
      });

      res.status(201).send({ coverLetter, artifactId: artifact.id });
    } catch (error) {
      console.error("Cover letter generation error:", error);
      res.status(500).send({ error: "Failed to generate cover letter" });
    }
  });

  app.get("/api/ai/artifacts", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const artifacts = await storage.getUserArtifacts(userId);
      res.send(artifacts);
    } catch (error) {
      console.error("Get AI artifacts error:", error);
      res.status(500).send({ error: "Failed to fetch AI artifacts" });
    }
  });

  app.post("/api/payment/create-checkout-session", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { planId, promoCode } = req.body;

      if (!planId) {
        return res.status(400).send({ error: "Plan ID is required" });
      }

      const plan = await storage.getPlanById(planId);
      if (!plan) {
        return res.status(404).send({ error: "Plan not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      const planPrice = typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price;
      let finalAmount: number = planPrice;
      let appliedPromoCode: any = null;

      if (promoCode) {
        const validation = await storage.validatePromoCode(promoCode);
        if (validation.valid && validation.promoCode) {
          appliedPromoCode = validation.promoCode;
          const discountValue = typeof appliedPromoCode.discountValue === 'string' 
            ? parseFloat(appliedPromoCode.discountValue) 
            : Number(appliedPromoCode.discountValue);
          
          if (appliedPromoCode.discountType === 'percentage') {
            finalAmount = finalAmount * (1 - discountValue / 100);
          } else {
            finalAmount = Math.max(0, finalAmount - discountValue);
          }
        }
      }

      const { createCheckoutSession } = await import("./services/paymentService");
      const session = await createCheckoutSession({
        planId: plan.id.toString(),
        planName: plan.name,
        amount: finalAmount,
        credits: plan.credits,
        description: plan.description,
        userId,
        userEmail: user.email,
        isSubscription: plan.type === 'subscription',
        billingPeriod: (plan.billingPeriod as 'monthly' | 'yearly' | null) || undefined,
        promoCodeId: appliedPromoCode?.id,
      });

      res.send({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Create checkout session error:", error);
      res.status(500).send({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/payment/webhook", async (req: Request, res: Response) => {
    try {
      const { handleStripeWebhook } = await import("./services/paymentService");
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).send({ error: "Missing stripe signature" });
      }

      await handleStripeWebhook(storage, req.body, signature);
      res.send({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send({ error: "Webhook processing failed" });
    }
  });

  // Manual webhook test endpoint - for testing payment completion
  app.post("/api/payment/test-complete-checkout", requireAuth, async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).send({ error: "Session ID is required" });
      }

      console.log(`[TEST] Manual checkout completion for session: ${sessionId}`);

      // Retrieve the checkout session from Stripe
      const { stripe } = await import("./services/paymentService");
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      console.log(`[TEST] Session status: ${session.payment_status}, User: ${session.metadata?.userId}`);

      // Verify the session belongs to the current user
      const userId = req.session.userId!;
      if (session.metadata?.userId !== userId) {
        return res.status(403).send({ error: "Session does not belong to current user" });
      }

      // Manually process the checkout session
      const { handleCheckoutSessionCompleted } = await import('./services/subscriptionService');
      await handleCheckoutSessionCompleted(storage, session);
      
      console.log(`[TEST] Checkout session processed successfully`);

      // Fetch the created user plan
      const userPlans = await storage.getUserPlans(userId);
      const latestPlan = userPlans.sort((a: any, b: any) => 
        new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      )[0];

      res.send({ 
        success: true, 
        message: "Payment processed manually",
        sessionId: session.id,
        paymentStatus: "paid", // Successfully processed, so it's paid
        userPlan: latestPlan,
      });
    } catch (error) {
      console.error("Manual checkout completion error:", error);
      res.status(500).send({ error: "Failed to complete checkout manually" });
    }
  });

  app.get("/api/subscription/details", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const subscriptions = await storage.getUserSubscriptions(userId);
      
      const subscriptionDetails = await Promise.all(
        subscriptions.map(async (sub) => {
          const plan = await storage.getPlanById(sub.planId);
          const userPlansForSub = await storage.getUserPlansBySubscriptionId(sub.id);
          return {
            ...sub,
            plan,
            userPlan: userPlansForSub[0],
          };
        })
      );
      
      res.send(subscriptionDetails);
    } catch (error) {
      console.error("Get subscription details error:", error);
      res.status(500).send({ error: "Failed to fetch subscription details" });
    }
  });

  app.post("/api/subscription/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { userPlanId } = req.body;

      if (!userPlanId) {
        return res.status(400).send({ error: "User plan ID is required" });
      }

      const userPlan = await storage.getUserPlanById(userPlanId);
      if (!userPlan || userPlan.userId !== userId) {
        return res.status(404).send({ error: "User plan not found" });
      }

      if (!userPlan.subscriptionId) {
        return res.status(400).send({ error: "Not a subscription" });
      }

      const { cancelSubscription } = await import("./services/paymentService");
      const result = await cancelSubscription(userPlan.subscriptionId, false);

      res.send(result);
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).send({ error: "Failed to cancel subscription" });
    }
  });

  app.post("/api/subscription/reactivate", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { userPlanId } = req.body;

      if (!userPlanId) {
        return res.status(400).send({ error: "User plan ID is required" });
      }

      const userPlan = await storage.getUserPlanById(userPlanId);
      if (!userPlan || userPlan.userId !== userId) {
        return res.status(404).send({ error: "User plan not found" });
      }

      if (!userPlan.subscriptionId) {
        return res.status(400).send({ error: "Not a subscription" });
      }

      const { reactivateSubscription } = await import("./services/paymentService");
      const result = await reactivateSubscription(userPlan.subscriptionId);

      res.send(result);
    } catch (error) {
      console.error("Reactivate subscription error:", error);
      res.status(500).send({ error: "Failed to reactivate subscription" });
    }
  });

  app.get("/api/transactions", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const transactions = await storage.getUserTransactions(userId);
      res.send(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).send({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/promo-code/validate", requireAuth, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).send({ error: "Promo code is required" });
      }

      const validation = await storage.validatePromoCode(code);
      res.send(validation);
    } catch (error) {
      console.error("Validate promo code error:", error);
      res.status(500).send({ error: "Failed to validate promo code" });
    }
  });

  app.get("/api/admin/promo-codes", requireAdmin, async (req: Request, res: Response) => {
    try {
      const promoCodes = await storage.getAllPromoCodes();
      res.send(promoCodes);
    } catch (error) {
      console.error("Get promo codes error:", error);
      res.status(500).send({ error: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/admin/promo-codes", requireAdmin, async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const userId = req.session.userId!;
      
      const promoCodeData = {
        ...data,
        createdBy: userId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
      
      const promoCode = await storage.createPromoCode(promoCodeData);
      res.status(201).send(promoCode);
    } catch (error) {
      console.error("Create promo code error:", error);
      res.status(500).send({ error: "Failed to create promo code" });
    }
  });

  app.patch("/api/admin/promo-codes/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateData = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      };

      const promoCode = await storage.updatePromoCode(id, updateData);
      res.send(promoCode);
    } catch (error) {
      console.error("Update promo code error:", error);
      res.status(500).send({ error: "Failed to update promo code" });
    }
  });

  app.delete("/api/admin/promo-codes/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deletePromoCode(id);
      res.send({ success: true });
    } catch (error) {
      console.error("Delete promo code error:", error);
      res.status(500).send({ error: "Failed to delete promo code" });
    }
  });

  app.get("/api/admin/financial-metrics", requireAdmin, async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getAllTransactions();
      const subscriptions = await storage.getAllSubscriptions();
      
      const parseAmount = (amount: string | number): number => {
        return typeof amount === 'string' ? parseFloat(amount) : amount;
      };
      
      const totalRevenue = transactions.reduce((sum: number, t) => sum + parseAmount(t.amount), 0);
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      
      const thisMonthRevenue = transactions
        .filter(t => t.createdAt >= thisMonthStart)
        .reduce((sum: number, t) => sum + parseAmount(t.amount), 0);
      
      const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active').length;
      const mrr = subscriptions
        .filter((s: any) => s.status === 'active')
        .reduce((sum: number, s: any) => sum + parseAmount(s.amount), 0);
      
      const revenueTimeline = transactions.reduce((acc, t) => {
        const date = t.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += parseAmount(t.amount);
        return acc;
      }, {} as Record<string, number>);
      
      const revenueData = Object.entries(revenueTimeline)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      res.send({
        totalRevenue,
        thisMonthRevenue,
        activeSubscriptions,
        mrr,
        revenueData,
      });
    } catch (error) {
      console.error("Get financial metrics error:", error);
      res.status(500).send({ error: "Failed to fetch financial metrics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
