const fs = require('fs');
const Busboy = require('busboy');
const AWS = require('aws-sdk');

const merge = require('lodash/merge');

AWS.config.update({
  accessKeyId: fs.readFileSync('./credentials/key.txt'),
  secretAccessKey: fs.readFileSync('./credentials/secret.txt'),
});

class FileManagement {
  constructor() {
    // Create an S3 client and Busboy instance
    this.s3Client = new AWS.S3();
    this.busboyClient = null;
    this.parameters = {
      ACL: 'public-read',
      Body: Buffer.concat([]),
    };
  }

  setHeaders(headers) {
    this.busboyClient = new Busboy({ headers });
  }

  setBucket(bucketName) {
    this.bucketName = bucketName;
  }

  createBucket() {
    return this.s3Client.createBucket({ Bucket: this.bucketName });
  }

  uploadToStorage(options, { beforeUpload, afterUpload }, req) {

    if (!this.busboyClient) {
      throw Error ('You need specify appropriate headers');
    }

    this.busboyClient.on('field', (fieldname, value) => {
      // shit!!!!!
      if (fieldname === 'fileName') {
        this.parameters.Key = value;
      }

      if (fieldname === 'bucketName') {
        this.parameters.Bucket = value;
      }

      if (fieldname === 'parentId') {
        this.parameters.parentId = value;
      }
    });

    this.busboyClient.on('file', (fieldname, file) => {

      file.on('data', async (data) => {
        this.parameters.Body = this.parameters.Body.concat([data]);
      });

    });

      // again shit !!!
    this.busboyClient.on('finish', () => {
      beforeUpload();

      const params = merge(this.parameters, options);

      this.s3Client.upload(params, afterUpload(params));
    });

    req.pipe(this.busboyClient);
  }
};

module.exports = FileManagement;