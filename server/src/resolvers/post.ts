import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import S3 from 'aws-sdk/clients/s3';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { submitVote } from './vote';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
  @Field()
  image: string;
  @Field()
  link: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@ObjectType()
class S3Payload {
  @Field()
  signedRequest: string;
  @Field()
  url: string;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post): string {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => String)
  linkSnippet(@Root() root: Post): string {
    if (!root.link) {
      return '';
    }

    let result = root.link.match(
      /^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/i
    );

    if (result) return result[6] + result[8].slice(0, 8) + '...';
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext): Promise<User> {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, upvoteLoader }: MyContext
  ): Promise<number | null> {
    if (!req.session.userId) {
      return null;
    }

    const upvote = await upvoteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return upvote ? upvote.value : null;
  }

  // @FieldResolver(() => [Comment])
  // async comments(
  //   @Root() post: Post,
  //   @Ctx() { commentLoader }: MyContext
  // ): Promise<Comment | null> {
  //   const comment = await commentLoader.load({ postId: post.id });
  //   return comment ? comment : null;
  // }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    // const replacements: (Date | number)[] = [realLimitPlusOne];

    // if (cursor) {
    //   replacements.push(new Date(parseInt(cursor)));
    // }

    // const posts = await getConnection().query(
    //   `
    // select p.*
    // from post p
    // ${cursor ? `where p."createdAt" < $2` : ''}
    // order by p."createdAt" DESC
    // limit $1
    // `,
    //   replacements
    // );

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.comments', 'c', 'c."postId" = p.id')
      //.leftJoinAndSelect('c.creator', 'creator')
      .orderBy('p.createdAt', 'DESC')
      .take(realLimitPlusOne);

    if (cursor) {
      qb.where('p."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ['comments'] });
  }

  @Mutation(() => S3Payload)
  @UseMiddleware(isAuth)
  async signS3(
    @Arg('filename') filename: string,
    @Arg('filetype') filetype: string
  ): Promise<S3Payload> {
    const s3 = new S3({
      signatureVersion: 'v4',
      region: 'us-east-1',
    });

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Expires: 60,
      ContentType: filetype,
      ACL: 'public-read',
    };

    const signedRequest = await s3.getSignedUrl('putObject', s3Params);
    const url = `https://${process.env.CF_DOMAIN_NAME}/${filename}`;

    return {
      signedRequest,
      url,
    };
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Arg('image') image: string,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    if (image !== '') {
      const path = image.slice(37, image.length);

      const s3 = new S3({
        signatureVersion: 'v4',
        region: 'us-east-1',
      });

      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: path,
      };

      await s3.deleteObject(s3Params).promise();
    }
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int, { nullable: true }) postId: number | null,
    @Arg('commentId', () => Int, { nullable: true }) commentId: number | null,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    const { userId } = req.session;

    return submitVote(postId, commentId, userId, realValue);
  }
}
