const { checkRulesSize } = require("../../services/subredditServices");

describe("checkRulesSize", () => {
  it("should return true when rules array length is less than 15", () => {
    const subreddit = { rules: new Array(14) };
    expect(checkRulesSize(subreddit)).toBe(true);
  });

  it("should return false when rules array length is 15 or more", () => {
    const subreddit = { rules: new Array(15) };
    expect(checkRulesSize(subreddit)).toBe(false);
  });
});