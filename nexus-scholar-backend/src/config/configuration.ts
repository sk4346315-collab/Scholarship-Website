/**
 * Typed configuration factory loaded by NestJS ConfigModule.
 * All env vars are centralised here — import via ConfigService.
 */
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model:  'claude-sonnet-4-6',
    maxTokens: 1000,
  },

  jwt: {
    secret:         process.env.JWT_SECRET || 'change-this-in-production',
    accessExpiry:   process.env.JWT_ACCESS_EXPIRY  || '15m',
    refreshExpiry:  process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  smtp: {
    host:  process.env.SMTP_HOST || 'smtp.gmail.com',
    port:  parseInt(process.env.SMTP_PORT || '587', 10),
    user:  process.env.SMTP_USER,
    pass:  process.env.SMTP_PASS,
    from:  process.env.EMAIL_FROM || 'NEXUS SCHOLAR <noreply@nexusscholar.com>',
  },

  scraping: {
    highPriorityCron: '0 */6 * * *',   // Every 6 hours
    dailyCron:        '0 2 * * *',      // 2 AM daily
    maxConcurrent:    3,
    delayBetweenMs:   3000,
  },
})
