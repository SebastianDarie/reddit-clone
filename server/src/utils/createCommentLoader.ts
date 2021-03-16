import DataLoader from 'dataloader';
import { getConnection } from 'typeorm';
import { Comment } from '../entities/Comment';

export const createCommentLoader = (): DataLoader<
  {
    postId: number;
  },
  Comment | null,
  {
    postId: number;
  }
> =>
  new DataLoader<{ postId: number }, Comment | null>(async (keys) => {
    let pureIds = keys.map((key) => key.postId);

    const comments = await getConnection()
      .getRepository(Comment)
      .createQueryBuilder('c')
      .where('c.postId IN (:...ids)', { ids: pureIds })
      .getMany();
    const commentIdsToComment: Record<string, Comment> = {};
    comments.forEach((comment) => {
      commentIdsToComment[`${comment.postId}`] = comment;
    });

    const sortedComments = keys.map(
      (key) => commentIdsToComment[`${key.postId}`]
    );
    console.log(sortedComments);
    return sortedComments;
  });
