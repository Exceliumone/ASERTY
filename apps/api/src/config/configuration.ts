/**
 * Central, typed application configuration. Every environment variable the
 * app relies on is read exactly once, here, so the rest of the codebase
 * never touches `process.env` directly.
 */
export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.API_PORT ?? '4000', 10),
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    textModel: process.env.OPENAI_TEXT_MODEL ?? 'gpt-4.1',
    imageModel: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
  },

  x: {
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
    bearerToken: process.env.X_BEARER_TOKEN,
    clientId: process.env.X_CLIENT_ID,
    clientSecret: process.env.X_CLIENT_SECRET,
    username: process.env.PABLO_X_USERNAME,
  },

  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
});
