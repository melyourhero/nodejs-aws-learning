const express = require('express');
const Busboy = require('busboy');
const get = require('lodash/fp/get');

const { descriptorManagement } = require('../services/descriptor_management');
const { uploadFile } = require('../services/file_service');

const router = new express.Router();

const descriptorManager = descriptorManagement();

const getFileName = get('Key');
const getFileLocation = get('Location');

router.delete('/media/files', async (req, res) => {
  try {
    const descriptors = await descriptorManager.removeAllDescriptors();

    res.send({ data: descriptors })
  } catch (error) {
    console.log(`Error when delete all descriptors. ${error}`);

    res.send({ error });
  }
});

router.delete('/media/files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const descriptor = await descriptorManager.removeDescriptorById(id);

    res.send({ data: descriptor })
  } catch (error) {
    console.log(`Error when delete specific descriptors. ${error}`);

    res.send({ error });
  }
});

router.get('/media/files', async (req, res) => {
  try {
    const descriptors = await descriptorManager.findAllDescriptors();

    res.send({ data: descriptors })
  } catch (error) {
    onsole.log(`Error when find all descriptors. ${error}`);

    res.send({ error });
  }
});

router.get('/media/files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const descriptor = await descriptorManager.findDescriptorById(id);

    res.send({ data: descriptor })

  } catch (error) {
    console.log(`Error when find descriptor by id. ${error}`);

    res.send(error);
  }
});

// TODO: add header validation
router.post('/media/files', async (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const uploads = [];

  let parentId = '';
  let fileName = '';

  busboy.on('field', (fieldname, value) => {
    if (fieldname === 'parentId') {
      parentId = value;
    }

    if (fieldname === 'fileName') {
      fileName = value;
    }
  });

  busboy.on('file', (fieldname, fileStream) => {
    if (!parentId) {
      res.status(400).send({ message: 'Bad request' });
    } else {
      uploads.push(uploadFile(fileStream, { fileName }).catch(error => {
        error.status = 'rejected';

        return error;
      }));
    }
  });

  busboy.on('finish', () => {
    Promise.all(uploads).then((uploadResults) => {
      uploadResults.forEach(async (uploadResult) => {
        if (uploadResult.status === 'rejected') {
          console.log(`Rejected. ${uploadResult}`);

          res.status(500).send({ error: uploadResult });
        } else {
          console.log(`AWS S3. Successfully uploaded. ${JSON.stringify(uploadResult, null, 4)}`);

          const fileName = getFileName(uploadResult);

          try {
            const fileDescriptor = await descriptorManager.createDescriptor({
              content: getFileLocation(uploadResult),
              fileName,
              isDir: false,
              parentId: parentId,
            });

            await descriptorManager.updateParentDescriptor(parentId, fileDescriptor);

            res.status(200).send({ message: 'Successful HTTP requests', ...uploadResult });
          } catch (error) {
            console.log(`Error creating descriptor. ${error}`);

            res.send({ error });
          }
        }
      });
    });
  });

  return req.pipe(busboy);
});

router.post('/media/dir', async (req, res) => {
  const { fileName, parentId } = req.body;

  try {
    const fileDescriptor = await descriptorManager.createDescriptor({ parentId, fileName, isDir: true });

    const result = await descriptorManager.updateParentDescriptor(parentId, fileDescriptor);

    console.log('res', result);

    res.send({ fileDescriptor, result })
  } catch (error) {
    console.log(`Error creating descriptor. ${error}`);

    res.send({ error });
  }
});

module.exports = router;
