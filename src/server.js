const app = require('./app');
const knex = require('knex');
const {PORT, DATABASE_URL} = require('./config');
const MODE = process.env.NODE_ENV;


const db = knex({
  client: 'pg',
  connection:DATABASE_URL,
})

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server running in ${MODE} mode and listening at port: ${PORT}`)
})