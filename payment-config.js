/**
 * OmniTools SaaS — Payment Gateway Configuration
 * 
 * Configured with Buy Me a Coffee: https://www.buymeacoffee.com/ntwkkm
 * Real payments accepted via Credit Card, Apple Pay, Google Pay!
 */

const PAYMENT_CONFIG = {
  // Primary Gateway: 'buymeacoffee' | 'stripe' | 'lemonsqueezy' | 'promptpay'
  defaultProvider: 'buymeacoffee',

  // Buy Me a Coffee — Instant Live Real Payment (Direct to ntwkkm)
  buyMeACoffee: {
    username: 'ntwkkm',
    url: 'https://www.buymeacoffee.com/ntwkkm',
    badgeText: 'Pay with Buy Me a Coffee'
  },

  // Stripe Payment Links (Optional overrides)
  stripe: {
    pro_monthly: '',
    leads_dataset: '',
    lifetime: ''
  },

  // Lemon Squeezy (Optional overrides)
  lemonSqueezy: {
    pro_monthly: '',
    leads_dataset: '',
    lifetime: ''
  },

  // PromptPay Settings
  promptPay: {
    enabled: true,
    recipientName: 'NTWKKM',
    accountNumber: ''
  },

  // Returns the active checkout link (checks localStorage overrides, then BMC)
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

    // Check custom stripe / lemon squeezy overrides
    if (this.stripe[planId] && this.stripe[planId].startsWith('http')) {
      return this.stripe[planId];
    }
    if (this.lemonSqueezy[planId] && this.lemonSqueezy[planId].startsWith('http')) {
      return this.lemonSqueezy[planId];
    }

    // Default primary: Real payment via Buy Me a Coffee!
    return this.buyMeACoffee.url;
  },

  // Real live payment is always active via Buy Me a Coffee
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
