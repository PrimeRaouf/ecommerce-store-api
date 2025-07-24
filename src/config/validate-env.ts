import { cleanEnv, str, port, num } from 'envalid';

export function validateEnv(env: NodeJS.ProcessEnv) {
  return cleanEnv(env, {
    NODE_ENV: str({
      choices: ['development', 'production', 'test', 'staging'],
    }),
    PORT: port({ default: 3000 }),

    REDIS_HOST: str(),
    REDIS_PORT: port({ default: 6379 }),
    REDIS_PASSWORD: str({ default: '' }),

    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str(),
  });
}
