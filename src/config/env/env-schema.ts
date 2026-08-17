import * as Joi from "joi";

export const envSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    NODE_ENV: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    PORT: Joi.number().required(),
});
