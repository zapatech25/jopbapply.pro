import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

export interface CreateCheckoutSessionParams {
  planId: string;
  planName: string;
  amount: number;
  credits?: number;
  description?: string;
  type?: 'one_time' | 'subscription';
  isSubscription?: boolean;
  billingPeriod?: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
  promoCode?: string;
  promoCodeId?: string;
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  phone?: string;
}

export async function createOrGetCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
  const existingCustomers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
  });
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const customer = await createOrGetCustomer({
    email: params.userEmail,
  });

  const isSubscription = params.isSubscription ?? (params.type === 'subscription');
  const baseUrl = process.env.REPLIT_DEPLOYMENT === 'production' 
    ? 'https://jobapply.pro' 
    : 'http://localhost:5000';

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customer.id,
    mode: isSubscription ? 'subscription' : 'payment',
    success_url: params.successUrl || `${baseUrl}/dashboard/cv-upload`,
    cancel_url: params.cancelUrl || `${baseUrl}/pricing`,
    metadata: {
      userId: params.userId,
      planId: params.planId,
      promoCodeId: params.promoCodeId || '',
    },
  };

  const productDescription = params.credits && params.description
    ? `${params.credits} Application Credits\n\n${params.description}`
    : params.description 
    ? params.description
    : params.credits 
    ? `${params.credits} Application Credits`
    : undefined;

  if (isSubscription) {
    sessionParams.line_items = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: params.planName,
          description: productDescription,
        },
        recurring: {
          interval: params.billingPeriod === 'yearly' ? 'year' : 'month',
        },
        unit_amount: Math.round(params.amount * 100),
      },
      quantity: 1,
    }];
    sessionParams.subscription_data = {
      metadata: {
        userId: params.userId,
        planId: params.planId,
      },
    };
  } else {
    sessionParams.line_items = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: params.planName,
          description: productDescription,
        },
        unit_amount: Math.round(params.amount * 100),
      },
      quantity: 1,
    }];
  }

  if (params.promoCode) {
    const promoCodes = await stripe.promotionCodes.list({
      code: params.promoCode,
      active: true,
      limit: 1,
    });
    
    if (promoCodes.data.length > 0) {
      sessionParams.discounts = [{
        promotion_code: promoCodes.data[0].id,
      }];
    }
  }

  return await stripe.checkout.sessions.create(sessionParams);
}

export async function createPaymentIntent(amount: number, customerId?: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    customer: customerId,
  });
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'subscription'],
  });
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}

export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export async function handleStripeWebhook(
  storage: any,
  payload: Buffer,
  signature: string
): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured. Webhook validation skipped.');
  }

  let event: Stripe.Event;
  
  try {
    if (webhookSecret) {
      event = constructWebhookEvent(payload, signature, webhookSecret);
    } else {
      event = JSON.parse(payload.toString());
    }
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  const {
    handleCheckoutSessionCompleted,
    handleSubscriptionUpdated,
    handleSubscriptionCancelled,
    handlePaymentSucceeded,
  } = await import('./subscriptionService');

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(storage, session);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(storage, subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(storage, subscription.id);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
        const userId = (invoice.subscription_details?.metadata as any)?.userId;
        if (userId) {
          await handlePaymentSucceeded(
            storage,
            userId,
            invoice.subscription as string,
            invoice.amount_paid / 100,
            invoice.id
          );
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.error('Payment failed for invoice:', invoice.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

export { stripe };
