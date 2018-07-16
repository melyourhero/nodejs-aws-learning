import setupConfiguration from './../../../src/configuration';
setupConfiguration();

import 'mocha';

import {expect} from 'chai';

import fs from 'fs';
import path from 'path';

import nconf from 'nconf';
import requestPromise from 'request-promise';

const prefix = nconf.get('configuration:test:server');

describe('API AWS Integration Tests', () => {
  let parentDirectoryId: string | null = null;

  it('should create directory descriptor', async () => {
    const directoryName = 'My directory';
    const response = await requestPromise({
      method: 'POST',
      uri: `${prefix}/directory`,
      body: {
        name: directoryName,
      },
      json: true,
    });
    const { data } = response;

    expect(data).to.have.property('id');
    expect(data).to.have.property('name').equals(directoryName);
    expect(data).to.have.property('isDirectory').equals(true);
    expect(data).to.have.property('children').to.be.eql([]);
    expect(data).to.have.property('parent').to.be.eql(null);

    parentDirectoryId = data.id;
  });

  it('should create file descriptor during upload media', async () => {
    const filePath = path.resolve('./test/resources/favicon.png');
    const fileStream = fs.createReadStream(filePath);
    const formData = {
      parentId: parentDirectoryId,
      file: fileStream,
    };
    const response = await requestPromise
      .post({
        url: `${prefix}/media/upload`,
        formData,
        json: true,
      });
    const { data } = response;

    expect(data).to.have.property('fileKey');
    expect(data).to.have.property('fileSize');
    expect(data).to.have.property('id');
    expect(data).to.have.property('isDirectory').equals(false);
    expect(data).to.have.property('mimeType');
    expect(data).to.have.property('name');
    expect(data).to.have.property('parent').to.be.eql(parentDirectoryId);
    expect(data).to.have.property('preview');
  });
});
