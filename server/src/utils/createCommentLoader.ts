import DataLoader from 'dataloader';
import { Comment } from '../entities/Comment';

export const createCommentLoader = (): DataLoader<
  {
    commentId: number;
    postId: number;
  },
  Comment,
  {
    commentId: number;
    postId: number;
  }
> =>
  new DataLoader<{ commentId: number; postId: number }, Comment>(
    async (keys) => {
      console.log(typeof keys, keys);
      const comments = await Comment.findByIds(keys as any);
      console.log(comments);
      const commentIdsToComment: Record<string, Comment> = {};
      comments.forEach((comment) => {
        commentIdsToComment[`${comment.postId}`] = comment;
      });

      return keys.map((key) => commentIdsToComment[`${key.postId}`]);
    }
  );
