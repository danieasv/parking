const express = require('express');
const basicAuth = require('express-basic-auth')

const app = express();
const port = process.env.PORT || 3000

/* app.use(basicAuth({
  users: { 'inventas': 'inventas' },
  challenge: true
})) */

app.use(express.static('./'));
app.listen(port, () => console.log('App listening on port 3000'));

