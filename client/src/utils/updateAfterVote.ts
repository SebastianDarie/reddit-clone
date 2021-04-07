import { ApolloCache } from '@apollo/client';
import gql from 'graphql-tag';
import { VoteMutation } from '../generated/graphql';

export const updateAfterVote = (
  value: number,
  cache: ApolloCache<VoteMutation>,
  postId: number
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
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
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,

      data: { points: newPoints, voteStatus: value },
    });
  }
};
