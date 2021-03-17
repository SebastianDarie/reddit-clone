import DataLoader from 'dataloader';
import { CommentUpvote } from '../entities/CommentUpvote';

export const createCommentUpvoteLoader = (): DataLoader<
  {
    commentId: number;
    userId: number;
  },
  CommentUpvote | null,
  {
    commentId: number;
    userId: number;
  }
> =>
  new DataLoader<{ commentId: number; userId: number }, CommentUpvote | null>(
    async (keys) => {
      const upvotes = await CommentUpvote.findByIds(keys as any);
      const upvoteIdsToUpvote: Record<string, CommentUpvote> = {};
      upvotes.forEach((upvote) => {
        upvoteIdsToUpvote[`${upvote.userId}|${upvote.commentId}`] = upvote;
      });

      return keys.map(
        (key) => upvoteIdsToUpvote[`${key.userId}|${key.commentId}`]
      );
    }
  );
