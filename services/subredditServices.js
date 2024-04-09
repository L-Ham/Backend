const checkWidgetsSize = (subreddit) => {
  var length = subreddit.textWidgets.length;
  if (subreddit.rules.length > 0) {
    length += 1;
  }
  if (length >= 20) {
    return false;
  }
  return true;
};

const checkRulesSize = (subreddit) => {
  if (subreddit.rules.length >= 15) {
    return false;
  }
  return true;
};
module.exports = { checkWidgetsSize, checkRulesSize };
