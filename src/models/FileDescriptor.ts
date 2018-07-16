import {model, Schema} from 'mongoose';

const FileDescriptorSchema: Schema = new Schema({
  isDirectory: {
    required: true,
    type: Boolean,
  },
  fileSize: {
    required: false,
    type: Number,
  },
  name: {
    required: true,
    type: String,
  },
  mimeType: {
    required: false,
    type: String,
  },
  preview: {
    required: false,
    type: String,
  },
  fileKey: {
    required: false,
    type: String,
  },
  parent: {
    ref: 'FileDescriptor',
    required: false,
    type: String,
  },
  children: [
    {
      ref: 'FileDescriptor',
      required: false,
      type: String,
    },
  ],
});

FileDescriptorSchema.index({
  fileName: 1,
});

const FileDescriptor = model('FileDescriptor', FileDescriptorSchema);

export default FileDescriptor;
