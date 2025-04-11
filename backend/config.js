const { MONGO_URI, PORT, APP_ROOT_URL, JWT_TOKEN } = process.env;

const config = {
  PORT,
  APP_ROOT_URL,
  MONGO_URI,
  JWT_TOKEN,
  PUBLIC_ROUTES:["/public"]
}

module.exports = config;
