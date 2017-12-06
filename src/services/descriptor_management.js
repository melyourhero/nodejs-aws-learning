const FileDescriptor = require('../models/file_descriptor');

const descriptorFactory = ({ parentId, fileName, isDir, content }) => (
  parentId ? ({ parent: parentId, fileName, isDir, content }) : ({ fileName, isDir, content })
);

function descriptorManagement() {
  return {
    findDescriptorById(id) {
      return FileDescriptor.findOne({ _id: id }).populate('children').exec();
    },

    findAllDescriptors() {
      return FileDescriptor.find({});
    },

    // TODO
    findDescriptorByFileName(fileName) {
      return {};
    },

    // TODO
    createDescriptor({ parentId, fileName, isDir, content = '' }) {
      return FileDescriptor.create(descriptorFactory({ parentId, fileName, isDir, content }));
    },

    updateParentDescriptor(id, descriptor) {
      return FileDescriptor.findOne({ _id: id }, async (error, doc) => {

        if (error) {
          throw Error(error);
        }

        doc.children.push(descriptor);

        await doc.save();
      });
    },

    removeDescriptorById(id, parentId) {
      return FileDescriptor.findOne({ _id: parentId }, async (error, doc) => {
        if (error) {
          throw Error(error);
        }

        doc.children.filter(() => o._id !== id);

        await doc.save();

        await FileDescriptor.remove({ _id: id });
      });
    },

    // TODO
    removeAllDescriptors: () => FileDescriptor.remove({}),
  };
};

module.exports = {
  descriptorManagement,
};