require('dotenv');


module.exports = {
  "migrationsDirectory": "migrations",
  "driver": "pg",
  "database": (process.env.NODE_ENV === 'test')
    ? 'noteful-test'
    : 'noteful',
  "connectionString": (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
};