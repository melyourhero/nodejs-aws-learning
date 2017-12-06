const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const setupMongoose = () => {
  mongoose.connect('mongodb://localhost/aws-app', { useMongoClient: true });

  mongoose.connection
    .once('open', () => console.log('Mongoose successfully connect'))
    .on('connected', () => console.log('Mongoose default connection open'))
    .on('disconnected', () => console.log('Mongoose default connection disconnected'))
    .on('error', (error) => console.log(`Mongoose connection error: ${error.message}`));
};

module.exports = setupMongoose;
