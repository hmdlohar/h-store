const { MONGO_URI, PORT, APP_ROOT_URL, JWT_TOKEN } = process.env;

const config = {
  PORT,
  APP_ROOT_URL,
  MONGO_URI,
  JWT_TOKEN,
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || "",
  POSTHOG_KEY: process.env.POSTHOG_KEY || "",
  POSTHOG_HOST: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
  PUBLIC_ROUTES: ["/public"],
};

module.exports = config;
