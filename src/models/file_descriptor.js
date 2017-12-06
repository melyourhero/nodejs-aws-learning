const mongoose = require('mongoose');

const fileDescriptorSchema = mongoose.Schema({
  isDir: Boolean,
  fileName: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  content: {
    type: String,
    // unique: true,
    // required: true,
  },
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
