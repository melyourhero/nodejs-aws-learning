const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('./routes/media'));
app.use(require('./routes/social'));

app.get('/', (req, res) => {
  res.send({ message: 'Test message!' });
});

module.exports = app;






