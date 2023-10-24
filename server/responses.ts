import { Post, Tag, User } from "./app";
import { FeatureDoc } from "./concepts/feature";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friend";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/post";
import { SaveDoc } from "./concepts/savour";
import { TagDoc, TaggedPostDoc } from "./concepts/tag";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    const author = await User.getUserById(post.author);
    return { ...post, author: author.username };
  }

  static async features(features: FeatureDoc[] | null) {
    if (!features) {
      return features;
    }
    const featured_posts: PostDoc[] = [];
    for (const feature of features) {
      featured_posts.push(await Post.getById(feature.post_id));
    }
    const authors = await User.idsToUsernames(featured_posts.map((post) => post.author));
    return featured_posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

  static async saves(saves: SaveDoc[] | null) {
    if (!saves) {
      return saves;
    }
    const saved_posts: PostDoc[] = [];
    for (const save of saves) {
      saved_posts.push(await Post.getById(save.source_post_id));
    }
    const authors = await User.idsToUsernames(saved_posts.map((post) => post.author));
    return saved_posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

  static async tags(tags: TagDoc[] | null) {
    if (!tags) {
      return tags;
    }
    const return_tags: TagDoc[] = [];
    for (const tag of tags) {
      return_tags.push(await Tag.getById(tag._id));
    }
    return return_tags.map((tag) => ({ ...tag, name: tag.name }));
  }

  static async tagged(tagged: TaggedPostDoc[] | null) {
    if (!tagged) {
      return tagged;
    }
    const return_posts: PostDoc[] = [];
    for (const tagged_post of tagged) {
      return_posts.push(await Post.getById(tagged_post.post_id));
    }
    const authors = await User.idsToUsernames(return_posts.map((post) => post.author));
    return return_posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc[]) {
    const authors = await User.idsToUsernames(posts.map((post) => post.author));
    return posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await User.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});
