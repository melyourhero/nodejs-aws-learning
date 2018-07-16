import AWS from 'aws-sdk';
import Bluebird from 'bluebird';
import log4js from 'log4js';
import nconf from 'nconf';
import {PromiseResult} from 'aws-sdk/lib/request';

import toLower from 'lodash/toLower';

import {singleton} from '../helpers/initializers';

const logger = log4js.getLogger('clients:AWSClient');

logger.info('AWS credentials access key id: ', nconf.get('configuration:credentials:aws:accessKeyId'));

AWS.config.setPromisesDependency(Bluebird);

// Setup credentials for AWS s3 storage
AWS.config.update({
  accessKeyId: nconf.get('configuration:credentials:aws:accessKeyId'),
  secretAccessKey: nconf.get('configuration:credentials:aws:secretAccessKey'),
});

const escapeAndToLowerBucketName = (bucketName: string): string => {
  return toLower(bucketName.replace(/ /g, '-'));
};

// TODO: add more methods and refact return type
class AWSClient {
  protected client: any;

  constructor() {
    this.client = new AWS.S3();
  }

  /**
   * Create new bucker in AWS s3 storage
   * @param {String} bucketName - name of new bucket
   * @return {Promise<Object>} A promise that returns createBucket method
   */
  public createBucket(bucketName: string): Promise<PromiseResult<string, string>> {
    const options = {
      Bucket: escapeAndToLowerBucketName(bucketName),
    };
    logger.debug('Create bucket options: ', options);
    return this.client.createBucket(options).promise();
  }

  /**
   * Get media file from bucker in AWS s3 storage
   * @param {String} bucketName - name of bucket
   * @param {String} fileKey - key of media file
   * @return {Promise<Object>} An object that returns getObject method of AWS SDK
   */
  public getObject(bucketName: string, fileKey: string): Promise<{}> {
    const options = {
      Bucket: escapeAndToLowerBucketName(bucketName),
      Key: fileKey,
    };
    logger.debug('Get object options: ', options);
    return this.client.getObject(options).promise();
  }

  /**
   * Add an object to a bucket
   * @param {Object} params - list of available params see at official documentation of AWS sdk
   * @return {Promise<Object>} A promise that returns putObject method
   */
  public put(params: { Bucket: string }): Promise<{}> {
    const options = {
      ...params,
      Bucket: escapeAndToLowerBucketName(params.Bucket),
    };
    logger.debug('Put object options: ', options);
    return this.client.putObject(options).promise();
  }

  /**
   * Uploads an arbitrarily sized buffer, blob, or stream
   * @param {Object} params - list of available params see at official documentation of AWS sdk
   * @return {Promise} A promise that returns upload method
   */
  public upload(params: { Bucket: string }): Promise<{}> {
    const options = {
      ...params,
      Bucket: escapeAndToLowerBucketName(params.Bucket),
    };
    logger.debug('Upload options: ', options);
    return this.client.upload(options).promise();
  }

  /**
   * The HEAD operation retrieves metadata from an object without returning the object itself
   * @param {Object} params - list of available params see at official documentation of AWS sdk
   * @return {Promise} A promise that returns forceDeleteBucket s3 client method
   */
  public head(params: { Bucket: string }) {
    const options = {
      ...params,
      Bucket: escapeAndToLowerBucketName(params.Bucket),
    };
    logger.debug('Head object options: ', options);
    return this.client.headObject(options).promise();
  }
}

export default singleton(() => new AWSClient());
