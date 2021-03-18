import { ApolloCache } from '@apollo/client';
import gql from 'graphql-tag';
import { VoteMutation } from '../generated/graphql';

export const updateAfterVote = (
  value: number,
  cache: ApolloCache<VoteMutation>,
  postId?: number,
  commentId?: number
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: postId ? 'Post:' + postId : 'Comment:' + commentId,
    fragment: postId
      ? gql`
          fragment _ on Post {
            id
            points
            voteStatus
          }
        `
      : gql`
          fragment _ on Comment {
            id
            points
            voteStatus
          }
        `,
  });

  if (data) {
    let newPoints;
    if (data.voteStatus === value) {
      newPoints = data.points - value;
      value = 0;
    } else {
      newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;
    }
    cache.writeFragment({
      id: postId ? 'Post:' + postId : 'Comment:' + commentId,
      fragment: postId
        ? gql`
            fragment __ on Post {
              points
              voteStatus
            }
          `
        : gql`
            fragment __ on Comment {
              points
              voteStatus
            }
          `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};
