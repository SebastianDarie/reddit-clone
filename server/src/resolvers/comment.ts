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
import { getConnection, getManager, InsertResult } from 'typeorm';
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

  @Query(() => [Comment])
  async getComments(): Promise<Comment[]> {
    // const comments = await getConnection().query(`
    //   with recursive CommentTree (id, postId, parentCommentId,  creator, text, treeDepth) as (
    //     select *, 0 as depth from comment
    //     where "parentCommentId" is null
    //     union all
    //     select c.*, ct.treeDepth+1 as depth from CommentTree ct
    //     join comment c on (ct.id::integer = c."parentCommentId")
    //   )
    //   select * from CommentTree where postId = 639
    // `);

    return getManager().getTreeRepository(Comment).findTrees();
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

    const parentComment = await Comment.findOne(parent);

    return Comment.create({
      creatorId: userId,
      postId,
      text,
      parent: parentComment,
    }).save();

    //return getConnection().createQueryBuilder().insert().into('comment_closure').values({id_ancestor: newComment.id,id_descendant: newComment.id}).execute()

    // return await getConnection().query(
    //   `
    // insert into comment_closure (id_ancestor, id_descendant)
    // select id_ancestor, ${newComment.id} from comment_closure
    // where id_descendant = ${descendant || newComment.id}
    // union all select ${newComment.id}, ${newComment.id}
    // `
    //   //[newComment.id]
    // );
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
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from('comment_closure')
      .where('id_ancestor = :id', { id })
      .orWhere('id_descendant = :id', { id })
      .execute();

    await Comment.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
