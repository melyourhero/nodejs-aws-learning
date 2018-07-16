import nconf from 'nconf';

import getAWSClient from '../clients/AWSClient';

const AWSClient = getAWSClient();

async function createApplicationBucket() {
  const bucketName = `${nconf.get('configuration:server:applicationBucketName')}`;
  await AWSClient.createBucket(bucketName);
}

export default createApplicationBucket;
