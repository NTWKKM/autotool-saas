/**
 * OmniTools SaaS — Payment Gateway Configuration
 * 
 * To accept REAL payments from customers into your bank account:
 * 1. Create a Payment Link in Stripe (https://dashboard.stripe.com/payment-links)
 *    OR in Lemon Squeezy (https://app.lemonsqueezy.com/products)
 * 2. Paste your live checkout links below, or configure them via the UI Settings modal!
 */

const PAYMENT_CONFIG = {
  // Live Gateway Provider: 'stripe' | 'lemonsqueezy' | 'promptpay' | 'mock'
  defaultProvider: 'stripe',

  // Stripe Payment Links (Zero backend required, hosted checkout)
  stripe: {
    pro_monthly: '',     // e.g. 'https://buy.stripe.com/live_xxx'
    leads_dataset: '',   // e.g. 'https://buy.stripe.com/live_yyy'
    lifetime: ''         // e.g. 'https://buy.stripe.com/live_zzz'
  },

  // Lemon Squeezy Checkout Links (Merchant of Record, global taxes handled)
  lemonSqueezy: {
    pro_monthly: '',     // e.g. 'https://yourstore.lemonsqueezy.com/buy/variant-1'
    leads_dataset: '',   // e.g. 'https://yourstore.lemonsqueezy.com/buy/variant-2'
    lifetime: ''         // e.g. 'https://yourstore.lemonsqueezy.com/buy/variant-3'
  },

  // PromptPay Settings (For direct Thai Bank Transfer)
  promptPay: {
    enabled: true,
    recipientName: 'OmniTools Payments',
    accountNumber: '', // PromptPay ID (Phone or Tax ID)
  },

  // Returns the active checkout link (checks localStorage overrides first)
  getCheckoutUrl(planId) {
    try {
      const saved = localStorage.getItem('omni_payment_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.links && parsed.links[planId]) {
          return parsed.links[planId];
        }
      }
    } catch (e) {}

    // Fallback to coded configuration
    if (this.stripe[planId] && this.stripe[planId].startsWith('http')) {
      return this.stripe[planId];
    }
    if (this.lemonSqueezy[planId] && this.lemonSqueezy[planId].startsWith('http')) {
      return this.lemonSqueezy[planId];
    }
    return null;
  },

  // Check if real live payment is active
  isLivePaymentActive(planId) {
    return Boolean(this.getCheckoutUrl(planId));
  }
};

// Global export for vanilla scripts
if (typeof window !== 'undefined') {
  window.PAYMENT_CONFIG = PAYMENT_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PAYMENT_CONFIG;
}
