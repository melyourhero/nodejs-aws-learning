const uuid = require('uuid');

const { getInstance: getS3ClientInstace } = require('./s3_client');

const s3Client = getS3ClientInstace();

function makeFileName (fileName = 'file') {
  return `${fileName}-${uuid.v4()}`;
}

function uploadFile(fileStream, options) {
  return s3Client.upload({
    Bucket: 'node-sdk-sample-b2ad9a04-449e-49d8-96ee-57308a609c88',
    ACL: 'public-read',
    Body: fileStream,
    Key: makeFileName(options.fileName),
    ...options,
  });
}

module.exports = {
  makeFileName,
  uploadFile,
};