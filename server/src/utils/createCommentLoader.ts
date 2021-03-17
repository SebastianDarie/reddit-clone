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
    // let pureIds = keys.map((key) => key.postId);

    // const comments = await getConnection()
    //   .getRepository(Comment)
    //   .createQueryBuilder('c')
    //   .where('c.postId IN (:...ids)', { ids: pureIds })
    //   .orderBy('c.points')
    //   .getMany();
    // console.log(typeof comments);
    // const commentIdsToComment: Record<string, Comment> = {};
    // comments.forEach((comment) => {
    //   pureIds.forEach(id => {
    //   commentIdsToComment[`${comment.postId}`] = comment;

    //   })
    //   console.log(commentIdsToComment[`${comment.postId}`]);
    // });
    //console.log(comments);

    // const arr = keys
    //   .filter((key) => commentIdsToComment[`${key.postId}`])
    //   .map((el) => el.postId);
    // const array = comments.filter(
    //   (comment) => commentIdsToComment[`${keys.map((key) => key.postId)}`]
    // );
    // console.log(array);
    // const sortedComments = comments.map((c) => {
    //   console.log(c, comments);
    //   return keys.map((key) => commentIdsToComment[`${key.postId}`]);
    // });
    //console.log(sortedComments);
    //return comments;

    return Promise.all(
      keys.map((key) => {
        return Comment.find({ where: { postId: key.postId } });
        // return getConnection()
        //   .getRepository(Comment)
        //   .createQueryBuilder('c')
        //   .where('c.postId IN (:...ids)', { ids: pureIds })
        //   .orderBy('c.points');
      })
    );
  });
