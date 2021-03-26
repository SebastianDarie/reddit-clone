import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection, getCustomRepository, getManager } from 'typeorm';
import { Comment } from '../entities/Comment';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { CommentTreeRepository } from '../repositories/CommentRepository';
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

  @Query(() => Comment)
  async getComments(): Promise<Comment> {
    const repository = getManager().getTreeRepository(Comment);
    const parentComment = await Comment.findOne(27);

    return repository.findDescendantsTree(parentComment!);
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async comment(
    @Ctx() { req }: MyContext,
    @Arg('postId', () => Int) postId: number,
    @Arg('text') text: string,
    @Arg('parent', () => Int, { nullable: true }) parent: number
  ): Promise<Comment> {
    const { userId } = req.session;

    const parentComment = parent ? await Comment.findOne(parent) : undefined;

    const newComment = await Comment.create({
      creatorId: userId,
      postId,
      text,
      parent: parentComment,
    }).save();

    const childrenObj = await getManager()
      .getTreeRepository(Comment)
      .findDescendantsTree(newComment);

    newComment.children = childrenObj.children;
    return newComment;
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
  async deleteComment(@Arg('id', () => Int) id: number): Promise<boolean> {
    const commentRepository = getCustomRepository(CommentTreeRepository);
    await commentRepository.deleteComment(id);
    return true;
  }
}
