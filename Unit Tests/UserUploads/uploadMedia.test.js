const UserUpload = require("../../models/userUploads");
const cloudinary = require("../../middleware/cloudinary");
const userUploadsController = require("../../controllers/userUploadsController");

jest.mock("../../models/userUploads", () => ({
  create: jest.fn(),
}));

jest.mock("../../middleware/cloudinary", () => ({
  uploader: {
    upload: jest.fn(),
  },
}));

describe('uploadMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload media successfully', async () => {
    const file = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
    };
    const secure_url = 'http://example.com/test.jpg';
    cloudinary.uploader.upload.mockResolvedValueOnce({ secure_url });
    const newUserUpload = {
      _id: 'upload123',
      originalname: file.originalname,
      mimetype: file.mimetype,
      url: secure_url,
    };
    UserUpload.create.mockResolvedValueOnce(newUserUpload);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const result = await userUploadsController.uploadMedia(file, res);

    expect(cloudinary.uploader.upload).toHaveBeenCalled();
    expect(UserUpload.create).toHaveBeenCalledWith({
      originalname: file.originalname,
      mimetype: file.mimetype,
      url: secure_url,
    });
    expect(result).toEqual(newUserUpload._id);
  });
  it('should handle error if upload fails', async () => {
    const file = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
    };
    const errorMessage = 'Upload error';
    cloudinary.uploader.upload.mockRejectedValueOnce(new Error(errorMessage));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    try {
      await userUploadsController.uploadMedia(file, res);
    } catch (error) {
      expect(cloudinary.uploader.upload).toHaveBeenCalled();
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(errorMessage);
    }
});

  
  
});