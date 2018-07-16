/* tslint:disable no-var-requires */

import fs from 'fs';
import nconf from 'nconf';
import path from 'path';

import merge from 'lodash/merge';

const CUSTOM_CONFIG_PATH = path.join(__dirname, '..', 'config', 'configuration.ts');

const setupConfiguration = () => {
  const defaultConfiguration = require('./defaultConfiguration');
  const customConfiguration = fs.existsSync(CUSTOM_CONFIG_PATH)
    ? require(CUSTOM_CONFIG_PATH)
    : {};
  nconf.use('memory');
  nconf
    .overrides(merge({}, defaultConfiguration, customConfiguration))
    .env();
};

export default setupConfiguration;
