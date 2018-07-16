import log4js from 'log4js';
import mongoose from 'mongoose';
import nconf from 'nconf';

mongoose.Promise = global.Promise;

const logger = log4js.getLogger('setup:database');

const setupMongoose = (): void => {
  // TODO: fix deprecated option for new string parser => { useNewUrlParser: true }
  mongoose.connect(nconf.get('configuration:mongoose:application:uri'));
  mongoose.connection
    .once('open', () => logger.info('Mongoose successfully connect'))
    .on('connected', () => logger.info('Mongoose default connection open'))
    .on('disconnected', () => logger.info('Mongoose default connection disconnected'))
    .on('error', (error) => logger.error(`Mongoose connection error: ${error.message}`));
};

export default setupMongoose;
