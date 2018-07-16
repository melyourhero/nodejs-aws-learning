import express, {Request, Response} from 'express';
import Busboy from 'busboy';
import log4js from 'log4js';

import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';

import AWSDescriptorManagementService, {Upload} from '../services/DescriptorManagement/AWSDescriptorManagement';

const logger = log4js.getLogger('controllers:media');

const router = express.Router();

const BYTES_IN_MEGABYTE: number = 1000000;
const MEDIA_LIMIT: number = 5 * BYTES_IN_MEGABYTE;

const awsDescriptorManagementService = new AWSDescriptorManagementService();

interface BusboyOptions {
  headers: any;
  limits: {
    fileSize: number;
  };
}

router.post('/directory', async (request: Request, response: Response) => {
  const body = request.body;
  const directoryDescriptor = await awsDescriptorManagementService.createNewDirectoryDescriptor(body);
  // TODO: add default serializer
  response.send({
    data: {
      children: directoryDescriptor.children,
      id: directoryDescriptor._id,
      isDirectory: directoryDescriptor.isDirectory,
      name: directoryDescriptor.name,
      parent: directoryDescriptor.parent,
    },
  });
});

router.post('/media/upload', async (request: Request, response: Response) => {
  const busboyOptions: BusboyOptions = {
    headers: request.headers,
    limits: {
      fileSize: MEDIA_LIMIT,
    },
  };
  const busboy = new Busboy(busboyOptions);
  let upload: Upload;
  let parentId: string | null = null;
  let error: Error;
  let mimeType: string;

  busboy.on('field', (fieldName: string, fieldValue: any) => {
    if (isEqual(fieldName, 'parentId') && !isNil(fieldName)) {
      parentId = fieldValue;
    }
  });

  busboy.on('file', (
    fieldName: string,
    fileStream: NodeJS.ReadableStream,
    fileName: string,
    encoding: string,
    mimeFileType: string,
  ) => {
    if (!parentId) {
      error = new Error('Parent id should be placed before file');
    }

    fileStream.on('limit', () => {
      fileStream.emit('error');
      busboy.emit('filesLimit');
    });

    if (fieldName === 'file' && !error) {
      upload = {
        request: awsDescriptorManagementService.uploadFile(fileName, fileStream),
        fileName,
      };
    } else {
      // To finish reading the file when parentID field does not specified
      fileStream.on('data', noop);
    }

    mimeType = mimeFileType;
  });

  busboy.on('filesLimit', () => {
    response
      .status(400)
      .send({
        reason: 'File size limit reached',
      });
  });

  busboy.on('finish', async () => {
    if (error) {
      return response.send(error.message);
    }
    try {
      logger.debug('Parent descriptor id: ', parentId);
      const parentDescriptor = await awsDescriptorManagementService.findDescriptorById(parentId);
      const fileDescriptor = await awsDescriptorManagementService.createNewFileDescriptor(
        parentDescriptor,
        mimeType,
        upload,
      );
      // TODO: add default serializer
      response.send({
        data: {
          fileKey: fileDescriptor.parent,
          fileSize: fileDescriptor.parent,
          id: fileDescriptor._id,
          isDirectory: fileDescriptor.isDirectory,
          mimeType: fileDescriptor.parent,
          name: fileDescriptor.name,
          parent: fileDescriptor.parent,
          preview: fileDescriptor.parent,
        },
      });
    } catch (e) {
      logger.error('Error during file upload: ', e);
      response.status(500).send({
        message: e.message,
      });
    }
  });

  request.pipe(busboy);
});

export default router;
