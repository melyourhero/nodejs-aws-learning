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

    findDescriptorByFileName(fileName) {
      return FileDescriptor.findOne({ fileName });
    },

    // TODO
    createDescriptor({ parentId, fileName, isDir, content = '' }) {
      return FileDescriptor.create(descriptorFactory({ parentId, fileName, isDir, content }));
    },

    updateParentDescriptor(id, descriptor) {
      const query = { $push: { children: descriptor } };

      return FileDescriptor.findByIdAndUpdate(id, query);
    },

    removeDescriptorById(id) {
      return FileDescriptor.findById(id, async (error, doc) => {
        if (error) {
          throw Error(error);
        }

        const query = { $pull: { children: id } };

        await FileDescriptor.findByIdAndUpdate(doc.parent, query);

        await doc.remove();
      });
    },

    // TODO
    removeAllDescriptors: () => FileDescriptor.remove({}),
  };
};

module.exports = {
  descriptorManagement,
};