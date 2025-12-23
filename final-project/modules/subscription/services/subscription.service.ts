/**
 * Subscription Service
 * 
 * Main service interface that combines CRUD and lifecycle operations.
 * This is a facade that delegates to specialized services.
 */

import { subscriptionCrudService } from "./subscription-crud.service";
import { subscriptionLifecycleService } from "./subscription-lifecycle.service";

/**
 * Subscription service interface
 * Combines CRUD and lifecycle operations
 */
export const subscriptionService = {
  // CRUD operations
  getSubscriptionById: subscriptionCrudService.getSubscriptionById,
  listSubscriptions: subscriptionCrudService.listSubscriptions,
  listSubscriptionHistory: subscriptionCrudService.listSubscriptionHistory,

  // Lifecycle operations
  createSubscription: subscriptionLifecycleService.createSubscription,
  updateSubscription: subscriptionLifecycleService.updateSubscription,
        };
