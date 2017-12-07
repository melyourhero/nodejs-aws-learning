const express = require('express');
const Busboy = require('busboy');
const { header } = require('express-validator/check');
const { map: asyncMap } = require('bluebird');
const get = require('lodash/fp/get');

const {
  createDescriptor,
  findAllDescriptors,
  findDescriptorById,
  removeAllDescriptors,
  removeDescriptorById,
} = require('../services/descriptor_management');
const { uploadFile } = require('../services/file_service');

const router = new express.Router();

const getFileName = get('Key');
const getFileLocation = get('Location');

const handlePromiseError = (error) => {
  error.status = 'rejected';

  return error;
};

const mapUploadResults = (parentId) => async (uploadResult) => {
  if (uploadResult.status === 'rejected') {
    console.log(`Rejected. ${uploadResult}`);

    return uploadResult;
  }

  console.log(`AWS S3. Successfully uploaded. ${JSON.stringify(uploadResult, null, 4)}`);

  const fileName = getFileName(uploadResult);

  try {
    return await createDescriptor({
      link: getFileLocation(uploadResult),
      fileName,
      isDir: false,
      parentId,
    });
  } catch (error) {
    console.log(`Error creating descriptor. ${error}`);

    return uploadResult;
  }
};

router.get('/media/files', async (req, res) => {
  try {
    const descriptors = await findAllDescriptors();

    res.send({ data: descriptors })
  } catch (error) {
    console.log(`Error when find all descriptors. ${error}`);

    res.send({ error });
  }
});

router.get('/media/files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const descriptor = await findDescriptorById(id).populate('children');

    res.send({ data: descriptor })

  } catch (error) {
    console.log(`Error when find descriptor by id. ${error}`);

    res.send(error);
  }
});

router.delete('/media/files', async (req, res) => {
  try {
    const descriptors = await removeAllDescriptors();

    res.send({ data: descriptors })
  } catch (error) {
    console.log(`Error when delete all descriptors. ${error}`);

    res.send({ error });
  }
});

router.delete('/media/files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const descriptor = await removeDescriptorById(id);

    res.send({ data: descriptor })
  } catch (error) {
    console.log(`Error when delete specific descriptors. ${error}`);

    res.send({ error });
  }
});

// TODO: add header validation
router.post('/media/files', [
  header('content-type', 'You need specify multipart/form-data content-type')
    .exists()
    .custom((value, { req }) => value.includes('multipart/form-data')), // shit
], async (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const uploads = [];

  let parentId = '';
  let isInvalid = false;

  busboy.on('field', (fieldName, value) => {
    if (isInvalid) {
      return;
    }

    if (fieldName === 'parentId') {
      parentId = value;
    }
  });

  busboy.on('file', (fieldName, fileStream, fileName) => {
    if (!parentId) {
      isInvalid = true;

      res.status(400).send({ message: 'Bad request' });
    } else {
      uploads.push(uploadFile(fileStream, { fileName }).catch(handlePromiseError));
    }
  });

  busboy.on('finish', () => {
    if (isInvalid) {
      return;
    }

    Promise.all(uploads)
      .then((uploadResults) => asyncMap(uploadResults, mapUploadResults(parentId)))
      .then((resolvedResults) => {
        res.status(200).send({ message: 'Successful HTTP requests', data: resolvedResults });
      });
  });

  return req.pipe(busboy);
});

router.post('/media/dir', async (req, res) => {
  const { dirName, parentId } = req.body;

  try {
    const fileDescriptor = await createDescriptor({
      parentId,
      fileName: dirName,
      isDir: true,
    });

    res.send({ data: fileDescriptor })
  } catch (error) {
    console.log(`Error creating descriptor. ${error}`);

    res.send({ error });
  }
});

module.exports = router;
