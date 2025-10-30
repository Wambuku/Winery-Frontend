// Configuration utilities for environment variables

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    wineApiUrl: process.env.WINE_API_BASE_URL || 'https://winery-backend.onrender.com/api',
    wineApiKey: process.env.WINE_API_KEY || '',
    // External wine API endpoints
    externalWineApi: {
      baseUrl: 'https://winery-backend.onrender.com/api',
      winesEndpoint: '/wines/',
      tokenEndpoint: '/token/',
    },
  },

  // M-Pesa Configuration
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    shortcode: process.env.MPESA_SHORTCODE || '',
    passkey: process.env.MPESA_PASSKEY || '',
    callbackUrl: process.env.MPESA_CALLBACK_URL || '',
    environment: process.env.NEXT_PUBLIC_MPESA_ENVIRONMENT || 'sandbox',
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Application Settings
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Wine E-commerce Platform',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880'), // 5MB default
    allowedImageTypes: process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },
} as const;

// Validation function to check required environment variables
export function validateConfig() {
  const requiredVars = [
    'WINE_API_BASE_URL',
    'WINE_API_KEY',
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'JWT_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
}

// Helper to check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';