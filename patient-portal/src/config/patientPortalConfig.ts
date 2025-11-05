// Configuración del Portal del Paciente
export const PATIENT_PORTAL_CONFIG = {
  // URLs
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8003',

  // DentalCoin
  DENTAL_COIN_SYMBOL: 'DTC',
  EXCHANGE_RATE: 100, // 1 DTC = 100 ARS

  // Recompensas
  DAILY_BRUSHING_REWARD: 10, // DTC por cepillado diario
  WEEKLY_CHECKUP_REWARD: 50, // DTC por control semanal
  MONTHLY_MAINTENANCE_REWARD: 200, // DTC por mantenimiento mensual

  // Gamificación
  REFERRAL_REWARD: 25, // DTC por referido

  // UI
  WINDOW_WIDTH: 400,
  WINDOW_HEIGHT: 700,

  // MetaMask
  REQUIRED_NETWORK: 'mainnet', // o 'goerli' para testnet

  // Branding
  BRAND_NAME: 'DentalCoin',
  CLINIC_NAME: 'Dentiagest'
};