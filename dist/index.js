var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/services/emailService.ts
var emailService_exports = {};
__export(emailService_exports, {
  getAdminBulkMessageEmail: () => getAdminBulkMessageEmail,
  getBatchCompletionEmail: () => getBatchCompletionEmail,
  getNewUserWelcomeEmail: () => getNewUserWelcomeEmail,
  getPasswordResetEmail: () => getPasswordResetEmail,
  getStatusUpdateEmail: () => getStatusUpdateEmail,
  sendEmail: () => sendEmail
});
import { Resend } from "resend";
async function sendEmail(options) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    if (error) {
      console.error("Failed to send email:", error);
      return false;
    }
    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Email service error:", error);
    return false;
  }
}
function getBatchCompletionEmail(batchNumber, totalApplications) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0077FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .stats { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Batch Completed!</h1>
          </div>
          <div class="content">
            <p>Great news! Your application batch has been successfully processed.</p>
            
            <div class="stats">
              <p style="margin: 0;"><strong>Batch Number:</strong> #${batchNumber}</p>
              <p style="margin: 10px 0 0 0;"><strong>Total Applications:</strong> ${totalApplications}</p>
            </div>
            
            <p>All applications in this batch have been submitted and are now being tracked. You can view their status and progress in your dashboard.</p>
            
            <center>
              <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/dashboard" class="button">View Applications</a>
            </center>
            
            <p>We'll notify you when there are updates to your application statuses.</p>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
function getStatusUpdateEmail(jobTitle, company, oldStatus, newStatus) {
  const statusColors = {
    applied: "#3b82f6",
    in_review: "#eab308",
    interviewing: "#a855f7",
    rejected: "#ef4444",
    offer: "#22c55e"
  };
  const formatStatus = (status) => status.replace("_", " ").toUpperCase();
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .job-info { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .status-change { display: flex; align-items: center; justify-content: center; gap: 20px; margin: 30px 0; }
          .status { padding: 12px 20px; border-radius: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .button { display: inline-block; background: #0077FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <p>There's been an update to one of your job applications!</p>
            
            <div class="job-info">
              <p style="margin: 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 10px 0 0 0;"><strong>Company:</strong> ${company}</p>
            </div>
            
            <div class="status-change">
              <span class="status" style="background: ${statusColors[oldStatus] || "#6b7280"}20; color: ${statusColors[oldStatus] || "#6b7280"};">
                ${formatStatus(oldStatus)}
              </span>
              <span style="font-size: 24px;">\u2192</span>
              <span class="status" style="background: ${statusColors[newStatus] || "#6b7280"}20; color: ${statusColors[newStatus] || "#6b7280"};">
                ${formatStatus(newStatus)}
              </span>
            </div>
            
            <p>Keep track of all your applications and their progress in your dashboard.</p>
            
            <center>
              <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/dashboard" class="button">View Dashboard</a>
            </center>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
function getNewUserWelcomeEmail(email, tempPassword) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .credentials { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0077FF; }
          .button { display: inline-block; background: #0077FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to JobApply.pro!</h1>
          </div>
          <div class="content">
            <p>Your account has been created by an administrator. You can now access JobApply.pro to streamline your job application process.</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0;">Your Login Credentials</h3>
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            </div>
            
            <div class="warning">
              <p style="margin: 0;"><strong>\u26A0\uFE0F Important:</strong> This is a temporary password. Please change it immediately after logging in for security purposes.</p>
            </div>
            
            <center>
              <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/login" class="button">Login Now</a>
            </center>
            
            <p>Once you log in, you'll be able to:</p>
            <ul>
              <li>Track your job applications</li>
              <li>Manage your application credits</li>
              <li>Access AI-powered CV optimization and cover letter generation</li>
              <li>View analytics and insights about your job search</li>
            </ul>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
function getPasswordResetEmail(email, tempPassword) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .credentials { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0077FF; }
          .button { display: inline-block; background: #0077FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Your password has been reset by an administrator. You can now log in using your new temporary password.</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0;">Your New Login Credentials</h3>
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            </div>
            
            <div class="warning">
              <p style="margin: 0;"><strong>\u26A0\uFE0F Important:</strong> This is a temporary password. Please change it immediately after logging in for security purposes.</p>
            </div>
            
            <center>
              <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/login" class="button">Login Now</a>
            </center>
            
            <p>If you did not request this password reset, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
function getAdminBulkMessageEmail(subject, body) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .message-body { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subject}</h1>
          </div>
          <div class="content">
            <div class="message-body">
              ${body}
            </div>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
var resend, FROM_EMAIL;
var init_emailService = __esm({
  "server/services/emailService.ts"() {
    "use strict";
    resend = new Resend(process.env.RESEND_API_KEY);
    FROM_EMAIL = "JobApply.pro <noreply@jobapply.pro>";
  }
});

// server/services/aiService.ts
var aiService_exports = {};
__export(aiService_exports, {
  generateCVOptimizationTips: () => generateCVOptimizationTips,
  generateCoverLetter: () => generateCoverLetter
});
import OpenAI from "openai";
async function generateCVOptimizationTips(input) {
  const { currentCV, targetRole, targetIndustry } = input;
  const prompt = `You are an expert career coach and CV consultant. Analyze the following CV and provide specific, actionable optimization tips to make it more effective.

${targetRole ? `Target Role: ${targetRole}` : ""}
${targetIndustry ? `Target Industry: ${targetIndustry}` : ""}

CV Content:
${currentCV}

Provide 5-8 specific, actionable tips to improve this CV. Focus on:
1. Content optimization (achievements, quantifiable results, impact)
2. Structure and formatting recommendations
3. Keywords and industry-specific terminology
4. Skills highlighting
5. Experience presentation

Format your response as a clear, organized list of tips with explanations.`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach specializing in CV optimization and job application strategies. Provide practical, actionable advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    return response.choices[0]?.message?.content || "Unable to generate tips at this time.";
  } catch (error) {
    console.error("Error generating CV optimization tips:", error);
    throw new Error("Failed to generate CV optimization tips");
  }
}
async function generateCoverLetter(input) {
  const { jobTitle, company, jobDescription, userCV } = input;
  const prompt = `You are an expert career coach writing a professional cover letter. Create a compelling, personalized cover letter for the following job application.

Job Title: ${jobTitle}
Company: ${company}
${jobDescription ? `
Job Description:
${jobDescription}` : ""}
${userCV ? `

Applicant's Background (from CV):
${userCV}` : ""}

Write a professional cover letter that:
1. Opens with a strong, engaging introduction
2. Highlights relevant experience and skills matching the role
3. Shows genuine interest in the company and position
4. Demonstrates value the candidate can bring
5. Closes with a clear call to action

The tone should be professional yet personable. Keep it concise (around 250-350 words). Do not include placeholders like [Your Name] or [Date] - write the letter content only.`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach specializing in writing compelling cover letters that get interviews. Write professional, engaging content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1e3
    });
    return response.choices[0]?.message?.content || "Unable to generate cover letter at this time.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter");
  }
}
var openai;
var init_aiService = __esm({
  "server/services/aiService.ts"() {
    "use strict";
    openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
    });
  }
});

// server/services/subscriptionService.ts
var subscriptionService_exports = {};
__export(subscriptionService_exports, {
  checkExpiredSubscriptions: () => checkExpiredSubscriptions,
  handlePaymentFailed: () => handlePaymentFailed,
  handlePaymentSucceeded: () => handlePaymentSucceeded,
  handleSubscriptionCancelled: () => handleSubscriptionCancelled,
  handleSubscriptionCreated: () => handleSubscriptionCreated,
  handleSubscriptionRenewal: () => handleSubscriptionRenewal,
  handleSubscriptionUpdated: () => handleSubscriptionUpdated
});
async function handleSubscriptionCreated(storage2, stripeSubscriptionId, stripeCustomerId, userId, planId, currentPeriodStart, currentPeriodEnd) {
  const plan = await storage2.getPlanById(planId);
  if (!plan) {
    throw new Error("Plan not found");
  }
  const subscription = {
    userId,
    planId,
    stripeSubscriptionId,
    stripeCustomerId,
    status: "active",
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: false,
    amount: plan.price.toString()
  };
  const createdSubscription = await storage2.createSubscription(subscription);
  const userPlan = {
    userId,
    planId,
    subscriptionId: createdSubscription.id,
    creditsRemaining: plan.credits,
    status: "active",
    autoRenew: true,
    expiresAt: currentPeriodEnd
  };
  await storage2.createUserPlan(userPlan);
}
async function handleSubscriptionUpdated(storage2, stripeSubscriptionId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd) {
  const subscription = await storage2.getSubscriptionByStripeId(stripeSubscriptionId);
  if (!subscription) {
    console.error("Subscription not found:", stripeSubscriptionId);
    return;
  }
  await storage2.updateSubscription(subscription.id, {
    status: mapStripeStatus(status),
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd
  });
  const userPlans2 = await storage2.getUserPlansBySubscriptionId(subscription.id);
  for (const userPlan of userPlans2) {
    const mappedStatus = mapStripeStatusToUserPlan(status, cancelAtPeriodEnd);
    await storage2.updateUserPlan(userPlan.id, {
      status: mappedStatus,
      expiresAt: currentPeriodEnd,
      autoRenew: !cancelAtPeriodEnd
    });
  }
}
async function handleSubscriptionCancelled(storage2, stripeSubscriptionId, canceledAt) {
  const subscription = await storage2.getSubscriptionByStripeId(stripeSubscriptionId);
  if (!subscription) {
    console.error("Subscription not found:", stripeSubscriptionId);
    return;
  }
  await storage2.updateSubscription(subscription.id, {
    status: "canceled",
    canceledAt
  });
  const userPlans2 = await storage2.getUserPlansBySubscriptionId(subscription.id);
  for (const userPlan of userPlans2) {
    await storage2.updateUserPlan(userPlan.id, {
      status: "cancelled",
      autoRenew: false
    });
  }
}
async function handleSubscriptionRenewal(storage2, stripeSubscriptionId) {
  try {
    const subscription = await storage2.getSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
      return {
        success: false,
        subscriptionId: stripeSubscriptionId,
        error: "Subscription not found"
      };
    }
    const plan = await storage2.getPlanById(subscription.planId);
    if (!plan) {
      return {
        success: false,
        subscriptionId: stripeSubscriptionId,
        error: "Plan not found"
      };
    }
    const userPlans2 = await storage2.getUserPlansBySubscriptionId(subscription.id);
    for (const userPlan of userPlans2) {
      await storage2.updateUserPlanCredits(userPlan.id, plan.credits);
    }
    const stripeSubscription = await getSubscription(stripeSubscriptionId);
    await storage2.updateSubscription(subscription.id, {
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1e3),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1e3),
      status: "active"
    });
    return {
      success: true,
      subscriptionId: stripeSubscriptionId
    };
  } catch (error) {
    console.error("Subscription renewal error:", error);
    return {
      success: false,
      subscriptionId: stripeSubscriptionId,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function checkExpiredSubscriptions(storage2) {
  const now = /* @__PURE__ */ new Date();
  const gracePeriodEnd = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1e3);
  const expiredUserPlans = await storage2.getExpiredUserPlans(gracePeriodEnd);
  for (const userPlan of expiredUserPlans) {
    if (userPlan.status === "active") {
      await storage2.updateUserPlan(userPlan.id, {
        status: "expired",
        autoRenew: false
      });
      if (userPlan.subscriptionId) {
        await storage2.updateSubscription(userPlan.subscriptionId, {
          status: "canceled"
        });
      }
    }
  }
}
function mapStripeStatus(stripeStatus) {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "active";
  }
}
function mapStripeStatusToUserPlan(stripeStatus, cancelAtPeriodEnd) {
  if (cancelAtPeriodEnd) {
    return "active";
  }
  switch (stripeStatus) {
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "active";
    case "canceled":
    case "cancelled":
    case "incomplete":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "active";
  }
}
async function handlePaymentSucceeded(storage2, userId, planId, subscriptionId, stripePaymentIntentId, amount, promoCodeId, discountAmount) {
  const transaction = {
    userId,
    planId: planId || void 0,
    subscriptionId: subscriptionId || void 0,
    stripePaymentIntentId,
    type: subscriptionId ? "subscription" : "purchase",
    status: "completed",
    amount: (amount / 100).toString(),
    currency: "usd",
    description: subscriptionId ? "Subscription payment" : "Plan purchase",
    promoCodeId: promoCodeId || void 0,
    discountAmount: discountAmount ? (discountAmount / 100).toString() : void 0
  };
  await storage2.createTransaction(transaction);
}
async function handlePaymentFailed(storage2, userId, planId, subscriptionId, stripePaymentIntentId, amount) {
  const transaction = {
    userId,
    planId: planId || void 0,
    subscriptionId: subscriptionId || void 0,
    stripePaymentIntentId,
    type: subscriptionId ? "renewal" : "purchase",
    status: "failed",
    amount: (amount / 100).toString(),
    currency: "usd",
    description: "Payment failed"
  };
  await storage2.createTransaction(transaction);
  if (subscriptionId) {
    const subscription = await storage2.getSubscriptionById(subscriptionId);
    if (subscription) {
      await storage2.updateSubscription(subscription.id, {
        status: "past_due"
      });
      const userPlans2 = await storage2.getUserPlansBySubscriptionId(subscription.id);
      for (const userPlan of userPlans2) {
        await storage2.updateUserPlan(userPlan.id, {
          status: "active"
        });
      }
    }
  }
}
var GRACE_PERIOD_DAYS;
var init_subscriptionService = __esm({
  "server/services/subscriptionService.ts"() {
    "use strict";
    init_paymentService();
    GRACE_PERIOD_DAYS = 3;
  }
});

