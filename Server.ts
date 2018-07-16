// configuration intializer for nconf
import setupConfiguration from './src/configuration';
setupConfiguration();

import http from 'http';
import log4js from 'log4js';
import mongoose from 'mongoose';
import nconf from 'nconf';

import app from './src/app';

import setupLogger from './src/setup/Logger';
import setupMongoose from './src/setup/DB';

setupLogger();
setupMongoose();

const logger = log4js.getLogger('setup:server');

const PORT = nconf.get('configuration:server:port');

const server = http.createServer(app).listen(PORT, (error: Error) => {
  if (error) {
    logger.error(`Error occurs during server start up. ${error}`);
  } else {
    logger.info(`The server is listening on port: ${PORT}`);
  }
});

server.on('close', async () => {
  await mongoose.connection.close();
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
