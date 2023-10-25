import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

//export interface PostOptions {
//  backgroundColor?: string;
//}

export interface TagDoc extends BaseDoc {
  name: string;
}

export interface TaggedPostDoc extends BaseDoc {
  tag_id: ObjectId;
  post_id: ObjectId;
  author: ObjectId;
  is_private: boolean;
}

export default class TagConcept {
  public readonly tags = new DocCollection<TagDoc>("tags");
  public readonly tagged = new DocCollection<TaggedPostDoc>("tagged");

  async create(name: string) {
    if (name == "") {
      throw new NotFoundError(`Tag name cannot be empty!`);
    }
    const tag_id = await this.getTagIDByName(name);
    if (tag_id) {
      throw new NotFoundError(`Tag already exists!`);
    }
    const _id = await this.tags.createOne({ name });
    return { msg: "Tag successfully created!", post: await this.tags.readOne({ _id }) };
  }

  async addTagToPost(post_id: ObjectId, tag_name: string, author: ObjectId, is_private: boolean) {
    let tag_id = await this.getTagIDByName(tag_name);
    if (!tag_id) {
      await this.create(tag_name);
      tag_id = await this.getTagIDByName(tag_name);
      if (tag_id) {
        await this.tagged.createOne({ tag_id, post_id, author, is_private }); // should always enter this
      }
      if (is_private) {
        return { msg: "New private tag successfully added to post!" };
      } else {
        return { msg: "New public tag successfully added to post!" };
      }
    } else {
      await this.tagged.createOne({ tag_id, post_id, author, is_private });
    }
    if (is_private) {
      return { msg: "Private tag successfully added to post!" };
    } else {
      return { msg: "Public tag successfully added to post!" };
    }
  }

  async getTagIDByName(tag_name: string) {
    const tag = await this.tags.readOne({ name: tag_name });
    if (!tag) {
      return tag;
    }
    return tag._id;
  }

  async getTags(query: Filter<TagDoc>) {
    const posts = await this.tags.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    //await this.tags.deleteMany({});
    //await this.tagged.deleteMany({});
    return posts;
  }

  async getById(_id: ObjectId) {
    const tag = await this.tags.readOne({ _id });
    if (!tag) {
      throw new NotFoundError(`Tag ${_id} does not exist!`);
    }
    return tag;
  }

  //async getTags(query: Filter<TagDoc>) {
  //  const tags = await this.tags.readMany(query, {
  //    sort: { dateUpdated: -1 },
  //  });
  //  return tags;
  //}

  async removeTaggedByAuthor(user: ObjectId, tag_name: string, post_id: ObjectId) {
    const tag_id = await this.getTagIDByName(tag_name);
    if (!tag_id) {
      throw new NotFoundError(`Tag ${tag_name} does not exist!`);
    }
    const tag_assigns = await this.tagged.readMany({ tag_id, post_id, author: user });
    if (tag_assigns.length === 0) {
      throw new NotFoundError(`Tag ${tag_name} does not exist on this post!`);
      //throw new NotFoundError(`Tag ${tag_id} on post ${post_id} does not exist, or you are not the author of this tag assignment!`);
    }
    for (const tag_assign of tag_assigns) {
      return await this.remove(tag_assign._id);
    }
  }

  async remove(_id: ObjectId) {
    await this.tagged.deleteOne({ _id });
    return { msg: "Tag successfully removed from post!" };
  }

  async getTaggedPostsByTagName(tag_name: string, user?: ObjectId, is_private?: boolean) {
    if (!tag_name || tag_name == "") {
      throw new NotFoundError(`Tag name cannot be empty!`);
    }
    const tag_id = await this.getTagIDByName(tag_name);
    if (!tag_id) {
      throw new NotFoundError(`Tag ${tag_name} does not exist!`);
    } else if (user && is_private) {
      return await this.getTaggedPosts({ tag_id, author: user, is_private: true });
    } else {
      return await this.getTaggedPosts({ tag_id, is_private: false });
    }
  }

  async getTaggedPosts(query: Filter<TaggedPostDoc>) {
    // temporarily implementing a version that works for searching up just one tag
    //return await this.getTags({ tag });
    const tagged_posts = await this.tagged.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return tagged_posts;
  }
}

export class AuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly tag_id: ObjectId,
    public readonly post_id: ObjectId,
  ) {
    super("{0} is not the author of tag assignment from tag {1} to post {2}!", author, tag_id, post_id);
  }
}
