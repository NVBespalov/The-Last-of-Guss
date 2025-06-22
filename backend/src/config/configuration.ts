export default () => {
  return {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'nest_project',
      schema: process.env.DB_SCHEMA || 'public',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'secretKey',
      expirationTime: process.env.JWT_EXPIRATION_TIME
        ? parseInt(process.env.JWT_EXPIRATION_TIME, 10)
        : 3600,
    },
    websocket: {
      port: process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 3001,
      corsOrigin: process.env.WS_CORS_ORIGIN || '*',
    },
    roundDuration: process.env.ROUND_DURATION
      ? parseInt(process.env.ROUND_DURATION, 10)
      : 30,
    cooldownTime: process.env.COOLDOWN_DURATION
      ? parseInt(process.env.COOLDOWN_DURATION, 10)
      : 5,
  };
};
