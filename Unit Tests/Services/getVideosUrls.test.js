const UserUploadModel = require("../../models/userUploads");
const postServices = require("../../services/postServices");

jest.mock("../../models/userUploads");

describe("getVideosUrls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return video urls", async () => {
    const videos = ["video1", "video2"];
    const urls = ["url1", "url2"];
  
    const selectMock = jest.fn();
  
    UserUploadModel.findById.mockImplementation((video) => {
      selectMock.mockResolvedValue({ url: urls[videos.indexOf(video)] });
      return { select: selectMock };
    });
  
    const result = await postServices.getVideosUrls(videos);
  
    expect(result).toEqual(urls);
    videos.forEach((video, index) => {
      expect(UserUploadModel.findById).toHaveBeenCalledWith(video);
      expect(selectMock).toHaveBeenCalledWith("url");
    });
  });

  it("should handle no videos", async () => {
    const videos = [];

    const result = await postServices.getVideosUrls(videos);

    expect(result).toEqual([]);
    expect(UserUploadModel.findById).not.toHaveBeenCalled();
  });
});