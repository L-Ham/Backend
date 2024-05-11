const UserUploadModel = require("../../models/userUploads");
const postServices = require("../../services/postServices");

jest.mock("../../models/userUploads");

describe("getImagesUrls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return image urls", async () => {
    const images = ["image1", "image2"];
    const urls = ["url1", "url2"];
  
    const selectMock = jest.fn();
  
    UserUploadModel.findById.mockImplementation((image) => {
      selectMock.mockResolvedValue({ url: urls[images.indexOf(image)] });
      return { select: selectMock };
    });
  
    const result = await postServices.getImagesUrls(images);
  
    expect(result).toEqual(urls);
    images.forEach((image, index) => {
      expect(UserUploadModel.findById).toHaveBeenCalledWith(image);
      expect(selectMock).toHaveBeenCalledWith("url");
    });
  });

  it("should handle no images", async () => {
    const images = [];

    const result = await postServices.getImagesUrls(images);

    expect(result).toEqual([]);
    expect(UserUploadModel.findById).not.toHaveBeenCalled();
  });
});