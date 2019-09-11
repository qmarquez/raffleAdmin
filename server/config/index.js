if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

module.exports = {
  PORT: process.env.PORT,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  MONGODB_URI: process.env.MONGODB_URI,
  HOST: process.env.HOST
}