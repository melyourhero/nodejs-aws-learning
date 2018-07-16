import nconf from 'nconf';
import uuid from 'uuid';

import isNil from 'lodash/isNil';

import DescriptorManagementService from './DescriptorManagementService';

import FileDescriptor from '../../models/FileDescriptor';

import getAWSClient from '../../clients/AWSClient';

const AWSClient = getAWSClient();

export interface Upload {
  fileName: string;
  request: Promise<any>;
}

export interface AWSFileUpload {
  ETag: string;
  Location: string;
  key: string;
  Key: string;
  Bucket: string;
}

export interface AWSFileMeta {
  ContentLength: number;
}

interface DescriptorProperties {
  children?: string[];
  fileKey?: string;
  fileSize?: number;
  isDirectory: boolean;
  mimeType?: string;
  name: string;
  parent?: string | null;
  preview?: string;
}

export interface Descriptor {
  id?: string;
}

interface DirectoryDescriptorProperties {
  children?: string[];
  name: string;
  parent?: string;
}

class AWSDescriptorManagementService implements DescriptorManagementService {

  /**
   * Find file descriptor by descriptor id
   * @throws {Error} throws error when id is null
   * @param {string} id - descriptor id
   * @return {Promise<Descriptor>}
   */
  public async findDescriptorById(id: string | null) {
    if (isNil(id)) {
      throw new Error('Wrong descriptor id');
    }
    return FileDescriptor.findById(id);
  }

  /**
   * Creates instance of directory descriptor and save it in database
   * @param {DirectoryDescriptorProperties} properties - directory properties
   * @return {Promise<any>} return promise from insert request in database
   */
  public async createNewDirectoryDescriptor({ children, name, parent }: DirectoryDescriptorProperties): Promise<any> {
    const directoryDescriptorProperties: DescriptorProperties = {
      children,
      isDirectory: true,
      name,
      parent: parent ? parent : null,
    };
    return FileDescriptor.create(directoryDescriptorProperties);
  }

  /**
   * Creates instance of file descriptor and save it in database
   * @override
   * @param {Descriptor} parent - parent descriptor
   * @param {string} mimeType - file mime type
   * @param {Upload} upload - upload object
   * @return {Promise<any>} return promise from insert request in database
   */
  public async createNewFileDescriptor(parent: Descriptor | null, mimeType: string, upload: Upload): Promise<any> {
    const uploadResult: AWSFileUpload = await upload.request;
    const fileKey: string = uploadResult.Key;
    const fileMeta: AWSFileMeta = await this.getFileMeta(fileKey);
    const fileDescriptorProperties: DescriptorProperties = {
      fileKey,
      name: upload.fileName,
      fileSize: fileMeta.ContentLength,
      isDirectory: false,
      mimeType,
      parent: parent ? parent.id : null,
      preview: uploadResult.Location,
    };
    return FileDescriptor.create(fileDescriptorProperties);
  }

  /**
   * Create unique file name
   * @param {String} fileName - file name
   * @param {Stream} fileStream - payload for file name creation
   * @return {Promise} A promise that returns upload method
   */
  public async uploadFile(fileName: string, fileStream: NodeJS.ReadableStream): Promise<AWSFileUpload> {
    const fileKey = this.makeFileName(fileName);
    const params = {
      ACL: 'public-read',
      Body: fileStream,
      Bucket: `${nconf.get('configuration:server:applicationBucketName')}`,
      Key: fileKey,
    };
    return AWSClient.upload(params);
  }

  /**
   * Generate random file name
   * @param {string} fileName - name of file
   * @return {string} - return generated file name
   */
  private makeFileName(fileName: string): string {
    return `${uuid.v4()}-${fileName}`;
  }

  /**
   * The HEAD operation retrieves metadata from an object without returning the object itself
   * @param {String} fileKey - file key representation
   * @param {Object} options - list of available params see at official documentation of AWS sdk for headObject method
   * @return {Promise} A promise that returns forceDeleteBucket s3 client method
   */
  private getFileMeta(fileKey: string, options = {}): Promise<AWSFileMeta> {
    const params = {
      ...options,
      Bucket: `${nconf.get('configuration:server:applicationBucketName')}`,
      Key: fileKey,
    };
    return AWSClient.head(params);
  }
}

export default AWSDescriptorManagementService;
