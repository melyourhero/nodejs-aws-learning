import log4js from 'log4js';
import nconf from 'nconf';
import morgan from 'morgan';

const setupLogger = (): void => {
  log4js.configure(nconf.get('configuration:logger'));
  morgan.token('body', (req) => req.body ? `\nBody:${JSON.stringify(req.body)}` : '');
};

export default setupLogger;
