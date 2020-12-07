const app = require('./app');
const {PORT} = require('./config');
const MODE = process.env.NODE_ENV;

app.listen(PORT, () => {
  console.log(`Server running in ${MODE} mode and listening at port: ${PORT}`)
})