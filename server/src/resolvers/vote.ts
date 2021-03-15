import { getConnection } from 'typeorm';
import { CommentUpvote } from '../entities/CommentUpvote';
import { Upvote } from '../entities/Upvote';

export const submitVote = async (
  postId: number | null,
  commentId: number | null,
  userId: number,
  realValue: number
): Promise<boolean> => {
  const typeId = postId ? postId : commentId;
  const upvote = postId
    ? await Upvote.findOne({ where: { postId, userId } })
    : await CommentUpvote.findOne({
        where: { commentId, userId },
      });

  if (upvote && upvote.value !== realValue) {
    await getConnection().transaction(async (tm) => {
      await tm.query(
        `
        update ${postId ? 'upvote' : 'comment_upvote'} 
        set value = $1
        where "${postId ? 'postId' : 'commentId'}" = $2 and "userId" = $3
        `,
        [realValue, typeId, userId]
      );

      await tm.query(
        `
        update ${postId ? 'post' : 'comment'} 
        set points = points + ${upvote.value !== 0 ? 2 * realValue : realValue}
        where id = $1;
        `,
        [typeId]
      );
    });
  } else if (upvote && upvote.value === realValue) {
    await getConnection().transaction(async (tm) => {
      await tm.query(
        `
      update ${postId ? 'upvote' : 'comment_upvote'} 
      set value = 0
      where "${postId ? 'postId' : 'commentId'}" = $1 and "userId" = $2
      `,
        [typeId, userId]
      );

      await tm.query(
        `
        update ${postId ? 'post' : 'comment'} 
        set points = points - $1
        where id = $2;
        `,
        [realValue, typeId]
      );
    });
  } else {
    await getConnection().transaction(async (tm) => {
      await tm.query(
        `
        insert into ${postId ? 'upvote' : 'comment_upvote'} ("userId", "${
          postId ? 'postId' : 'commentId'
        }", value)
        values($1, $2, $3)
        `,
        [userId, typeId, realValue]
      );

      await tm.query(
        `
        update ${postId ? 'post' : 'comment'}  
        set points = points + $1
        where id = $2;
        `,
        [realValue, typeId]
      );
    });
  }

  return true;
};
