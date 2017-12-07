const mongoose = require('mongoose');

const fileDescriptorSchema = mongoose.Schema({
  isDir: Boolean,
  fileName: {
    type: String,
    required: true,
  },
  link: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileDescriptor',
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileDescriptor',
  }]
});


const FileDescriptor = mongoose.model('FileDescriptor', fileDescriptorSchema);

module.exports = FileDescriptor;
