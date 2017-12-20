const fs = require('fs');
const bluebird = require('bluebird');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(bluebird);

AWS.config.update({
  accessKeyId: fs.readFileSync('./credentials/key.txt'),
  secretAccessKey: fs.readFileSync('./credentials/secret.txt'),
});

let instance = null;

class S3Client {
  constructor() {
    this.s3Client = new AWS.S3();
  }

  createBucket(bucketName) {
    return this.s3Client.createBucket({Bucket: bucketName}).promise();
  }

  put(params) {
    return this.s3Client.putObject(params).promise();
  }

  upload(params) {
    return this.s3Client.upload(params).promise();
  }
}

function getInstance() {
  if (!instance) {
    instance = new S3Client();
  }

  return instance;
};

module.exports = {
  getInstance,
};