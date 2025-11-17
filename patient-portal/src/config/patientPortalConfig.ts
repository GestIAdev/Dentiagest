/**
 * 🏥 PATIENT PORTAL CONFIGURATION
 * By PunkClaude - Directiva #003 GeminiEnder
 * 
 * ⚠️ WEB3 BAN ENFORCEMENT:
 * - ZERO DentalCoin references
 * - ZERO MetaMask integration
 * - ZERO blockchain features
 * - ONLY FIAT payments (EUR/USD/ARS)
 */

export const PATIENT_PORTAL_CONFIG = {
  // URLs
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8005',
  GRAPHQL_URI: process.env.REACT_APP_GRAPHQL_URI || 'http://localhost:8005/graphql',

  // UI
  WINDOW_WIDTH: 400,
  WINDOW_HEIGHT: 700,

  // Branding
  BRAND_NAME: 'Dentiagest',
  CLINIC_NAME: 'Dentiagest',
  
  // Payment Methods (FIAT ONLY)
  SUPPORTED_CURRENCIES: ['EUR', 'USD', 'ARS'],
  SUPPORTED_PAYMENT_METHODS: ['card', 'bank_transfer', 'cash'],
  
  // Subscriptions (Netflix Dental Model)
  SUBSCRIPTION_PLANS: {
    BASIC: 'basic-care',
    PREMIUM: 'premium-care',
    ELITE: 'elite-care'
  }
};