import * as Joi from 'joi';

/**
 * Fails fast at boot if required secrets/connection strings are missing,
 * instead of surfacing obscure runtime errors later.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  API_PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  ENCRYPTION_KEY: Joi.string().length(64).hex().required(),
  OPENAI_API_KEY: Joi.string().allow('').optional(),
});
