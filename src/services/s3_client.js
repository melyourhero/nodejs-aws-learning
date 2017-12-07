const fs = require('fs');
const bluebird = require('bluebird');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(bluebird);

AWS.config.update({
  accessKeyId: fs.readFileSync('./credentials/key.txt'),
  secretAccessKey: fs.readFileSync('./credentials/secret.txt'),
});

const s3 = new AWS.S3();

const s3Client = (function () {
  let instance = null;

  const createInstance = () => ({
    createBucket(bucketName) {
      return s3.createBucket({ Bucket: bucketName }).promise();
    },

    put(params) {
      return s3.putObject(params).promise();
    },

    upload(params) {
      return s3.upload(params).promise();
    }
  });

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    }
  };
})();

module.exports = s3Client;