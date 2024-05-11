const { sortPosts } = require("../../services/postServices");

describe("sortPosts", () => {
  const posts = [
    { upvotes: 5, downvotes: 2, createdAt: new Date('2022-01-01'), comments: ['comment1', 'comment2'] },
    { upvotes: 3, downvotes: 1, createdAt: new Date('2022-02-01'), comments: ['comment1'] },
    { upvotes: 4, downvotes: 0, createdAt: new Date('2022-03-01'), comments: ['comment1', 'comment2', 'comment3'] },
  ];

  it("should sort posts by 'Hot'", () => {
    const sortedPosts = sortPosts(posts, 'Hot');
    expect(sortedPosts[0].upvotes - sortedPosts[0].downvotes).toBeGreaterThanOrEqual(sortedPosts[1].upvotes - sortedPosts[1].downvotes);
    expect(sortedPosts[1].upvotes - sortedPosts[1].downvotes).toBeGreaterThanOrEqual(sortedPosts[2].upvotes - sortedPosts[2].downvotes);
  });

  it("should sort posts by 'New'", () => {
    const sortedPosts = sortPosts(posts, 'New');
    expect(sortedPosts[0].createdAt.getTime()).toBeGreaterThanOrEqual(sortedPosts[1].createdAt.getTime());
    expect(sortedPosts[1].createdAt.getTime()).toBeGreaterThanOrEqual(sortedPosts[2].createdAt.getTime());
  });

  it("should sort posts by 'Top'", () => {
    const sortedPosts = sortPosts(posts, 'Top');
    expect((sortedPosts[0].upvotes - sortedPosts[0].downvotes) + sortedPosts[0].comments.length).toBeGreaterThanOrEqual((sortedPosts[1].upvotes - sortedPosts[1].downvotes) + sortedPosts[1].comments.length);
    expect((sortedPosts[1].upvotes - sortedPosts[1].downvotes) + sortedPosts[1].comments.length).toBeGreaterThanOrEqual((sortedPosts[2].upvotes - sortedPosts[2].downvotes) + sortedPosts[2].comments.length);
  });

  it("should sort posts by 'Rising'", () => {
    const sortedPosts = sortPosts(posts, 'Rising');
    expect(sortedPosts[0].comments.length).toBeGreaterThanOrEqual(sortedPosts[1].comments.length);
    expect(sortedPosts[1].comments.length).toBeGreaterThanOrEqual(sortedPosts[2].comments.length);
  });


});