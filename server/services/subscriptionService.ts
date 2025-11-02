import type { IStorage } from '../storage';
import type { InsertSubscription, InsertUserPlan, InsertTransaction } from '@shared/schema';
import { getSubscription } from './paymentService';
import type Stripe from 'stripe';

const GRACE_PERIOD_DAYS = 3;

export interface SubscriptionRenewalResult {
  success: boolean;
  subscriptionId: string;
  error?: string;
}

export async function handleCheckoutSessionCompleted(
  storage: IStorage,
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('[Webhook] Processing checkout session:', session.id);
  
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  const promoCodeId = session.metadata?.promoCodeId;

  if (!userId || !planId) {
    throw new Error('Missing required metadata in checkout session');
  }

  const plan = await storage.getPlanById(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const amountPaid = (session.amount_total || 0) / 100;

  // Create transaction record
  const transaction: InsertTransaction = {
    userId,
    planId,
    type: plan.type === 'subscription' ? 'subscription' : 'purchase',
    amount: amountPaid.toString(),
    status: 'completed',
    stripePaymentIntentId: session.payment_intent as string || null,
    stripeSubscriptionId: session.subscription as string || null,
    discountAmount: session.metadata?.discountApplied ? parseFloat(session.metadata.discountApplied).toString() : null,
    promoCodeId: promoCodeId || null,
  };

  await storage.createTransaction(transaction);
  console.log('[Webhook] Transaction created:', transaction);

  // Handle based on plan type
  if (plan.type === 'subscription' && session.subscription) {
    // Subscription - create subscription record
    const stripeSubscription = await getSubscription(session.subscription as string);
    
    await handleSubscriptionCreated(
      storage,
      stripeSubscription.id,
      stripeSubscription.customer as string,
      userId,
      planId,
      new Date(stripeSubscription.current_period_start * 1000),
      new Date(stripeSubscription.current_period_end * 1000)
    );
    console.log('[Webhook] Subscription created for user:', userId);
  } else {
    // One-time payment - create user_plan directly
    const userPlan: InsertUserPlan = {
      userId,
      planId,
      subscriptionId: null,
      creditsRemaining: plan.credits,
      status: 'active',
      autoRenew: false,
      expiresAt: null, // One-time plans don't expire
    };

    await storage.createUserPlan(userPlan);
    console.log('[Webhook] User plan created with', plan.credits, 'credits for user:', userId);
  }
}

export async function handleSubscriptionCreated(
  storage: IStorage,
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  userId: string,
  planId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<void> {
  const plan = await storage.getPlanById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  const subscription: InsertSubscription = {
    userId,
    planId,
    stripeSubscriptionId,
    stripeCustomerId,
    status: 'active',
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: false,
    amount: plan.price.toString(),
  };

  const createdSubscription = await storage.createSubscription(subscription);

  const userPlan: InsertUserPlan = {
    userId,
    planId,
    subscriptionId: createdSubscription.id,
    creditsRemaining: plan.credits,
    status: 'active',
    autoRenew: true,
    expiresAt: currentPeriodEnd,
  };

  await storage.createUserPlan(userPlan);
}

export async function handleSubscriptionUpdated(
  storage: IStorage,
  stripeSubscriptionId: string,
  status: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: boolean
): Promise<void> {
  const subscription = await storage.getSubscriptionByStripeId(stripeSubscriptionId);
  if (!subscription) {
    console.error('Subscription not found:', stripeSubscriptionId);
    return;
  }

  await storage.updateSubscription(subscription.id, {
    status: mapStripeStatus(status),
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  });

  const userPlans = await storage.getUserPlansBySubscriptionId(subscription.id);
  for (const userPlan of userPlans) {
    const mappedStatus = mapStripeStatusToUserPlan(status, cancelAtPeriodEnd);
    await storage.updateUserPlan(userPlan.id, {
      status: mappedStatus,
      expiresAt: currentPeriodEnd,
      autoRenew: !cancelAtPeriodEnd,
    });
  }
}

export async function handleSubscriptionCancelled(
  storage: IStorage,
  stripeSubscriptionId: string,
  canceledAt: Date
): Promise<void> {
  const subscription = await storage.getSubscriptionByStripeId(stripeSubscriptionId);
  if (!subscription) {
    console.error('Subscription not found:', stripeSubscriptionId);
    return;
  }

  await storage.updateSubscription(subscription.id, {
    status: 'canceled',
    canceledAt,
  });

  const userPlans = await storage.getUserPlansBySubscriptionId(subscription.id);
  for (const userPlan of userPlans) {
    await storage.updateUserPlan(userPlan.id, {
      status: 'cancelled',
      autoRenew: false,
    });
  }
}

export async function handleSubscriptionRenewal(
  storage: IStorage,
  stripeSubscriptionId: string
): Promise<SubscriptionRenewalResult> {
  try {
    const subscription = await storage.getSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
      return {
        success: false,
        subscriptionId: stripeSubscriptionId,
        error: 'Subscription not found',
      };
    }

    const plan = await storage.getPlanById(subscription.planId);
    if (!plan) {
      return {
        success: false,
        subscriptionId: stripeSubscriptionId,
        error: 'Plan not found',
      };
    }

    const userPlans = await storage.getUserPlansBySubscriptionId(subscription.id);
    for (const userPlan of userPlans) {
      await storage.updateUserPlanCredits(userPlan.id, plan.credits);
    }

    const stripeSubscription = await getSubscription(stripeSubscriptionId);
    await storage.updateSubscription(subscription.id, {
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      status: 'active',
    });

    return {
      success: true,
      subscriptionId: stripeSubscriptionId,
    };
  } catch (error) {
    console.error('Subscription renewal error:', error);
    return {
      success: false,
      subscriptionId: stripeSubscriptionId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkExpiredSubscriptions(storage: IStorage): Promise<void> {
  const now = new Date();
  const gracePeriodEnd = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  const expiredUserPlans = await storage.getExpiredUserPlans(gracePeriodEnd);

  for (const userPlan of expiredUserPlans) {
    if (userPlan.status === 'active') {
      await storage.updateUserPlan(userPlan.id, {
        status: 'expired',
        autoRenew: false,
      });

      if (userPlan.subscriptionId) {
        await storage.updateSubscription(userPlan.subscriptionId, {
          status: 'canceled',
        });
      }
    }
  }
}

function mapStripeStatus(stripeStatus: string): 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'cancelled':
      return 'canceled';
    case 'unpaid':
      return 'unpaid';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      return 'active';
  }
}

function mapStripeStatusToUserPlan(stripeStatus: string, cancelAtPeriodEnd: boolean): 'active' | 'expired' | 'cancelled' {
  if (cancelAtPeriodEnd) {
    return 'active';
  }

  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'active';
    case 'canceled':
    case 'cancelled':
    case 'incomplete':
    case 'incomplete_expired':
      return 'cancelled';
    default:
      return 'active';
  }
}

export async function handlePaymentSucceeded(
  storage: IStorage,
  userId: string,
  planId: string | null,
  subscriptionId: string | null,
  stripePaymentIntentId: string,
  amount: number,
  promoCodeId: string | null,
  discountAmount: number | null
): Promise<void> {
  const transaction: InsertTransaction = {
    userId,
    planId: planId || undefined,
    subscriptionId: subscriptionId || undefined,
    stripePaymentIntentId,
    type: subscriptionId ? 'subscription' : 'purchase',
    status: 'completed',
    amount: (amount / 100).toString(),
    currency: 'usd',
    description: subscriptionId ? 'Subscription payment' : 'Plan purchase',
    promoCodeId: promoCodeId || undefined,
    discountAmount: discountAmount ? (discountAmount / 100).toString() : undefined,
  };

  await storage.createTransaction(transaction);
}

export async function handlePaymentFailed(
  storage: IStorage,
  userId: string,
  planId: string | null,
  subscriptionId: string | null,
  stripePaymentIntentId: string,
  amount: number
): Promise<void> {
  const transaction: InsertTransaction = {
    userId,
    planId: planId || undefined,
    subscriptionId: subscriptionId || undefined,
    stripePaymentIntentId,
    type: subscriptionId ? 'renewal' : 'purchase',
    status: 'failed',
    amount: (amount / 100).toString(),
    currency: 'usd',
    description: 'Payment failed',
  };

  await storage.createTransaction(transaction);

  if (subscriptionId) {
    const subscription = await storage.getSubscriptionById(subscriptionId);
    if (subscription) {
      await storage.updateSubscription(subscription.id, {
        status: 'past_due',
      });

      const userPlans = await storage.getUserPlansBySubscriptionId(subscription.id);
      for (const userPlan of userPlans) {
        await storage.updateUserPlan(userPlan.id, {
          status: 'active',
        });
      }
    }
  }
}
