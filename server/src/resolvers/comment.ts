import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Comment } from '../entities/Comment';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@Resolver(Comment)
export class CommentResolver {
  @FieldResolver(() => User)
  creator(
    @Root() comment: Comment,
    @Ctx() { userLoader }: MyContext
  ): Promise<User> {
    return userLoader.load(comment.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() comment: Comment,
    @Ctx() { req, commentUpvoteLoader }: MyContext
  ): Promise<number | null> {
    if (!req.session.userId) {
      return null;
    }

    const commentUpvote = await commentUpvoteLoader.load({
      commentId: comment.id,
      userId: req.session.userId,
    });

    return commentUpvote ? commentUpvote.value : null;
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async comment(
    @Arg('postId', () => Int) postId: number,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
    const { userId } = req.session;

    return Comment.create({ creatorId: userId, postId, text }).save();
  }

  @Mutation(() => Comment, { nullable: true })
  async updateComment(
    @Arg('id', () => Int) id: number,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Comment)
      .set({ text })
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
  async deleteComment(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Comment.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
