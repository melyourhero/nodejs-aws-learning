const express = require('express');

const { descriptorManagement } = require('../services/descriptor_management');
const FileManagement = require('../services/file_management');

const router = new express.Router();

const descriptorManager = descriptorManagement();

const fileManager = new FileManagement();

router.delete('/media/files', async (req, res) => {
  try {
    const docs = await descriptorManager.removeAllDescriptors();

    res.send({ docs })
  } catch (error) {
    console.log(`Error when delete all descriptors. ${error}`);

    res.send({ error });
  }
});

router.get('/media/files', async (req, res) => {
  try {
    const descriptors = await descriptorManager.findAllDescriptors();

    res.send({ descriptors })
  } catch (error) {
    onsole.log(`Error when find all descriptors. ${error}`);

    res.send({ error });
  }
});

router.get('/media/files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const descriptor = await descriptorManager.findDescriptorById(id);

    res.send({ descriptor })

  } catch (error) {
    console.log(`Error when find descriptor by id. ${error}`);

    res.send(error);
  }
});

router.post('/media/files', async (req, res) => {
  const { fileName, parentId } = req.body;

  if (req.headers['content-type'].includes('multipart/form-data')) {
    fileManager.setHeaders(req.headers);

    try {
      fileManager.uploadToStorage({}, {
        beforeUpload: () => {
          console.log('Before upload!');
        },
        afterUpload: (opts) => async (error, data) => {
          if (error) {
            console.log(`AWS S3 fail. ${error}`);

            throw Error(error);
          }

          console.log('opts', opts);

          console.log('AWS S3. Successfully uploaded');

          const fileDescriptor = await descriptorManager.createDescriptor({
            parentId: opts.parentId,
            fileName: opts.Key,
            isDir: false,
            content: data.Location,
          });

          await descriptorManager.updateParentDescriptor(opts.parentId, fileDescriptor);

          res.status(200).send({ message: 'Uploaded success', ...data });

        }
      }, req);
    } catch (error) {
      console.log(`Error when file posted. ${error}`);

      res.send({ error });
    }

    return;
  }

  try {
    const fileDescriptor = await descriptorManager.createDescriptor({ parent: parentId, fileName, isDir: true });

    console.log('parentId', parentId);

    if (parentId) {
      await descriptorManager.updateParentDescriptor(parentId, fileDescriptor);
    }

    res.send({ fileDescriptor })
  } catch (error) {
    console.log(`Error when dir created. ${error}`);

    res.send({ error });
  }
});

module.exports = router;
