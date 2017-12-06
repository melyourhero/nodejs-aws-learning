const http = require('http');
const mongoose = require('mongoose');

const app = require('./src/app');

const setupMongoose = require('./src/setup/db');

setupMongoose();

const port = 8080;

const server = http.createServer(app).listen(port, (error) => {
  if (error) {
    console.log(`Error occurs. ${error}`);
  } else {
    console.log(`==> The server is listening on port ${port}`);
  }
});

server.on('close', () => {
  mongoose.connection.close();
});

process.on('SIGINT', () => {
  mongoose.connection.close();

  process.exit(0);
});