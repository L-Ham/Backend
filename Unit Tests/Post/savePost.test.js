// const User = require("../../models/user");
// const postController = require("../../controllers/postController");

// describe('savePost', () => {
//   // User exists, post is not already saved
//   it('should save the post successfully', async () => {
//     const req = {
//       userId: 'validUserId',
//       body: {
//         postId: 'validPostId'
//       }
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//     const user = {
//       savedPosts: [],
//       save: jest.fn().mockResolvedValue()
//     };

//     User.findById = jest.fn().mockResolvedValue(user);

//     await postController.savePost(req, res);

//     expect(User.findById).toHaveBeenCalledWith('validUserId');
//     expect(user.savedPosts).toContain('validPostId');
//     expect(user.save).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({ message: 'Post saved successfully' });
//   });

//   // User does not exist
//   it('should return an error message when user is not found', async () => {
//     const req = {
//       userId: 'invalidUserId',
//       body: {
//         postId: 'validPostId'
//       }
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };

//     User.findById = jest.fn().mockResolvedValue(null);

//     await postController.savePost(req, res);

//     expect(User.findById).toHaveBeenCalledWith('invalidUserId');
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
//   });

//   // Post is already saved
// it('should return an error message when the post is already saved', async () => {
//   const req = {
//       userId: 'validUserId',
//       body: {
//           postId: 'validPostId'
//       }
//       };
//       const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//       };
//       const user = {
//       savedPosts: ['validPostId'],
//       save: jest.fn()
//       };
//       User.findById = jest.fn().mockResolvedValue(user);
//       await postController.savePost(req, res);
//       expect(User.findById).toHaveBeenCalledWith('validUserId');
//       expect(user.savedPosts).toContain('validPostId');
//       expect(user.save).not.toHaveBeenCalled();
//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({ message: 'Post already saved' });

// });

//   // Error occurred while saving post
//   it('should return an error message when an error occurs while saving post', async () => {
//     const req = {
//       userId: 'validUserId',
//       body: {
//         postId: 'validPostId'
//       }
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//     const user = {
//       savedPosts: [],
//       save: jest.fn().mockRejectedValue(new Error('Database error'))
//     };

//     User.findById = jest.fn().mockResolvedValue(user);

//     await postController.savePost(req, res);

//     expect(User.findById).toHaveBeenCalledWith('validUserId');
//     expect(user.savedPosts).toContain('validPostId');
//     expect(user.save).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: 'Error saving post' });
//   });
// });
const User = require("../../models/user");
const postController = require("../../controllers/postController");

describe("savePost", () => {
  // User exists, post is not already saved
  it("should save the post successfully", async () => {
    const req = {
      userId: "validUserId",
      body: {
        postId: "validPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      savedPosts: [],
      save: jest.fn().mockResolvedValue(),
    };

    User.findById = jest.fn().mockResolvedValue(user);

    await postController.savePost(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(user.savedPosts).toContain("validPostId");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post saved successfully",
    });
  });

  // User does not exist
  it("should return an error message when user is not found", async () => {
    const req = {
      userId: "invalidUserId",
      body: {
        postId: "validPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await postController.savePost(req, res);

    expect(User.findById).toHaveBeenCalledWith("invalidUserId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // Post is already saved
  test("should return an error message when the post is already saved", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "validPostId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      savedPosts: [{ equals: jest.fn().mockReturnValue(true) }],
      save: jest.fn(),
    });

    await postController.savePost(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "This post is already saved in your profile",
    });
  });
  // Error occurred while saving post
  it("should return an error message when an error occurs while saving post", async () => {
    const req = {
      userId: "validUserId",
      body: {
        postId: "validPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      savedPosts: [],
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    };

    User.findById = jest.fn().mockResolvedValue(user);

    await postController.savePost(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(user.savedPosts).toContain("validPostId");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error saving post" });
  });
});
