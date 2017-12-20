const FileDescriptor = require('../models/file_descriptor');

function findDescriptorById(id) {
  return FileDescriptor.findById(id);
};

function findAllDescriptors() {
  return FileDescriptor.find({});
};

function findDescriptorByFileName(fileName) {
  return FileDescriptor.findOne({ fileName });
};

function updateParentDescriptor(id, descriptor) {
  const query = { $push: { children: descriptor } };

  return FileDescriptor.findByIdAndUpdate(id, query);
};

async function createDescriptor({ parentId, fileName, isDir, link = '' }) {
  const entity = parentId ? ({ parent: parentId, fileName, isDir, link }) : ({ fileName, isDir, link });
  const descriptor = await FileDescriptor.create(entity);

  if (parentId) {
    await updateParentDescriptor(parentId, descriptor);
  }

  return descriptor;
};

async function removeDescriptorById(id) {
  const descriptor = await FileDescriptor.findById(id);
  const query = { $pull: { children: id } };

  await FileDescriptor.findByIdAndUpdate(descriptor.parent, query);

  return await descriptor.remove();
};

async function removeAllDescriptors() {
  return await FileDescriptor.remove({});
};

module.exports = {
  createDescriptor,
  findAllDescriptors,
  findDescriptorByFileName,
  findDescriptorById,
  removeAllDescriptors,
  removeDescriptorById,
  updateParentDescriptor,
};