// server/services/paymentService.ts
var paymentService_exports = {};
__export(paymentService_exports, {
  cancelSubscription: () => cancelSubscription,
  constructWebhookEvent: () => constructWebhookEvent,
  createCheckoutSession: () => createCheckoutSession,
  createOrGetCustomer: () => createOrGetCustomer,
  createPaymentIntent: () => createPaymentIntent,
  getSubscription: () => getSubscription,
  handleStripeWebhook: () => handleStripeWebhook,
  reactivateSubscription: () => reactivateSubscription,
  retrieveCheckoutSession: () => retrieveCheckoutSession,
  stripe: () => stripe
});
import Stripe from "stripe";
async function createOrGetCustomer(params) {
  const existingCustomers = await stripe.customers.list({
    email: params.email,
    limit: 1
  });
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone
  });
}
async function createCheckoutSession(params) {
  const customer = await createOrGetCustomer({
    email: params.userEmail
  });
  const isSubscription = params.isSubscription ?? params.type === "subscription";
  const baseUrl = process.env.REPLIT_DEPLOYMENT === "production" ? "https://jobapply.pro" : "http://localhost:5000";
  const sessionParams = {
    customer: customer.id,
    mode: isSubscription ? "subscription" : "payment",
    success_url: params.successUrl || `${baseUrl}/dashboard/billing?success=true`,
    cancel_url: params.cancelUrl || `${baseUrl}/pricing`,
    metadata: {
      userId: params.userId,
      planId: params.planId,
      promoCodeId: params.promoCodeId || ""
    }
  };
  if (isSubscription) {
    sessionParams.line_items = [{
      price_data: {
        currency: "usd",
        product_data: {
          name: params.planName
        },
        recurring: {
          interval: params.billingPeriod === "yearly" ? "year" : "month"
        },
        unit_amount: Math.round(params.amount * 100)
      },
      quantity: 1
    }];
    sessionParams.subscription_data = {
      metadata: {
        userId: params.userId,
        planId: params.planId
      }
    };
  } else {
    sessionParams.line_items = [{
      price_data: {
        currency: "usd",
        product_data: {
          name: params.planName
        },
        unit_amount: Math.round(params.amount * 100)
      },
      quantity: 1
    }];
  }
  if (params.promoCode) {
    const promoCodes2 = await stripe.promotionCodes.list({
      code: params.promoCode,
      active: true,
      limit: 1
    });
    if (promoCodes2.data.length > 0) {
      sessionParams.discounts = [{
        promotion_code: promoCodes2.data[0].id
      }];
    }
  }
  return await stripe.checkout.sessions.create(sessionParams);
}
async function createPaymentIntent(amount, customerId) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    customer: customerId
  });
}
async function retrieveCheckoutSession(sessionId) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "subscription"]
  });
}
async function cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}
async function reactivateSubscription(subscriptionId) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  });
}
async function getSubscription(subscriptionId) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}
async function constructWebhookEvent(payload, signature, secret) {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
async function handleStripeWebhook(storage2, payload, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not configured. Webhook validation skipped.");
  }
  let event;
  try {
    if (webhookSecret) {
      event = constructWebhookEvent(payload, signature, webhookSecret);
    } else {
      event = JSON.parse(payload.toString());
    }
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
  const {
    handleCheckoutSessionCompleted,
    handleSubscriptionUpdated: handleSubscriptionUpdated2,
    handleSubscriptionCancelled: handleSubscriptionCancelled2,
    handlePaymentSucceeded: handlePaymentSucceeded2
  } = await Promise.resolve().then(() => (init_subscriptionService(), subscriptionService_exports));
  switch (event.type) {
    case "checkout.session.completed": {
      const session2 = event.data.object;
      await handleCheckoutSessionCompleted(storage2, session2);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      await handleSubscriptionUpdated2(storage2, subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await handleSubscriptionCancelled2(storage2, subscription.id);
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
        const userId = invoice.subscription_details?.metadata?.userId;
        if (userId) {
          await handlePaymentSucceeded2(
            storage2,
            userId,
            invoice.subscription,
            invoice.amount_paid / 100,
            invoice.id
          );
        }
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.error("Payment failed for invoice:", invoice.id);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
var stripe;
var init_paymentService = __esm({
  "server/services/paymentService.ts"() {
    "use strict";
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover"
    });
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import multer from "multer";
import crypto from "crypto";

// server/storage.ts
import { eq, and, desc, sql as sql2 } from "drizzle-orm";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminMessages: () => adminMessages,
  aiArtifacts: () => aiArtifacts,
  applicationBatches: () => applicationBatches,
  applications: () => applications,
  auditLogs: () => auditLogs,
  automationJobs: () => automationJobs,
  blogPosts: () => blogPosts,
  insertAdminMessageSchema: () => insertAdminMessageSchema,
  insertAiArtifactSchema: () => insertAiArtifactSchema,
  insertApplicationBatchSchema: () => insertApplicationBatchSchema,
  insertApplicationSchema: () => insertApplicationSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertAutomationJobSchema: () => insertAutomationJobSchema,
  insertBlogPostSchema: () => insertBlogPostSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPageContentSchema: () => insertPageContentSchema,
  insertPaymentMethodSchema: () => insertPaymentMethodSchema,
  insertPlanSchema: () => insertPlanSchema,
  insertPromoCodeSchema: () => insertPromoCodeSchema,
  insertResourceSchema: () => insertResourceSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUploadedImageSchema: () => insertUploadedImageSchema,
  insertUserNotificationPreferencesSchema: () => insertUserNotificationPreferencesSchema,
  insertUserPlanSchema: () => insertUserPlanSchema,
  insertUserResourceSchema: () => insertUserResourceSchema,
  insertUserSchema: () => insertUserSchema,
  notifications: () => notifications,
  pageContent: () => pageContent,
  paymentMethods: () => paymentMethods,
  plans: () => plans,
  promoCodes: () => promoCodes,
  resources: () => resources,
  subscriptions: () => subscriptions,
  transactions: () => transactions,
  uploadedImages: () => uploadedImages,
  userNotificationPreferences: () => userNotificationPreferences,
  userPlans: () => userPlans,
  userResources: () => userResources,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("user"),
  deactivated: boolean("deactivated").notNull().default(false),
  deactivatedAt: timestamp("deactivated_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z.literal("")),
  role: z.enum(["user", "admin"]).optional()
});
var plans = pgTable("plans", {
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
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true
}).extend({
  type: z.enum(["one_time", "subscription"]).optional(),
  billingPeriod: z.enum(["monthly", "yearly"]).optional()
});
var subscriptions = pgTable("subscriptions", {
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
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  status: z.enum(["active", "past_due", "canceled", "unpaid", "incomplete"])
});
var userPlans = pgTable("user_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  creditsRemaining: integer("credits_remaining").notNull(),
  status: text("status").notNull().default("active"),
  autoRenew: boolean("auto_renew").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  purchasedAt: timestamp("purchased_at").notNull().default(sql`now()`)
});
var insertUserPlanSchema = createInsertSchema(userPlans).omit({
  id: true,
  purchasedAt: true
}).extend({
  status: z.enum(["active", "expired", "cancelled"]).optional()
});
var applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userPlanId: varchar("user_plan_id").notNull().references(() => userPlans.id),
  jobId: text("job_id"),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull().default("applied"),
  batchNumber: integer("batch_number").notNull(),
  appliedDate: timestamp("applied_date").notNull(),
  submissionMode: text("submission_mode").notNull().default("manual"),
  automationJobId: varchar("automation_job_id"),
  source: text("source").notNull().default("csv_upload"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  status: z.enum(["applied", "in_review", "interviewing", "rejected", "offer"]),
  submissionMode: z.enum(["manual", "automated"]).optional(),
  source: z.enum(["csv_upload", "automated", "manual_entry"]).optional()
});
var applicationBatches = pgTable("application_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  batchNumber: integer("batch_number").notNull(),
  status: text("status").notNull().default("pending"),
  submissionMode: text("submission_mode").notNull().default("manual"),
  automationJobId: varchar("automation_job_id"),
  totalApplications: integer("total_applications").notNull().default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertApplicationBatchSchema = createInsertSchema(applicationBatches).omit({
  id: true,
  createdAt: true
}).extend({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  submissionMode: z.enum(["manual", "automated"]).optional()
});
var automationJobs = pgTable("automation_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  batchId: varchar("batch_id").references(() => applicationBatches.id),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("queued"),
  payload: jsonb("payload"),
  errorLog: text("error_log"),
  scheduledAt: timestamp("scheduled_at").notNull().default(sql`now()`),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertAutomationJobSchema = createInsertSchema(automationJobs).omit({
  id: true,
  createdAt: true
}).extend({
  provider: z.enum(["linkedin", "indeed", "other"]),
  status: z.enum(["queued", "processing", "completed", "failed"]).optional()
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  channel: text("channel").notNull().default("in_app"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
}).extend({
  channel: z.enum(["email", "sms", "in_app"]).optional()
});
var userNotificationPreferences = pgTable("user_notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  smsEnabled: boolean("sms_enabled").notNull().default(false),
  batchCompletionAlerts: boolean("batch_completion_alerts").notNull().default(true),
  statusUpdateAlerts: boolean("status_update_alerts").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var insertUserNotificationPreferencesSchema = createInsertSchema(userNotificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var aiArtifacts = pgTable("ai_artifacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").references(() => applications.id),
  artifactType: text("artifact_type").notNull(),
  content: jsonb("content").notNull(),
  generatedAt: timestamp("generated_at").notNull().default(sql`now()`)
});
var insertAiArtifactSchema = createInsertSchema(aiArtifacts).omit({
  id: true,
  generatedAt: true
}).extend({
  artifactType: z.enum(["cover_letter", "cv_optimization", "custom_answer", "job_match_analysis"])
});
var resources = pgTable("resources", {
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
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  category: z.enum(["interview_tips", "cv_guides", "job_search", "career_advice", "templates", "courses"])
});
var blogPosts = pgTable("blog_posts", {
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
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  category: z.enum(["success_stories", "industry_insights", "job_market", "career_tips", "platform_updates"])
});
var userResources = pgTable("user_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  resourceId: varchar("resource_id").notNull().references(() => resources.id),
  purchaseMethod: text("purchase_method").notNull(),
  creditsSpent: integer("credits_spent"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
  purchasedAt: timestamp("purchased_at").notNull().default(sql`now()`)
});
var insertUserResourceSchema = createInsertSchema(userResources).omit({
  id: true,
  purchasedAt: true
}).extend({
  purchaseMethod: z.enum(["credits", "payment", "free"])
});
var transactions = pgTable("transactions", {
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
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
}).extend({
  type: z.enum(["purchase", "subscription", "renewal", "refund"]),
  status: z.enum(["pending", "completed", "failed", "refunded"])
});
var promoCodes = pgTable("promo_codes", {
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
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  currentUses: true,
  createdAt: true
}).extend({
  discountType: z.enum(["percentage", "fixed"]),
  code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores")
});
var paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull().unique(),
  type: text("type").notNull(),
  last4: text("last4"),
  brand: text("brand"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true
});
var auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  changes: jsonb("changes"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});
var adminMessages = pgTable("admin_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientType: text("recipient_type").notNull(),
  recipientIds: text("recipient_ids").array(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  channel: text("channel").notNull().default("email"),
  status: text("status").notNull().default("sent"),
  sentAt: timestamp("sent_at").notNull().default(sql`now()`)
});
var insertAdminMessageSchema = createInsertSchema(adminMessages).omit({
  id: true,
  sentAt: true
}).extend({
  recipientType: z.enum(["all_users", "specific_users", "plan_users"]),
  channel: z.enum(["email", "in_app"]),
  status: z.enum(["sent", "failed"]).optional()
});
var pageContent = pgTable("page_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: text("page_name").notNull().unique(),
  sections: jsonb("sections").notNull(),
  updatedBy: varchar("updated_by").notNull().references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var insertPageContentSchema = createInsertSchema(pageContent).omit({
  id: true,
  updatedAt: true
});
var uploadedImages = pgTable("uploaded_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertUploadedImageSchema = createInsertSchema(uploadedImages).omit({
  id: true,
  createdAt: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
var DbStorage = class {
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async getAllPlans() {
    return db.select().from(plans);
  }
  async getActivePlans() {
    return db.select().from(plans).where(eq(plans.active, true));
  }
  async getPlanById(id) {
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0];
  }
  async createPlan(insertPlan) {
    const result = await db.insert(plans).values(insertPlan).returning();
    return result[0];
  }
  async updatePlan(id, planUpdate) {
    const result = await db.update(plans).set(planUpdate).where(eq(plans.id, id)).returning();
    return result[0];
  }
  async getUserPlans(userId) {
    const result = await db.select().from(userPlans).leftJoin(plans, eq(userPlans.planId, plans.id)).where(eq(userPlans.userId, userId));
    return result.map((row) => ({
      ...row.user_plans,
      plan: row.plans
    }));
  }
  async getAllUserPlans() {
    return db.select().from(userPlans);
  }
  async createUserPlan(insertUserPlan) {
    const result = await db.insert(userPlans).values(insertUserPlan).returning();
    return result[0];
  }
  async getAllUsers() {
    return db.select().from(users);
  }
  async getUserPlanById(id) {
    const result = await db.select().from(userPlans).where(eq(userPlans.id, id)).limit(1);
    return result[0];
  }
  async updateUserPlanCredits(id, creditsRemaining) {
    const result = await db.update(userPlans).set({ creditsRemaining }).where(eq(userPlans.id, id)).returning();
    return result[0];
  }
  async getApplications(userId, filters) {
    const conditions = [eq(applications.userId, userId)];
    if (filters?.status) {
      conditions.push(eq(applications.status, filters.status));
    }
    if (filters?.batchNumber !== void 0) {
      conditions.push(eq(applications.batchNumber, filters.batchNumber));
    }
    if (filters?.submissionMode) {
      conditions.push(eq(applications.submissionMode, filters.submissionMode));
    }
    return db.select().from(applications).where(and(...conditions)).orderBy(desc(applications.appliedDate));
  }
  async createApplications(apps) {
    if (apps.length === 0) return [];
    const result = await db.insert(applications).values(apps).returning();
    return result;
  }
  async getNextBatchNumber(userId) {
    const result = await db.select({ maxBatch: sql2`COALESCE(MAX(${applications.batchNumber}), 0)` }).from(applications).where(eq(applications.userId, userId));
    return (result[0]?.maxBatch || 0) + 1;
  }
  async getUserApplicationStats(userId) {
    const apps = await db.select().from(applications).where(eq(applications.userId, userId));
    const uniqueBatches = new Set(apps.map((app2) => app2.batchNumber));
    const batches = Array.from(uniqueBatches).sort((a, b) => a - b);
    const automatedCount = apps.filter((app2) => app2.submissionMode === "automated").length;
    const manualCount = apps.filter((app2) => app2.submissionMode === "manual").length;
    return {
      totalApplications: apps.length,
      batches,
      automatedCount,
      manualCount
    };
  }
  // Batch methods (Phase 3)
  async createBatch(insertBatch) {
    const result = await db.insert(applicationBatches).values(insertBatch).returning();
    return result[0];
  }
  async getBatch(id) {
    const result = await db.select().from(applicationBatches).where(eq(applicationBatches.id, id)).limit(1);
    return result[0];
  }
  async getBatchByUserAndNumber(userId, batchNumber) {
    const result = await db.select().from(applicationBatches).where(and(eq(applicationBatches.userId, userId), eq(applicationBatches.batchNumber, batchNumber))).limit(1);
    return result[0];
  }
  async getUserBatches(userId) {
    return db.select().from(applicationBatches).where(eq(applicationBatches.userId, userId)).orderBy(desc(applicationBatches.batchNumber));
  }
  async getAllBatches() {
    const result = await db.select().from(applicationBatches).leftJoin(users, eq(applicationBatches.userId, users.id)).orderBy(desc(applicationBatches.createdAt));
    return result.map((row) => ({
      ...row.application_batches,
      user: row.users
    }));
  }
  async updateBatchStatus(id, status, additionalFields) {
    const updateData = { status };
    if (additionalFields?.startedAt) {
      updateData.startedAt = additionalFields.startedAt;
    }
    if (additionalFields?.completedAt) {
      updateData.completedAt = additionalFields.completedAt;
    }
    const result = await db.update(applicationBatches).set(updateData).where(eq(applicationBatches.id, id)).returning();
    return result[0];
  }
  // Automation Job methods (Phase 3)
  async createAutomationJob(insertJob) {
    const result = await db.insert(automationJobs).values(insertJob).returning();
    return result[0];
  }
  async getAutomationJob(id) {
    const result = await db.select().from(automationJobs).where(eq(automationJobs.id, id)).limit(1);
    return result[0];
  }
  async getUserAutomationJobs(userId) {
    return db.select().from(automationJobs).where(eq(automationJobs.userId, userId)).orderBy(desc(automationJobs.createdAt));
  }
  async getAllAutomationJobs() {
    return db.select().from(automationJobs).orderBy(desc(automationJobs.createdAt));
  }
  async updateAutomationJobStatus(id, status, errorLog, executedAt) {
    const updateData = { status };
    if (errorLog) {
      updateData.errorLog = errorLog;
    }
    if (executedAt) {
      updateData.executedAt = executedAt;
    }
    const result = await db.update(automationJobs).set(updateData).where(eq(automationJobs.id, id)).returning();
    return result[0];
  }
  // Notification Preferences methods (Phase 3)
  async getUserNotificationPreferences(userId) {
    const result = await db.select().from(userNotificationPreferences).where(eq(userNotificationPreferences.userId, userId)).limit(1);
    return result[0];
  }
  async createUserNotificationPreferences(insertPrefs) {
    const result = await db.insert(userNotificationPreferences).values(insertPrefs).returning();
    return result[0];
  }
  async updateUserNotificationPreferences(userId, prefsUpdate) {
    const result = await db.update(userNotificationPreferences).set({ ...prefsUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userNotificationPreferences.userId, userId)).returning();
    return result[0];
  }
  // Notification methods (Phase 3)
  async createNotification(insertNotification) {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }
  async getUserNotifications(userId, unreadOnly = false, limit = 50, offset = 0) {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }
    return db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
  }
  async markNotificationAsRead(id, userId) {
    const result = await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    return result[0];
  }
  async markAllNotificationsAsRead(userId) {
    const result = await db.update(notifications).set({ read: true }).where(and(eq(notifications.userId, userId), eq(notifications.read, false))).returning();
    return result.length;
  }
  async getUnreadNotificationCount(userId) {
    const result = await db.select({ count: sql2`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return Number(result[0]?.count || 0);
  }
  async updateUserPhone(userId, phone) {
    const result = await db.update(users).set({ phone }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  // AI Artifact methods (Phase 3)
  async createAiArtifact(insertArtifact) {
    const result = await db.insert(aiArtifacts).values(insertArtifact).returning();
    return result[0];
  }
  async getApplicationArtifacts(applicationId) {
    return db.select().from(aiArtifacts).where(eq(aiArtifacts.applicationId, applicationId)).orderBy(desc(aiArtifacts.generatedAt));
  }
  async getUserArtifacts(userId) {
    return db.select().from(aiArtifacts).where(eq(aiArtifacts.userId, userId)).orderBy(desc(aiArtifacts.generatedAt));
  }
  // Resource methods (Phase 4)
  async getAllResources(filters) {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.isPaid !== void 0) {
      conditions.push(eq(resources.isPaid, filters.isPaid));
    }
    if (filters?.featured !== void 0) {
      conditions.push(eq(resources.featured, filters.featured));
    }
    return db.select().from(resources).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(resources.createdAt));
  }
  async getActiveResources(filters) {
    const conditions = [eq(resources.active, true)];
    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.isPaid !== void 0) {
      conditions.push(eq(resources.isPaid, filters.isPaid));
    }
    if (filters?.featured !== void 0) {
      conditions.push(eq(resources.featured, filters.featured));
    }
    return db.select().from(resources).where(and(...conditions)).orderBy(desc(resources.createdAt));
  }
  async getResourceById(id) {
    const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    return result[0];
  }
  async getResourceBySlug(slug) {
    const result = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
    return result[0];
  }
  async createResource(insertResource) {
    const result = await db.insert(resources).values(insertResource).returning();
    return result[0];
  }
  async updateResource(id, resourceUpdate) {
    const result = await db.update(resources).set({ ...resourceUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(resources.id, id)).returning();
    return result[0];
  }
  async deleteResource(id) {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning();
    return result.length > 0;
  }
  // Blog Post methods (Phase 4)
  async getAllBlogPosts(filters) {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(blogPosts.category, filters.category));
    }
    if (filters?.featured !== void 0) {
      conditions.push(eq(blogPosts.featured, filters.featured));
    }
    return db.select().from(blogPosts).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(blogPosts.publishedAt));
  }
  async getPublishedBlogPosts(filters) {
    const conditions = [eq(blogPosts.published, true)];
    if (filters?.category) {
      conditions.push(eq(blogPosts.category, filters.category));
    }
    if (filters?.featured !== void 0) {
      conditions.push(eq(blogPosts.featured, filters.featured));
    }
    return db.select().from(blogPosts).where(and(...conditions)).orderBy(desc(blogPosts.publishedAt));
  }
  async getBlogPostById(id) {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return result[0];
  }
  async getBlogPostBySlug(slug) {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result[0];
  }
  async createBlogPost(insertBlogPost) {
    const result = await db.insert(blogPosts).values(insertBlogPost).returning();
    return result[0];
  }
  async updateBlogPost(id, postUpdate) {
    const result = await db.update(blogPosts).set({ ...postUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(blogPosts.id, id)).returning();
    return result[0];
  }
  async deleteBlogPost(id) {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }
  // User Resource methods (Phase 4)
  async getUserResources(userId) {
    const result = await db.select().from(userResources).leftJoin(resources, eq(userResources.resourceId, resources.id)).where(eq(userResources.userId, userId)).orderBy(desc(userResources.purchasedAt));
    return result.map((row) => ({
      ...row.user_resources,
      resource: row.resources
    }));
  }
  async hasUserPurchasedResource(userId, resourceId) {
    const result = await db.select().from(userResources).where(and(eq(userResources.userId, userId), eq(userResources.resourceId, resourceId))).limit(1);
    return result.length > 0;
  }
  async createUserResource(insertUserResource) {
    const result = await db.insert(userResources).values(insertUserResource).returning();
    return result[0];
  }
  // Analytics methods (Phase 5)
  async getUserAnalytics(userId) {
    const apps = await db.select().from(applications).where(eq(applications.userId, userId));
    const userPlansData = await db.select().from(userPlans).where(eq(userPlans.userId, userId));
    const totalApplications = apps.length;
    const statusBreakdown = apps.reduce((acc, app2) => {
      const existing = acc.find((item) => item.status === app2.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: app2.status, count: 1 });
      }
      return acc;
    }, []);
    const timelineMap = apps.reduce((acc, app2) => {
      const date = app2.appliedDate.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const applicationTimeline = Object.entries(timelineMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    const totalCreditsFromPlans = userPlansData.reduce((sum, plan) => {
      return sum + (plan.creditsRemaining || 0);
    }, 0);
    const creditsRemaining = totalCreditsFromPlans;
    const creditsUsed = totalApplications;
    const offersCount = apps.filter((app2) => app2.status === "offer").length;
    const successRate = totalApplications > 0 ? offersCount / totalApplications * 100 : 0;
    const batchMap = apps.reduce((acc, app2) => {
      if (!acc[app2.batchNumber]) {
        acc[app2.batchNumber] = { count: 0, statuses: {} };
      }
      acc[app2.batchNumber].count++;
      acc[app2.batchNumber].statuses[app2.status] = (acc[app2.batchNumber].statuses[app2.status] || 0) + 1;
      return acc;
    }, {});
    const batchStats = Object.entries(batchMap).map(([batchNumber, data]) => ({
      batchNumber: parseInt(batchNumber),
      count: data.count,
      statuses: data.statuses
    })).sort((a, b) => b.batchNumber - a.batchNumber);
    return {
      totalApplications,
      statusBreakdown,
      applicationTimeline,
      creditsUsed,
      creditsRemaining,
      successRate,
      batchStats
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
    const offersCount = allApplications.filter((app2) => app2.status === "offer").length;
    const platformSuccessRate = totalApplications > 0 ? offersCount / totalApplications * 100 : 0;
    const userActivityMap = allUsers.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { newUsers: 0, applications: 0 };
      }
      acc[date].newUsers++;
      return acc;
    }, {});
    allApplications.forEach((app2) => {
      const date = app2.appliedDate.toISOString().split("T")[0];
      if (userActivityMap[date]) {
        userActivityMap[date].applications++;
      } else {
        userActivityMap[date] = { newUsers: 0, applications: 1 };
      }
    });
    const userActivity = Object.entries(userActivityMap).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date));
    const totalBatches = allBatches.length;
    const avgApplicationsPerBatch = totalBatches > 0 ? totalApplications / totalBatches : 0;
    return {
      totalUsers,
      totalApplications,
      totalCreditsDistributed,
      totalCreditsUsed,
      platformSuccessRate,
      userActivity,
      batchPerformance: { totalBatches, avgApplicationsPerBatch }
    };
  }
  // Phase 7 - Subscription methods
  async createSubscription(insertSubscription) {
    const result = await db.insert(subscriptions).values(insertSubscription).returning();
    return result[0];
  }
  async getSubscriptionById(id) {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    return result[0];
  }
  async getSubscriptionByStripeId(stripeSubscriptionId) {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)).limit(1);
    return result[0];
  }
  async getUserSubscriptions(userId) {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt));
  }
  async getAllSubscriptions() {
    return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }
  async updateSubscription(id, updates) {
    const result = await db.update(subscriptions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }
  async getUserPlansBySubscriptionId(subscriptionId) {
    return db.select().from(userPlans).where(eq(userPlans.subscriptionId, subscriptionId));
  }
  async updateUserPlan(id, updates) {
    const result = await db.update(userPlans).set(updates).where(eq(userPlans.id, id)).returning();
    return result[0];
  }
  async getExpiredUserPlans(gracePeriodEnd) {
    return db.select().from(userPlans).where(
      and(
        eq(userPlans.status, "active"),
        sql2`${userPlans.expiresAt} < ${gracePeriodEnd}`
      )
    );
  }
  // Phase 7 - Transaction methods
  async createTransaction(insertTransaction) {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }
  async getUserTransactions(userId, limit = 50, offset = 0) {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(limit).offset(offset);
  }
  async getAllTransactions(limit = 100, offset = 0) {
    const results = await db.select().from(transactions).leftJoin(users, eq(transactions.userId, users.id)).orderBy(desc(transactions.createdAt)).limit(limit).offset(offset);
    return results.map((row) => ({
      ...row.transactions,
      user: row.users
    }));
  }
  // Phase 7 - Promo Code methods
  async createPromoCode(insertPromoCode) {
    const result = await db.insert(promoCodes).values(insertPromoCode).returning();
    return result[0];
  }
  async getPromoCodeByCode(code) {
    const result = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase())).limit(1);
    return result[0];
  }
  async getAllPromoCodes() {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }
  async updatePromoCode(id, updates) {
    const result = await db.update(promoCodes).set(updates).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }
  async deletePromoCode(id) {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
  }
  async incrementPromoCodeUsage(id) {
    const result = await db.update(promoCodes).set({ currentUses: sql2`${promoCodes.currentUses} + 1` }).where(eq(promoCodes.id, id)).returning();
    return result[0];
  }
  async validatePromoCode(code) {
    const promoCode = await this.getPromoCodeByCode(code);
    if (!promoCode) {
      return { valid: false, error: "Promo code not found" };
    }
    if (!promoCode.active) {
      return { valid: false, error: "Promo code is no longer active" };
    }
    if (promoCode.expiresAt && /* @__PURE__ */ new Date() > promoCode.expiresAt) {
      return { valid: false, error: "Promo code has expired" };
    }
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return { valid: false, error: "Promo code usage limit reached" };
    }
    return { valid: true, promoCode };
  }
  // Phase 7 - Payment Method methods
  async createPaymentMethod(insertPaymentMethod) {
    const result = await db.insert(paymentMethods).values(insertPaymentMethod).returning();
    return result[0];
  }
  async getUserPaymentMethods(userId) {
    return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.isDefault));
  }
  async deletePaymentMethod(id) {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return result.length > 0;
  }
  async setDefaultPaymentMethod(userId, paymentMethodId) {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
    await db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, paymentMethodId));
  }
  // Phase 9 - Admin Enhancement methods
  async updateUser(id, updates) {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  async deactivateUser(id) {
    const result = await db.update(users).set({ deactivated: true, deactivatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async reactivateUser(id) {
    const result = await db.update(users).set({ deactivated: false, deactivatedAt: null }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getUserDetails(userId) {
    const user = await this.getUser(userId);
    if (!user) return void 0;
    const { password, ...userWithoutPassword } = user;
    const plans2 = await this.getUserPlans(userId);
    const allApps = await this.getApplications(userId);
    const subs = await this.getUserSubscriptions(userId);
    const trans = await this.getUserTransactions(userId);
    return {
      user: userWithoutPassword,
      plans: plans2,
      applications: allApps,
      subscriptions: subs,
      transactions: trans
    };
  }
  async updateUserPassword(id, hashedPassword) {
    const result = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getAllApplications(filters) {
    let query = db.select().from(applications).leftJoin(users, eq(applications.userId, users.id));
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(applications.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(applications.status, filters.status));
    }
    if (filters?.batchNumber !== void 0) {
      conditions.push(eq(applications.batchNumber, filters.batchNumber));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const results = await query.orderBy(desc(applications.createdAt));
    return results.map((row) => ({
      ...row.applications,
      user: row.users
    }));
  }
  async updateApplication(id, updates) {
    const result = await db.update(applications).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(applications.id, id)).returning();
    return result[0];
  }
  async deleteApplication(id) {
    const result = await db.delete(applications).where(eq(applications.id, id)).returning();
    return result.length > 0;
  }
  async createAuditLog(insertLog) {
    const result = await db.insert(auditLogs).values(insertLog).returning();
    return result[0];
  }
  async getAuditLogs(filters, limit = 100, offset = 0) {
    const conditions = [];
    if (filters?.adminId) {
      conditions.push(eq(auditLogs.adminId, filters.adminId));
    }
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters?.targetType) {
      conditions.push(eq(auditLogs.targetType, filters.targetType));
    }
    if (filters?.startDate) {
      conditions.push(sql2`${auditLogs.createdAt} >= ${filters.startDate}`);
    }
    if (filters?.endDate) {
      conditions.push(sql2`${auditLogs.createdAt} <= ${filters.endDate}`);
    }
    let query = db.select().from(auditLogs);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  }
  async createAdminMessage(insertMessage) {
    const result = await db.insert(adminMessages).values(insertMessage).returning();
    return result[0];
  }
  async getAdminMessages(filters, limit = 100, offset = 0) {
    const conditions = [];
    if (filters?.senderId) {
      conditions.push(eq(adminMessages.senderId, filters.senderId));
    }
    if (filters?.startDate) {
      conditions.push(sql2`${adminMessages.sentAt} >= ${filters.startDate}`);
    }
    if (filters?.endDate) {
      conditions.push(sql2`${adminMessages.sentAt} <= ${filters.endDate}`);
    }
    let query = db.select().from(adminMessages);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return query.orderBy(desc(adminMessages.sentAt)).limit(limit).offset(offset);
  }
  async getPageContent(pageName) {
    const result = await db.select().from(pageContent).where(eq(pageContent.pageName, pageName)).limit(1);
    return result[0];
  }
  async upsertPageContent(insertContent) {
    const existing = await this.getPageContent(insertContent.pageName);
    if (existing) {
      const result = await db.update(pageContent).set({ ...insertContent, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pageContent.pageName, insertContent.pageName)).returning();
      return result[0];
    } else {
      const result = await db.insert(pageContent).values(insertContent).returning();
      return result[0];
    }
  }
  async createUploadedImage(insertImage) {
    const result = await db.insert(uploadedImages).values(insertImage).returning();
    return result[0];
  }
  async getAllUploadedImages(limit = 100, offset = 0) {
    return db.select().from(uploadedImages).orderBy(desc(uploadedImages.createdAt)).limit(limit).offset(offset);
  }
  async deleteUploadedImage(id) {
    const result = await db.delete(uploadedImages).where(eq(uploadedImages.id, id)).returning();
    return result.length > 0;
  }
};
var storage = new DbStorage();

// server/routes.ts
import { z as z2 } from "zod";

// server/utils/csvParser.ts
var REQUIRED_HEADERS = ["Job Title", "Company", "Application Date", "Status"];
var VALID_STATUSES = ["applied", "in_review", "interviewing", "rejected", "offer"];
function parseCSV(csvContent) {
  const errors = [];
  const data = [];
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    errors.push("CSV file must contain at least a header row and one data row");
    return { data, errors };
  }
  const headerLine = lines[0].trim();
  const headers = parseCSVLine(headerLine);
  const missingHeaders = REQUIRED_HEADERS.filter(
    (required) => !headers.some((h) => h.toLowerCase() === required.toLowerCase())
  );
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
    return { data, errors };
  }
  const headerIndexes = {
    jobId: headers.findIndex((h) => h.toLowerCase() === "job id"),
    jobTitle: headers.findIndex((h) => h.toLowerCase() === "job title"),
    company: headers.findIndex((h) => h.toLowerCase() === "company"),
    appliedDate: headers.findIndex((h) => h.toLowerCase() === "application date"),
    status: headers.findIndex((h) => h.toLowerCase() === "status")
  };
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const rowNum = i + 1;
    const jobTitle = values[headerIndexes.jobTitle]?.trim();
    const company = values[headerIndexes.company]?.trim();
    const appliedDate = values[headerIndexes.appliedDate]?.trim();
    const status = values[headerIndexes.status]?.trim().toLowerCase();
    if (!jobTitle) {
      errors.push(`Row ${rowNum}: Missing Job Title`);
      continue;
    }
    if (!company) {
      errors.push(`Row ${rowNum}: Missing Company`);
      continue;
    }
    if (!appliedDate) {
      errors.push(`Row ${rowNum}: Missing Application Date`);
      continue;
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      errors.push(
        `Row ${rowNum}: Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(", ")}`
      );
      continue;
    }
    const parsedDate = new Date(appliedDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid date format "${appliedDate}"`);
      continue;
    }
    data.push({
      jobId: headerIndexes.jobId >= 0 ? values[headerIndexes.jobId]?.trim() : void 0,
      jobTitle,
      company,
      appliedDate,
      status
    });
  }
  return { data, errors };
}
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
function convertCSVToApplications(csvData, userId, userPlanId, batchNumber) {
  return csvData.map((row) => ({
    userId,
    userPlanId,
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    company: row.company,
    status: row.status,
    batchNumber,
    appliedDate: new Date(row.appliedDate)
  }));
}

// server/services/automation.ts
var LinkedInProvider = class {
  name = "linkedin";
  async submitApplication(jobData) {
    console.log(`[LinkedIn Provider] Would submit application:`, jobData);
    return {
      success: true,
      jobId: `linkedin-${Date.now()}`
    };
  }
  async checkStatus(jobId) {
    console.log(`[LinkedIn Provider] Would check status for job:`, jobId);
    return {
      status: "submitted"
    };
  }
};
var IndeedProvider = class {
  name = "indeed";
  async submitApplication(jobData) {
    console.log(`[Indeed Provider] Would submit application:`, jobData);
    return {
      success: true,
      jobId: `indeed-${Date.now()}`
    };
  }
  async checkStatus(jobId) {
    console.log(`[Indeed Provider] Would check status for job:`, jobId);
    return {
      status: "submitted"
    };
  }
};
var AutomationService = class {
  providers;
  constructor() {
    this.providers = /* @__PURE__ */ new Map();
    this.providers.set("linkedin", new LinkedInProvider());
    this.providers.set("indeed", new IndeedProvider());
  }
  /**
   * Create a new automation job
   */
  async createJob(userId, provider, batchId, payload) {
    console.log(`[Automation] Creating job for user ${userId} with provider ${provider}`);
    const jobData = {
      userId,
      batchId,
      provider,
      payload
    };
    const job = await storage.createAutomationJob(jobData);
    console.log(`[Automation] Job created with ID ${job.id}`);
    return job;
  }
  /**
   * Process a job (placeholder - will trigger actual API calls in future)
   */
  async processJob(jobId) {
    const job = await storage.getAutomationJob(jobId);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    console.log(`[Automation] Processing job ${jobId} with provider ${job.provider}`);
    try {
      await storage.updateAutomationJobStatus(jobId, "processing");
      const provider = this.providers.get(job.provider);
      if (!provider) {
        throw new Error(`Provider ${job.provider} not found`);
      }
      const result = await provider.submitApplication(job.payload);
      if (result.success) {
        await storage.updateAutomationJobStatus(
          jobId,
          "completed",
          void 0,
          /* @__PURE__ */ new Date()
        );
        console.log(`[Automation] Job ${jobId} completed successfully`);
      } else {
        await storage.updateAutomationJobStatus(
          jobId,
          "failed",
          result.error || "Unknown error",
          /* @__PURE__ */ new Date()
        );
        console.log(`[Automation] Job ${jobId} failed: ${result.error}`);
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await storage.updateAutomationJobStatus(jobId, "failed", errorMessage, /* @__PURE__ */ new Date());
      console.error(`[Automation] Job ${jobId} failed:`, error);
      return { success: false, error: errorMessage };
    }
  }
  /**
   * Get automation statistics for a user
   */
  async getUserAutomationStats(userId) {
    const jobs = await storage.getUserAutomationJobs(userId);
    return {
      totalJobs: jobs.length,
      queuedJobs: jobs.filter((j) => j.status === "queued").length,
      processingJobs: jobs.filter((j) => j.status === "processing").length,
      completedJobs: jobs.filter((j) => j.status === "completed").length,
      failedJobs: jobs.filter((j) => j.status === "failed").length
    };
  }
  /**
   * Register a custom provider (for future extensibility)
   */
  registerProvider(provider) {
    this.providers.set(provider.name, provider);
    console.log(`[Automation] Registered provider: ${provider.name}`);
  }
};
var automationService = new AutomationService();

// server/services/notifications.ts
init_emailService();
var EmailChannel = class {
  async send(userEmail, message, metadata) {
    try {
      if (metadata?.type === "batch_completion") {
        const html = getBatchCompletionEmail(metadata.batchNumber, metadata.totalApplications);
        return await sendEmail({
          to: userEmail,
          subject: `Batch #${metadata.batchNumber} Completed - ${metadata.totalApplications} Applications`,
          html
        });
      } else if (metadata?.type === "status_change") {
        const html = getStatusUpdateEmail(
          metadata.jobTitle,
          metadata.company,
          metadata.oldStatus,
          metadata.newStatus
        );
        return await sendEmail({
          to: userEmail,
          subject: `Application Status Update - ${metadata.jobTitle}`,
          html
        });
      } else {
        return await sendEmail({
          to: userEmail,
          subject: "JobApply.pro Notification",
          html: `<p>${message}</p>`
        });
      }
    } catch (error) {
      console.error(`[Email] Failed to send to ${userEmail}:`, error);
      return false;
    }
  }
};
var SmsChannel = class {
  async send(userId, message, metadata) {
    console.log(`[SMS] Would send to user ${userId}: ${message}`);
    return true;
  }
};
var NotificationService = class {
  channels;
  constructor() {
    this.channels = /* @__PURE__ */ new Map();
    this.channels.set("email", new EmailChannel());
    this.channels.set("sms", new SmsChannel());
  }
  /**
   * Send a notification through specified channels
   */
  async send(userId, type, message, channels, metadata) {
    console.log(`[Notifications] Sending "${type}" to user ${userId} via channels:`, channels);
    const notification = {
      userId,
      type,
      message,
      channel: "in_app",
      metadata
    };
    await storage.createNotification(notification);
    const user = await storage.getUser(userId);
    if (!user) {
      console.error(`[Notifications] User ${userId} not found`);
      return;
    }
    const preferences = await storage.getUserNotificationPreferences(userId);
    for (const channel of channels) {
      if (channel === "in_app") continue;
      if (channel === "email" && preferences?.emailEnabled) {
        const emailChannel = this.channels.get("email");
        await emailChannel?.send(user.email, message, metadata);
      }
      if (channel === "sms" && preferences?.smsEnabled) {
        const smsChannel = this.channels.get("sms");
        await smsChannel?.send(user.phone || "", message, metadata);
      }
    }
  }
  /**
   * Trigger notification for batch completion
   */
  async notifyBatchCompletion(userId, batchNumber, totalApplications) {
    console.log(`[Notifications] Batch completion for user ${userId}, batch ${batchNumber}`);
    const preferences = await storage.getUserNotificationPreferences(userId);
    if (!preferences?.batchCompletionAlerts) {
      console.log(`[Notifications] Batch completion alerts disabled for user ${userId}`);
      return;
    }
    const message = `Batch ${batchNumber} completed! ${totalApplications} applications have been processed.`;
    const metadata = {
      batchNumber,
      totalApplications,
      type: "batch_completion"
    };
    await this.send(userId, "batch_completion", message, ["in_app", "email"], metadata);
  }
  /**
   * Trigger notification for application status change
   */
  async notifyStatusChange(userId, jobTitle, company, oldStatus, newStatus) {
    console.log(`[Notifications] Status change for user ${userId}: ${jobTitle} at ${company}`);
    const preferences = await storage.getUserNotificationPreferences(userId);
    if (!preferences?.statusUpdateAlerts) {
      console.log(`[Notifications] Status update alerts disabled for user ${userId}`);
      return;
    }
    const statusMessages = {
      in_review: "is now under review",
      interviewing: "has moved to interviewing stage",
      rejected: "was unfortunately rejected",
      offer: "resulted in an offer! Congratulations!"
    };
    const statusMessage = statusMessages[newStatus] || `status changed to ${newStatus}`;
    const message = `Your application for ${jobTitle} at ${company} ${statusMessage}.`;
    const metadata = {
      jobTitle,
      company,
      oldStatus,
      newStatus,
      type: "status_change"
    };
    await this.send(userId, "status_update", message, ["in_app", "email"], metadata);
  }
  /**
   * Trigger notification for batch processing start
   */
  async notifyBatchProcessing(userId, batchNumber, totalApplications) {
    console.log(`[Notifications] Batch processing started for user ${userId}, batch ${batchNumber}`);
    const message = `Batch ${batchNumber} is now being processed. ${totalApplications} applications are being submitted.`;
    const metadata = {
      batchNumber,
      totalApplications,
      type: "batch_processing"
    };
    await this.send(userId, "batch_processing", message, ["in_app"], metadata);
  }
  /**
   * Trigger notification for batch failure
   */
  async notifyBatchFailure(userId, batchNumber, error) {
    console.log(`[Notifications] Batch failure for user ${userId}, batch ${batchNumber}`);
    const message = `Batch ${batchNumber} encountered an error during processing. Our team has been notified.`;
    const metadata = {
      batchNumber,
      error,
      type: "batch_failure"
    };
    await this.send(userId, "batch_failure", message, ["in_app", "email"], metadata);
  }
};
var notificationService = new NotificationService();

// server/routes.ts
var requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  next();
};
var requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).send({ error: "Forbidden - Admin access required" });
  }
  next();
};
var upload = multer({ storage: multer.memoryStorage() });
async function registerRoutes(app2) {
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "jobapply-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1e3 * 60 * 60 * 24 * 7
        // 7 days
      }
    })
  );
  app2.post("/api/register", async (req, res) => {
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
        role: "user"
      });
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).send(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).send({ error: "Failed to register user" });
    }
  });
  app2.post("/api/login", async (req, res) => {
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
  app2.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send({ error: "Failed to logout" });
      }
      res.send({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
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
  app2.get("/api/plans", async (req, res) => {
    try {
      const plans2 = await storage.getActivePlans();
      res.send(plans2);
    } catch (error) {
      console.error("Get plans error:", error);
      res.status(500).send({ error: "Failed to get plans" });
    }
  });
  app2.get("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const plans2 = await storage.getAllPlans();
      res.send(plans2);
    } catch (error) {
      console.error("Get all plans error:", error);
      res.status(500).send({ error: "Failed to get plans" });
    }
  });
  app2.post("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(validatedData);
      res.status(201).send(plan);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Create plan error:", error);
      res.status(500).send({ error: "Failed to create plan" });
    }
  });
  app2.patch("/api/admin/plans/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPlanSchema.partial().parse(req.body);
      const updatedPlan = await storage.updatePlan(id, validatedData);
      if (!updatedPlan) {
        return res.status(404).send({ error: "Plan not found" });
      }
      res.send(updatedPlan);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Update plan error:", error);
      res.status(500).send({ error: "Failed to update plan" });
    }
  });
  app2.get("/api/user/plans", requireAuth, async (req, res) => {
    try {
      const userPlans2 = await storage.getUserPlans(req.session.userId);
      res.send(userPlans2);
    } catch (error) {
      console.error("Get user plans error:", error);
      res.status(500).send({ error: "Failed to get user plans" });
    }
  });
  app2.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const { status, batchNumber, submissionMode } = req.query;
      const filters = {};
      if (status && typeof status === "string") {
        filters.status = status;
      }
      if (batchNumber) {
        filters.batchNumber = parseInt(batchNumber);
      }
      if (submissionMode && typeof submissionMode === "string") {
        filters.submissionMode = submissionMode;
      }
      const applications2 = await storage.getApplications(req.session.userId, filters);
      res.send(applications2);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).send({ error: "Failed to get applications" });
    }
  });
  app2.get("/api/user/batches", requireAuth, async (req, res) => {
    try {
      const batches = await storage.getUserBatches(req.session.userId);
      res.send(batches);
    } catch (error) {
      console.error("Get user batches error:", error);
      res.status(500).send({ error: "Failed to get batch information" });
    }
  });
  app2.get("/api/user/automation-stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const appStats = await storage.getUserApplicationStats(userId);
      const automationStats = await automationService.getUserAutomationStats(userId);
      res.send({
        ...appStats,
        ...automationStats
      });
    } catch (error) {
      console.error("Get automation stats error:", error);
      res.status(500).send({ error: "Failed to get automation statistics" });
    }
  });
  app2.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const applications2 = await storage.getAllApplications({});
      const userPlans2 = await storage.getAllUserPlans();
      const transactions2 = await storage.getAllTransactions();
      const totalUsers = users2.length;
      const totalApplications = applications2.length;
      const activePlans = userPlans2.filter((up) => up.creditsRemaining > 0).length;
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const monthlyRevenue = transactions2.filter((t) => {
        const transDate = new Date(t.createdAt);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
      }).reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0).toFixed(2);
      res.send({
        totalUsers,
        totalApplications,
        activePlans,
        monthlyRevenue
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).send({ error: "Failed to get admin statistics" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map(({ password, ...user }) => user);
      res.send(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).send({ error: "Failed to get users" });
    }
  });
  app2.post(
    "/api/admin/applications/upload",
    requireAdmin,
    upload.single("csvFile"),
    async (req, res) => {
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
        const userPlans2 = await storage.getUserPlans(userId);
        const activePlans = userPlans2.filter((up) => up.creditsRemaining > 0);
        if (activePlans.length === 0) {
          return res.status(400).send({ error: "User has no active plans with credits" });
        }
        let totalCreditsAvailable = activePlans.reduce(
          (sum, plan) => sum + plan.creditsRemaining,
          0
        );
        if (totalCreditsAvailable < data.length) {
          return res.status(400).send({
            error: `Insufficient credits. User has ${totalCreditsAvailable} credits but needs ${data.length}`
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
          submissionMode: "manual"
        });
        res.send({
          message: `Successfully uploaded ${createdApplications.length} applications`,
          applicationsCreated: createdApplications.length,
          batchNumber,
          creditsDeducted: data.length,
          batchId: batch.id
        });
      } catch (error) {
        console.error("CSV upload error:", error);
        res.status(500).send({ error: "Failed to upload applications" });
      }
    }
  );
  app2.get("/api/admin/batches", requireAdmin, async (req, res) => {
    try {
      const batches = await storage.getAllBatches();
      res.send(batches);
    } catch (error) {
      console.error("Get all batches error:", error);
      res.status(500).send({ error: "Failed to get batches" });
    }
  });
  app2.patch("/api/admin/batches/:id/status", requireAdmin, async (req, res) => {
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
      const additionalFields = {};
      if (status === "processing") {
        additionalFields.startedAt = /* @__PURE__ */ new Date();
      }
      if (status === "completed" || status === "failed") {
        additionalFields.completedAt = /* @__PURE__ */ new Date();
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
  app2.post("/api/admin/batches/:id/complete", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const batch = await storage.updateBatchStatus(id, "completed", {
        completedAt: /* @__PURE__ */ new Date()
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
  app2.get("/api/admin/automation/jobs", requireAdmin, async (req, res) => {
    try {
      const jobs = await storage.getAllAutomationJobs();
      res.send(jobs);
    } catch (error) {
      console.error("Get automation jobs error:", error);
      res.status(500).send({ error: "Failed to get automation jobs" });
    }
  });
  app2.post("/api/admin/automation/jobs", requireAdmin, async (req, res) => {
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
  app2.get("/api/user/notification-preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      let preferences = await storage.getUserNotificationPreferences(userId);
      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          userId,
          emailEnabled: true,
          smsEnabled: false,
          batchCompletionAlerts: true,
          statusUpdateAlerts: true
        });
      }
      res.send(preferences);
    } catch (error) {
      console.error("Get notification preferences error:", error);
      res.status(500).send({ error: "Failed to get notification preferences" });
    }
  });
  app2.put("/api/user/notification-preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { emailEnabled, smsEnabled, batchCompletionAlerts, statusUpdateAlerts } = req.body;
      let preferences = await storage.getUserNotificationPreferences(userId);
      if (!preferences) {
        preferences = await storage.createUserNotificationPreferences({
          userId,
          emailEnabled: emailEnabled ?? true,
          smsEnabled: smsEnabled ?? false,
          batchCompletionAlerts: batchCompletionAlerts ?? true,
          statusUpdateAlerts: statusUpdateAlerts ?? true
        });
      } else {
        preferences = await storage.updateUserNotificationPreferences(userId, {
          emailEnabled,
          smsEnabled,
          batchCompletionAlerts,
          statusUpdateAlerts
        });
      }
      res.send(preferences);
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).send({ error: "Failed to update notification preferences" });
    }
  });
  app2.put("/api/user/phone", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
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
  app2.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const unreadOnly = req.query.unreadOnly === "true";
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const notifications2 = await storage.getUserNotifications(userId, unreadOnly, limit, offset);
      res.send(notifications2);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).send({ error: "Failed to get notifications" });
    }
  });
  app2.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const count = await storage.getUnreadNotificationCount(userId);
      res.send({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).send({ error: "Failed to get unread count" });
    }
  });
  app2.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
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
  app2.post("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const count = await storage.markAllNotificationsAsRead(userId);
      res.send({ updated: count });
    } catch (error) {
      console.error("Mark all as read error:", error);
      res.status(500).send({ error: "Failed to mark all as read" });
    }
  });
  app2.get("/api/resources", async (req, res) => {
    try {
      const { category, featured } = req.query;
      const filters = {};
      if (category) filters.category = category;
      if (featured === "true") filters.featured = true;
      const resources2 = await storage.getActiveResources(filters);
      res.send(resources2);
    } catch (error) {
      console.error("Get resources error:", error);
      res.status(500).send({ error: "Failed to fetch resources" });
    }
  });
  app2.get("/api/resources/:slug", async (req, res) => {
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
  app2.get("/api/user/resources", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userResources2 = await storage.getUserResources(userId);
      res.send(userResources2);
    } catch (error) {
      console.error("Get user resources error:", error);
      res.status(500).send({ error: "Failed to fetch user resources" });
    }
  });
  app2.post("/api/resources/:id/purchase", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
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
          amountPaid: null
        });
        return res.status(201).send(userResource);
      }
      if (purchaseMethod === "credits") {
        if (!resource.credits) {
          return res.status(400).send({ error: "Credits not accepted for this resource" });
        }
        const userPlans2 = await storage.getUserPlans(userId);
        const totalCredits = userPlans2.reduce((sum, up) => sum + up.creditsRemaining, 0);
        if (totalCredits < resource.credits) {
          return res.status(400).send({ error: "Insufficient credits" });
        }
        let creditsToDeduct = resource.credits;
        for (const userPlan of userPlans2.sort(
          (a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime()
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
          amountPaid: null
        });
        return res.status(201).send(userResource);
      }
      if (purchaseMethod === "payment") {
        const userResource = await storage.createUserResource({
          userId,
          resourceId: id,
          purchaseMethod: "payment",
          creditsSpent: null,
          amountPaid: resource.price || "0"
        });
        return res.status(201).send(userResource);
      }
      res.status(400).send({ error: "Invalid purchase method" });
    } catch (error) {
      console.error("Purchase resource error:", error);
      res.status(500).send({ error: "Failed to purchase resource" });
    }
  });
  app2.get("/api/blog", async (req, res) => {
    try {
      const { category, featured } = req.query;
      const filters = {};
      if (category) filters.category = category;
      if (featured === "true") filters.featured = true;
      const posts = await storage.getPublishedBlogPosts(filters);
      res.send(posts);
    } catch (error) {
      console.error("Get blog posts error:", error);
      res.status(500).send({ error: "Failed to fetch blog posts" });
    }
  });
  app2.get("/api/blog/:slug", async (req, res) => {
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
  app2.get("/api/admin/resources", requireAdmin, async (req, res) => {
    try {
      const resources2 = await storage.getAllResources();
      res.send(resources2);
    } catch (error) {
      console.error("Get all resources error:", error);
      res.status(500).send({ error: "Failed to fetch resources" });
    }
  });
  app2.post("/api/admin/resources", requireAdmin, async (req, res) => {
    try {
      const resource = await storage.createResource(req.body);
      res.status(201).send(resource);
    } catch (error) {
      console.error("Create resource error:", error);
      res.status(500).send({ error: "Failed to create resource" });
    }
  });
  app2.patch("/api/admin/resources/:id", requireAdmin, async (req, res) => {
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
  app2.delete("/api/admin/resources/:id", requireAdmin, async (req, res) => {
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
  app2.get("/api/admin/blog", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.send(posts);
    } catch (error) {
      console.error("Get all blog posts error:", error);
      res.status(500).send({ error: "Failed to fetch blog posts" });
    }
  });
  app2.post("/api/admin/blog", requireAdmin, async (req, res) => {
    try {
      const post = await storage.createBlogPost(req.body);
      res.status(201).send(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(500).send({ error: "Failed to create blog post" });
    }
  });
  app2.patch("/api/admin/blog/:id", requireAdmin, async (req, res) => {
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
  app2.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
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
  app2.get("/api/user/analytics", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const analytics = await storage.getUserAnalytics(userId);
      res.send(analytics);
    } catch (error) {
      console.error("Get user analytics error:", error);
      res.status(500).send({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.send(analytics);
    } catch (error) {
      console.error("Get admin analytics error:", error);
      res.status(500).send({ error: "Failed to fetch admin analytics" });
    }
  });
  app2.post("/api/ai/cv-optimization", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { currentCV, targetRole, targetIndustry } = req.body;
      if (!currentCV || currentCV.trim().length < 50) {
        return res.status(400).send({ error: "Please provide your CV content (minimum 50 characters)" });
      }
      const { generateCVOptimizationTips: generateCVOptimizationTips2 } = await Promise.resolve().then(() => (init_aiService(), aiService_exports));
      const tips = await generateCVOptimizationTips2({ currentCV, targetRole, targetIndustry });
      const artifact = await storage.createAiArtifact({
        userId,
        artifactType: "cv_optimization",
        content: {
          input: { currentCV: currentCV.substring(0, 500) + "...", targetRole, targetIndustry },
          output: tips,
          metadata: { targetRole, targetIndustry }
        }
      });
      res.status(201).send({ tips, artifactId: artifact.id });
    } catch (error) {
      console.error("CV optimization error:", error);
      res.status(500).send({ error: "Failed to generate CV optimization tips" });
    }
  });
  app2.post("/api/ai/cover-letter", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { jobTitle, company, jobDescription, userCV, applicationId } = req.body;
      if (!jobTitle || !company) {
        return res.status(400).send({ error: "Job title and company are required" });
      }
      const { generateCoverLetter: generateCoverLetter2 } = await Promise.resolve().then(() => (init_aiService(), aiService_exports));
      const coverLetter = await generateCoverLetter2({ jobTitle, company, jobDescription, userCV });
      const artifact = await storage.createAiArtifact({
        userId,
        artifactType: "cover_letter",
        content: {
          input: { jobTitle, company },
          output: coverLetter,
          metadata: { jobTitle, company, applicationId }
        }
      });
      res.status(201).send({ coverLetter, artifactId: artifact.id });
    } catch (error) {
      console.error("Cover letter generation error:", error);
      res.status(500).send({ error: "Failed to generate cover letter" });
    }
  });
  app2.get("/api/ai/artifacts", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const artifacts = await storage.getUserArtifacts(userId);
      res.send(artifacts);
    } catch (error) {
      console.error("Get AI artifacts error:", error);
      res.status(500).send({ error: "Failed to fetch AI artifacts" });
    }
  });
  app2.post("/api/payment/create-checkout-session", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
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
      const planPrice = typeof plan.price === "string" ? parseFloat(plan.price) : plan.price;
      let finalAmount = planPrice;
      let appliedPromoCode = null;
      if (promoCode) {
        const validation = await storage.validatePromoCode(promoCode);
        if (validation.valid && validation.promoCode) {
          appliedPromoCode = validation.promoCode;
          const discountValue = typeof appliedPromoCode.discountValue === "string" ? parseFloat(appliedPromoCode.discountValue) : Number(appliedPromoCode.discountValue);
          if (appliedPromoCode.discountType === "percentage") {
            finalAmount = finalAmount * (1 - discountValue / 100);
          } else {
            finalAmount = Math.max(0, finalAmount - discountValue);
          }
        }
      }
      const { createCheckoutSession: createCheckoutSession2 } = await Promise.resolve().then(() => (init_paymentService(), paymentService_exports));
      const session2 = await createCheckoutSession2({
        planId: plan.id.toString(),
        planName: plan.name,
        amount: finalAmount,
        userId,
        userEmail: user.email,
        isSubscription: plan.type === "subscription",
        billingPeriod: plan.billingPeriod || void 0,
        promoCodeId: appliedPromoCode?.id
      });
      res.send({ sessionId: session2.id, url: session2.url });
    } catch (error) {
      console.error("Create checkout session error:", error);
      res.status(500).send({ error: "Failed to create checkout session" });
    }
  });
  app2.post("/api/payment/webhook", async (req, res) => {
    try {
      const { handleStripeWebhook: handleStripeWebhook2 } = await Promise.resolve().then(() => (init_paymentService(), paymentService_exports));
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).send({ error: "Missing stripe signature" });
      }
      await handleStripeWebhook2(storage, req.body, signature);
      res.send({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send({ error: "Webhook processing failed" });
    }
  });
  app2.get("/api/subscription/details", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const subscriptions2 = await storage.getUserSubscriptions(userId);
      const subscriptionDetails = await Promise.all(
        subscriptions2.map(async (sub) => {
          const plan = await storage.getPlanById(sub.planId);
          const userPlansForSub = await storage.getUserPlansBySubscriptionId(sub.id);
          return {
            ...sub,
            plan,
            userPlan: userPlansForSub[0]
          };
        })
      );
      res.send(subscriptionDetails);
    } catch (error) {
      console.error("Get subscription details error:", error);
      res.status(500).send({ error: "Failed to fetch subscription details" });
    }
  });
  app2.post("/api/subscription/cancel", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
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
      const { cancelSubscription: cancelSubscription2 } = await Promise.resolve().then(() => (init_paymentService(), paymentService_exports));
      const result = await cancelSubscription2(userPlan.subscriptionId, false);
      res.send(result);
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).send({ error: "Failed to cancel subscription" });
    }
  });
  app2.post("/api/subscription/reactivate", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
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
      const { reactivateSubscription: reactivateSubscription2 } = await Promise.resolve().then(() => (init_paymentService(), paymentService_exports));
      const result = await reactivateSubscription2(userPlan.subscriptionId);
      res.send(result);
    } catch (error) {
      console.error("Reactivate subscription error:", error);
      res.status(500).send({ error: "Failed to reactivate subscription" });
    }
  });
  app2.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const transactions2 = await storage.getUserTransactions(userId);
      res.send(transactions2);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).send({ error: "Failed to fetch transactions" });
    }
  });
  app2.post("/api/promo-code/validate", requireAuth, async (req, res) => {
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
  app2.get("/api/admin/promo-codes", requireAdmin, async (req, res) => {
    try {
      const promoCodes2 = await storage.getAllPromoCodes();
      res.send(promoCodes2);
    } catch (error) {
      console.error("Get promo codes error:", error);
      res.status(500).send({ error: "Failed to fetch promo codes" });
    }
  });
  app2.post("/api/admin/promo-codes", requireAdmin, async (req, res) => {
    try {
      const data = req.body;
      const userId = req.session.userId;
      const promoCodeData = {
        ...data,
        createdBy: userId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      };
      const promoCode = await storage.createPromoCode(promoCodeData);
      res.status(201).send(promoCode);
    } catch (error) {
      console.error("Create promo code error:", error);
      res.status(500).send({ error: "Failed to create promo code" });
    }
  });
  app2.patch("/api/admin/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const updateData = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : void 0
      };
      const promoCode = await storage.updatePromoCode(id, updateData);
      res.send(promoCode);
    } catch (error) {
      console.error("Update promo code error:", error);
      res.status(500).send({ error: "Failed to update promo code" });
    }
  });
  app2.delete("/api/admin/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePromoCode(id);
      res.send({ success: true });
    } catch (error) {
      console.error("Delete promo code error:", error);
      res.status(500).send({ error: "Failed to delete promo code" });
    }
  });
  app2.get("/api/admin/financial-metrics", requireAdmin, async (req, res) => {
    try {
      const transactions2 = await storage.getAllTransactions();
      const subscriptions2 = await storage.getAllSubscriptions();
      const parseAmount = (amount) => {
        return typeof amount === "string" ? parseFloat(amount) : amount;
      };
      const totalRevenue = transactions2.reduce((sum, t) => sum + parseAmount(t.amount), 0);
      const thisMonthStart = /* @__PURE__ */ new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      const thisMonthRevenue = transactions2.filter((t) => t.createdAt >= thisMonthStart).reduce((sum, t) => sum + parseAmount(t.amount), 0);
      const activeSubscriptions = subscriptions2.filter((s) => s.status === "active").length;
      const mrr = subscriptions2.filter((s) => s.status === "active").reduce((sum, s) => sum + parseAmount(s.amount), 0);
      const revenueTimeline = transactions2.reduce((acc, t) => {
        const date = t.createdAt.toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += parseAmount(t.amount);
        return acc;
      }, {});
      const revenueData = Object.entries(revenueTimeline).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
      res.send({
        totalRevenue,
        thisMonthRevenue,
        activeSubscriptions,
        mrr,
        revenueData
      });
    } catch (error) {
      console.error("Get financial metrics error:", error);
      res.status(500).send({ error: "Failed to fetch financial metrics" });
    }
  });
  app2.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const createUserSchema = insertUserSchema.omit({ password: true, role: true }).extend({
        role: z2.enum(["user", "admin"]).optional()
      });
      const validatedData = createUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).send({ error: "Email already exists" });
      }
      const tempPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: validatedData.role || "user"
      });
      const { sendEmail: sendEmail2, getNewUserWelcomeEmail: getNewUserWelcomeEmail2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      const emailHtml = getNewUserWelcomeEmail2(user.email, tempPassword);
      await sendEmail2({ to: user.email, subject: "Welcome to JobApply.pro - Your Account Details", html: emailHtml });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).send({ user: userWithoutPassword, tempPassword });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Create user error:", error);
      res.status(500).send({ error: "Failed to create user" });
    }
  });
  app2.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateUserSchema = z2.object({
        email: z2.string().email("Invalid email address").optional(),
        phone: z2.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z2.literal("")),
        role: z2.enum(["user", "admin"]).optional()
      });
      const validatedData = updateUserSchema.parse(req.body);
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).send({ error: "Email already exists" });
        }
      }
      const updatedUser = await storage.updateUser(id, validatedData);
      if (!updatedUser) {
        return res.status(404).send({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.send(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Update user error:", error);
      res.status(500).send({ error: "Failed to update user" });
    }
  });
  app2.patch("/api/admin/users/:id/deactivate", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.deactivateUser(id);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.send(userWithoutPassword);
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).send({ error: "Failed to deactivate user" });
    }
  });
  app2.patch("/api/admin/users/:id/reactivate", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.reactivateUser(id);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.send(userWithoutPassword);
    } catch (error) {
      console.error("Reactivate user error:", error);
      res.status(500).send({ error: "Failed to reactivate user" });
    }
  });
  app2.post("/api/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const tempPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const user = await storage.updateUserPassword(id, hashedPassword);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      const { sendEmail: sendEmail2, getPasswordResetEmail: getPasswordResetEmail2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      const emailHtml = getPasswordResetEmail2(user.email, tempPassword);
      await sendEmail2({ to: user.email, subject: "JobApply.pro - Password Reset", html: emailHtml });
      res.send({ tempPassword });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).send({ error: "Failed to reset password" });
    }
  });
  app2.get("/api/admin/users/:id/details", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userDetails = await storage.getUserDetails(id);
      if (!userDetails) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(userDetails);
    } catch (error) {
      console.error("Get user details error:", error);
      res.status(500).send({ error: "Failed to get user details" });
    }
  });
  app2.get("/api/admin/applications", requireAdmin, async (req, res) => {
    try {
      const { userId, status, batchNumber } = req.query;
      const filters = {};
      if (userId && typeof userId === "string") {
        filters.userId = userId;
      }
      if (status && typeof status === "string") {
        filters.status = status;
      }
      if (batchNumber) {
        filters.batchNumber = parseInt(batchNumber);
      }
      const applications2 = await storage.getAllApplications(filters);
      res.send(applications2);
    } catch (error) {
      console.error("Get all applications error:", error);
      res.status(500).send({ error: "Failed to get applications" });
    }
  });
  app2.patch("/api/admin/applications/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateApplicationSchema = z2.object({
        status: z2.enum(["applied", "in_review", "interviewing", "rejected", "offer"]).optional(),
        jobTitle: z2.string().optional(),
        company: z2.string().optional()
      });
      const validatedData = updateApplicationSchema.parse(req.body);
      const updatedApplication = await storage.updateApplication(id, validatedData);
      if (!updatedApplication) {
        return res.status(404).send({ error: "Application not found" });
      }
      res.send(updatedApplication);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Update application error:", error);
      res.status(500).send({ error: "Failed to update application" });
    }
  });
  app2.delete("/api/admin/applications/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteApplication(id);
      if (!deleted) {
        return res.status(404).send({ error: "Application not found" });
      }
      res.send({ success: true });
    } catch (error) {
      console.error("Delete application error:", error);
      res.status(500).send({ error: "Failed to delete application" });
    }
  });
  app2.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
    try {
      const { adminId, action, targetType, startDate, endDate, limit, offset } = req.query;
      const filters = {};
      if (adminId && typeof adminId === "string") {
        filters.adminId = adminId;
      }
      if (action && typeof action === "string") {
        filters.action = action;
      }
      if (targetType && typeof targetType === "string") {
        filters.targetType = targetType;
      }
      if (startDate && typeof startDate === "string") {
        filters.startDate = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        filters.endDate = new Date(endDate);
      }
      const limitNum = limit ? parseInt(limit) : void 0;
      const offsetNum = offset ? parseInt(offset) : void 0;
      const auditLogs2 = await storage.getAuditLogs(filters, limitNum, offsetNum);
      res.send(auditLogs2);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).send({ error: "Failed to get audit logs" });
    }
  });
  app2.get("/api/admin/messages/history", requireAdmin, async (req, res) => {
    try {
      const { senderId, startDate, endDate, limit, offset } = req.query;
      const filters = {};
      if (senderId && typeof senderId === "string") {
        filters.senderId = senderId;
      }
      if (startDate && typeof startDate === "string") {
        filters.startDate = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        filters.endDate = new Date(endDate);
      }
      const limitNum = limit ? parseInt(limit) : void 0;
      const offsetNum = offset ? parseInt(offset) : void 0;
      const messages = await storage.getAdminMessages(filters, limitNum, offsetNum);
      res.send(messages);
    } catch (error) {
      console.error("Get admin messages error:", error);
      res.status(500).send({ error: "Failed to get admin messages" });
    }
  });
  app2.get("/api/admin/content/:page", requireAdmin, async (req, res) => {
    try {
      const { page } = req.params;
      const content = await storage.getPageContent(page);
      if (!content) {
        return res.status(404).send({ error: "Page content not found" });
      }
      res.send(content);
    } catch (error) {
      console.error("Get page content error:", error);
      res.status(500).send({ error: "Failed to get page content" });
    }
  });
  app2.patch("/api/admin/content/:page", requireAdmin, async (req, res) => {
    try {
      const { page } = req.params;
      const adminId = req.session.userId;
      const updateContentSchema = z2.object({
        sections: z2.any().optional()
      });
      const validatedData = updateContentSchema.parse(req.body);
      const contentData = {
        pageName: page,
        updatedBy: adminId
      };
      if (validatedData.sections !== void 0) {
        contentData.sections = validatedData.sections;
      }
      const content = await storage.upsertPageContent(contentData);
      res.send(content);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).send({ error: error.errors[0].message });
      }
      console.error("Update page content error:", error);
      res.status(500).send({ error: "Failed to update page content" });
    }
  });
  app2.get("/api/admin/images", requireAdmin, async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const limitNum = limit ? parseInt(limit) : void 0;
      const offsetNum = offset ? parseInt(offset) : void 0;
      const images = await storage.getAllUploadedImages(limitNum, offsetNum);
      res.send(images);
    } catch (error) {
      console.error("Get uploaded images error:", error);
      res.status(500).send({ error: "Failed to get uploaded images" });
    }
  });
  app2.delete("/api/admin/images/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUploadedImage(id);
      if (!deleted) {
        return res.status(404).send({ error: "Image not found" });
      }
      res.send({ success: true });
    } catch (error) {
      console.error("Delete uploaded image error:", error);
      res.status(500).send({ error: "Failed to delete uploaded image" });
    }
  });
  app2.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.VITE_BASE_URL || "https://jobapply.pro";
      const blogPosts2 = await storage.getAllBlogPosts();
      const resources2 = await storage.getAllResources();
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/pricing", priority: "0.9", changefreq: "weekly" },
        { url: "/blog", priority: "0.8", changefreq: "daily" },
        { url: "/resources", priority: "0.8", changefreq: "weekly" },
        { url: "/login", priority: "0.5", changefreq: "monthly" },
        { url: "/register", priority: "0.5", changefreq: "monthly" }
      ];
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      staticPages.forEach((page) => {
        sitemap += "  <url>\n";
        sitemap += `    <loc>${baseUrl}${page.url}</loc>
`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>
`;
        sitemap += `    <priority>${page.priority}</priority>
`;
        sitemap += "  </url>\n";
      });
      blogPosts2.forEach((post) => {
        sitemap += "  <url>\n";
        sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>
`;
        sitemap += `    <lastmod>${new Date(post.updatedAt || post.createdAt).toISOString()}</lastmod>
`;
        sitemap += "    <changefreq>weekly</changefreq>\n";
        sitemap += "    <priority>0.7</priority>\n";
        sitemap += "  </url>\n";
      });
      resources2.forEach((resource) => {
        sitemap += "  <url>\n";
        sitemap += `    <loc>${baseUrl}/resources/${resource.slug}</loc>
`;
        sitemap += `    <lastmod>${new Date(resource.updatedAt || resource.createdAt).toISOString()}</lastmod>
`;
        sitemap += "    <changefreq>monthly</changefreq>\n";
        sitemap += "    <priority>0.6</priority>\n";
        sitemap += "  </url>\n";
      });
      sitemap += "</urlset>";
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send({ error: "Failed to generate sitemap" });
    }
  });
  app2.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.VITE_BASE_URL || "https://jobapply.pro";
    const robots = `# JobApply.pro Robots.txt
User-agent: *
Allow: /
Allow: /pricing
Allow: /blog
Allow: /blog/*
Allow: /resources
Allow: /resources/*

Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /admin
Disallow: /admin/*
Disallow: /api
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header("Content-Type", "text/plain");
    res.send(robots);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
