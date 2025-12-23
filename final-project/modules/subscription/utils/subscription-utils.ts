/**
 * Subscription Utilities
 * 
 * Common utility functions used across subscription services.
 * These functions are shared to avoid code duplication.
 */

import type { Subscription } from "../domain/subscription.types";

/**
 * Calculate the next billing date based on intervalMonths
 */
export function calculateNextBilling(currentBilling: Date, intervalMonths: number): Date {
  const next = new Date(currentBilling);
  
  // Handle different interval types
  if (Math.abs(intervalMonths - 0.033) < 0.001) {
    // Daily: add 1 day
    next.setDate(next.getDate() + 1);
  } else if (Math.abs(intervalMonths - 0.25) < 0.001) {
    // Weekly: add 7 days
    next.setDate(next.getDate() + 7);
  } else if (Math.abs(intervalMonths - 1) < 0.001) {
    // Monthly: add 1 month
    next.setMonth(next.getMonth() + 1);
  } else if (Math.abs(intervalMonths - 12) < 0.001) {
    // Yearly: add 1 year
    next.setFullYear(next.getFullYear() + 1);
  } else {
    // Custom: add the specified number of months
    const monthsToAdd = Math.floor(intervalMonths);
    const daysToAdd = Math.round((intervalMonths - monthsToAdd) * 30);
    next.setMonth(next.getMonth() + monthsToAdd);
    if (daysToAdd > 0) {
      next.setDate(next.getDate() + daysToAdd);
    }
  }
  
  return next;
}

/**
 * Format date for display (YYYY/MM/DD)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${currency} ${rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Check if subscription should create a transaction today
 */
export function shouldCreateTransaction(subscription: Subscription): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextBilling = new Date(subscription.nextBilling);
  nextBilling.setHours(0, 0, 0, 0);
  
  // Check if nextBilling is today or in the past
  if (nextBilling > today) {
    return false;
  }
  
  // Check if subscription has expired
  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (today > endDate) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if subscription billing is in two days (for reminder notification)
 */
export function isBillingInTwoDays(subscription: Subscription): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  
  const nextBilling = new Date(subscription.nextBilling);
  nextBilling.setHours(0, 0, 0, 0);
  
  // Check if nextBilling is in two days
  return (
    nextBilling.getTime() === twoDaysLater.getTime() &&
    (!subscription.endDate || nextBilling <= new Date(subscription.endDate))
  );
}

/**
 * Calculate the correct nextBilling date based on today's date
 * This ensures nextBilling is always the next billing date from today
 */
export function calculateCorrectNextBilling(
  subscription: Subscription
): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(subscription.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  // If startDate is in the future, nextBilling should be startDate
  if (startDate > today) {
    return startDate;
  }
  
  // If startDate is today or in the past, calculate the next billing date
  // Start from startDate and find the first billing date that is after today
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  // Use a safety counter to prevent infinite loops
  let iterations = 0;
  const maxIterations = 1000;
  
  while (currentDate <= today && iterations < maxIterations) {
    const nextDate = calculateNextBilling(currentDate, subscription.intervalMonths);
    nextDate.setHours(0, 0, 0, 0);
    
    // If next date is the same as current date, break to avoid infinite loop
    if (nextDate.getTime() === currentDate.getTime()) {
      console.warn(`[calculateCorrectNextBilling] Next billing date is the same as current date, breaking loop`);
      break;
    }
    
    currentDate = nextDate;
    iterations++;
    
    // If we've found a date after today, return it
    if (currentDate > today) {
      // Check if it exceeds endDate
      if (subscription.endDate) {
        const endDate = new Date(subscription.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (currentDate > endDate) {
          // Return endDate if nextBilling exceeds it
          return endDate;
        }
      }
      return currentDate;
    }
  }
  
  if (iterations >= maxIterations) {
    console.warn(`[calculateCorrectNextBilling] Reached max iterations (${maxIterations}), returning current date + interval`);
    // Fallback: return today + interval
    return calculateNextBilling(today, subscription.intervalMonths);
  }
  
  // If we haven't found a date after today yet, calculate from currentDate
  const nextBilling = calculateNextBilling(currentDate, subscription.intervalMonths);
  
  // Check if it exceeds endDate
  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (nextBilling > endDate) {
      return endDate;
    }
  }
  
  return nextBilling;
}

/**
 * Calculate all expected transaction dates for a subscription
 * Returns dates from startDate to today (or endDate if earlier), based on intervalMonths
 */
export function calculateExpectedTransactionDates(
  subscription: Subscription
): Date[] {
  const expectedDates: Date[] = [];
  const startDate = new Date(subscription.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Determine the end date: use endDate if exists and earlier than today, otherwise use today
  let endDate: Date;
  if (subscription.endDate) {
    const subEndDate = new Date(subscription.endDate);
    subEndDate.setHours(0, 0, 0, 0);
    endDate = subEndDate < today ? subEndDate : today;
  } else {
    endDate = today;
  }
  
  // Start from startDate and generate dates based on intervalMonths
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  // Use a safety counter to prevent infinite loops
  let iterations = 0;
  const maxIterations = 1000; // Safety limit
  
  while (currentDate <= endDate && iterations < maxIterations) {
    expectedDates.push(new Date(currentDate));
    const nextDate = calculateNextBilling(currentDate, subscription.intervalMonths);
    nextDate.setHours(0, 0, 0, 0);
    
    // If next date is the same as current date, break to avoid infinite loop
    if (nextDate.getTime() === currentDate.getTime()) {
      console.warn(`[calculateExpectedTransactionDates] Next billing date is the same as current date, breaking loop`);
      break;
    }
    
    currentDate = nextDate;
    iterations++;
  }
  
  if (iterations >= maxIterations) {
    console.warn(`[calculateExpectedTransactionDates] Reached max iterations (${maxIterations}), stopping date generation`);
  }
  
  return expectedDates;
}

