const { MONGO_URI, PORT, APP_ROOT_URL, JWT_TOKEN } = process.env;

const config = {
  PORT,
  APP_ROOT_URL,
  MONGO_URI,
  JWT_TOKEN,
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || "",
  PUBLIC_ROUTES: ["/public"],
};

module.exports = config;
