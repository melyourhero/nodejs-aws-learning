import {Descriptor, Upload} from './AWSDescriptorManagement';

// TODO: add more methods and refact return type
interface DescriptorManagementService {
  findDescriptorById: (id: string | null) => Promise<any>;
  createNewFileDescriptor: (parent: Descriptor | null, mimeType: string, upload: Upload) => Promise<any>;
}

export default DescriptorManagementService;
