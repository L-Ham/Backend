const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/**
 * Represents the schema for a user in the application.
 * @typedef {Object} UserSchema
 * @property {string} userName - The username of the user. Required and unique.
 * @property {boolean} signupGoogle - Indicates whether the user signed up using Google. Required.
 * @property {string} name - The name of the user. Optional.
 * @property {string} gender - The gender of the user. Optional.
 * @property {string} password - The password of the user. Required.
 * @property {number[]} friends - An array of user IDs representing the user's friends. Optional.
 * @property {string} email - The email address of the user. Required and unique.
 * @property {string} avatar - The URL of the user's avatar image. Optional.
 * @property {Schema.Types.ObjectId[]} posts - An array of post IDs representing the user's posts. Optional.
 * @property {Schema.Types.ObjectId[]} comments - An array of comment IDs representing the user's comments. Optional.
 * @property {mongoose.Schema.Types.ObjectId[]} postHistory - An array of post IDs representing the user's post history. Optional.
 * @property {mongoose.Schema.Types.ObjectId[]} savedPosts - An array of post IDs representing the user's saved posts. Optional.
 * @property {mongoose.Schema.Types.ObjectId[]} hidePosts - An array of post IDs representing the user's hidden posts. Optional.
 * @property {mongoose.Schema.Types.ObjectId[]} upvotedPosts - An array of post IDs representing the user's upvoted posts. Optional.
 * @property {mongoose.Schema.Types.ObjectId[]} downvotedPosts - An array of post IDs representing the user's downvoted posts. Optional.
 * @property {Object[]} socialLinks - An array of social links associated with the user.
 * @property {string} socialLinks.linkOrUsername - The link or username associated with the social link. Required and unique.
 * @property {string} socialLinks.appName - The name of the social media application. Required.
 * @property {string} socialLinks.logo - The URL of the logo for the social media application. Required.
 * @property {string} socialLinks.displayText - The display text for the social link. Optional.
 * @property {string} bannerImage - The URL of the user's banner image. Optional.
 * @property {Map<boolean>} notificationSettings - The notification settings for the user.
 * @property {boolean} notificationSettings.inboxMessage - Indicates whether inbox messages are enabled.
 * @property {boolean} notificationSettings.chatMessages - Indicates whether chat messages are enabled.
 * @property {boolean} notificationSettings.chatRequest - Indicates whether chat requests are enabled.
 * @property {boolean} notificationSettings.mentions - Indicates whether mentions are enabled.
 * @property {boolean} notificationSettings.comments - Indicates whether comments are enabled.
 * @property {boolean} notificationSettings.upvotesToPosts - Indicates whether upvotes to posts are enabled.
 * @property {boolean} notificationSettings.upvotesToComments - Indicates whether upvotes to comments are enabled.
 * @property {boolean} notificationSettings.repliesToComments - Indicates whether replies to comments are enabled.
 * @property {boolean} notificationSettings.newFollowers - Indicates whether new followers notifications are enabled.
 * @property {boolean} notificationSettings.modNotifications - Indicates whether moderator notifications are enabled.
 * @property {Map<any>} profileSettings - The profile settings for the user.
 * @property {string} profileSettings.displayName - The display name for the user's profile.
 * @property {string} profileSettings.about - The about section for the user's profile.
 * @property {string} profileSettings.avatarImage - The URL of the user's avatar image for the profile.
 * @property {string} profileSettings.bannerImage - The URL of the user's banner image for the profile.
 * @property {boolean} profileSettings.NSFW - Indicates whether NSFW content is allowed.
 * @property {boolean} profileSettings.allowFollow - Indicates whether other users can follow the user.
 * @property {boolean} profileSettings.contentVisibility - Indicates whether the user's content is visible.
 * @property {boolean} profileSettings.communitiesVisibility - Indicates whether the user's communities are visible.
 * @property {boolean} profileSettings.clearHistory - Indicates whether the user's history should be cleared.
 * @property {Schema.Types.ObjectId[]} followers - An array of user IDs representing the user's followers. Optional.
 * @property {Schema.Types.ObjectId[]} following - An array of user IDs representing the users the user is following. Optional.
 * @property {Schema.Types.ObjectId[]} blockUsers - An array of user IDs representing the users the user has blocked. Optional.
 * @property {Schema.Types.ObjectId[]} muteCommunities - An array of community IDs representing the communities the user has muted. Optional.
 * @property {Map<any>} feedSettings - The feed settings for the user.
 * @property {boolean} feedSettings.showNSFW - Indicates whether NSFW content should be shown in the feed.
 * @property {boolean} feedSettings.blurNSFW - Indicates whether NSFW content should be blurred in the feed.
 * @property {boolean} feedSettings.enableHomeFeedRecommendations - Indicates whether home feed recommendations are enabled.
 * @property {boolean} feedSettings.autoplayMedia - Indicates whether media should autoplay in the feed.
 * @property {boolean} feedSettings.reduceAnimations - Indicates whether animations should be reduced in the feed.
 * @property {boolean} feedSettings.communityThemes - Indicates whether community themes are enabled in the feed.
 * @property {string} feedSettings.communityContentSort - The sort order for community content in the feed.
 * @property {boolean} feedSettings.rememberPerCommunity - Indicates whether feed settings should be remembered per community.
 * @property {string} feedSettings.globalContentView - The view mode for global content in the feed.
 * @property {boolean} feedSettings.openPostsInNewTab - Indicates whether posts should be opened in a new tab.
 * @property {boolean} feedSettings.defaultToMarkdown - Indicates whether markdown should be the default editor mode.
 * @property {Schema.Types.ObjectId[]} communities - An array of community IDs representing the communities the user is a member of.
 */
