const { checkWidgetsSize } = require("../../services/subredditServices");

describe("checkWidgetsSize", () => {
  it("should return true when the total length of textWidgets and rules (if any) is less than 20", () => {
    const subreddit = {
      textWidgets: new Array(10),
      rules: new Array(5)
    };
    expect(checkWidgetsSize(subreddit)).toBe(true);
  });

  it("should return false when the total length of textWidgets and rules (if any) is equal to 20", () => {
    const subreddit = {
      textWidgets: new Array(19),
      rules: new Array(1)
    };
    expect(checkWidgetsSize(subreddit)).toBe(false);
  });

  it("should return false when the total length of textWidgets and rules (if any) is more than 20", () => {
    const subreddit = {
      textWidgets: new Array(20),
      rules: new Array(1)
    };
    expect(checkWidgetsSize(subreddit)).toBe(false);
  });

  it("should return true when there are no rules and the length of textWidgets is less than 20", () => {
    const subreddit = {
      textWidgets: new Array(19),
      rules: []
    };
    expect(checkWidgetsSize(subreddit)).toBe(true);
  });
});