const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  signupGoogle: {
    type: Boolean,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  friends: {
    type: [Number],
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: false,
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment",
      required: false,
    },
  ],
  postHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  ],
  hidePosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  ],
  upvotedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  ],
  downvotedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  ],
  upvotedComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      required: false,
    },
  ],
  downvotedComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      required: false,
    },
  ],
  socialLinks: [
    {
      linkOrUsername: {
        type: String,
        required: true,
        unique: true,
      },
      appName: {
        type: String,
        required: true,
      },
      displayText: {
        type: String,
        required: false,
      },
    },
  ],
  avatarImage: {
    type: Schema.Types.ObjectId,
    ref: "userUploads",
    required: false,
    default: null,
  },
  bannerImage: {
    type: Schema.Types.ObjectId,
    ref: "userUploads",
    required: false,
    default: null,
  },
  notificationSettings: {
    type: Map,
    of: Boolean,
    required: true,
    default: {
      inboxMessage: true,
      chatMessages: true,
      chatRequest: true,
      mentions: true,
      comments: true,
      upvotesToPosts: true,
      upvotesToComments: true,
      repliesToComments: true,
      newFollowers: true,
      modNotifications: true,
    },
  },
  profileSettings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
    default: {
      displayName: "",
      about: "",
      avatarImage: "",
      bannerImage: "",
      NSFW: false,
      allowFollow: true,
      contentVisibility: true,
      communitiesVisibility: true,
      clearHistory: false,
    },
  },
  followers: {
    type: [{ type: Schema.Types.ObjectId, ref: "user" }],
    required: false,
  },
  following: {
    type: [{ type: Schema.Types.ObjectId, ref: "user" }],
    required: false,
  },
  blockUsers: [
    {
      blockedUserId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: false,
      },
      blockedUserName: {
        type: String,
        required: false,
      },
      blockedUserAvatar: {
        type: Schema.Types.ObjectId,
        ref: "userUploads",
        required: false,
      },
      blockedAt: {
        type: Date,
        required: false,
      },
    },
  ],
  muteCommunities: [
    {
     mutedCommunityId: {
        type: Schema.Types.ObjectId,
        ref: "subReddit",
        required: false,
      },
      mutedCommunityName: {
        type: String,
        required: false,
      },
      mutedCommunityAvatar: {
        type: Schema.Types.ObjectId,
        ref: "userUploads",
        required: false,
      },
      mutedAt: {
        type: Date,
        required: false,
      },
    },
  ],
  feedSettings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
    default: {
      showNSFW: true,
      blurNSFW: true,
      enableHomeFeedRecommendations: true,
      autoplayMedia: true,
      reduceAnimations: true,
      communityThemes: true,
      communityContentSort: "Hot",
      rememberPerCommunity: true,
      globalContentView: "Card",
      openPostsInNewTab: true,
      defaultToMarkdown: true,
    },
  },
  communities: {
    type: [Schema.Types.ObjectId],
    ref: "subReddit",
  },
  reportedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  favoriteCommunities: [
    {
      type: Schema.Types.ObjectId,
      ref: "subReddit",
    },
  ],
  moderates: [
    {
      type: Schema.Types.ObjectId,
      ref: "subReddit",
      required: false,
    },
  ],
  location: {
    type: String,
    required: false,
    default: "Location is not specified",
  },
  emailSettings: {
    type: Map,
    of: Boolean,
    required: true,
    default: {
      privateMessages: true,
      chatRequests: true,
      newUserWelcome: true,
      commentOnPost: true,
      repliesToComments: true,
      upvotesOnPosts: true,
      upvotesOnComments: true,
      usernameMentions: true,
      newFollowers: true,
      unsubscribeFromEmail: false,
    },
  },
});

module.exports = mongoose.model("user", userSchema);
