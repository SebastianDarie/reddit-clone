import { ApolloCache } from '@apollo/client';
import { Flex } from '@chakra-ui/react';
import gql from 'graphql-tag';
import { BiUpvote } from 'react-icons/bi';
import {
  CommentSnippetFragment,
  MeQuery,
  useVoteMutation,
  VoteMutation,
} from '../../generated/graphql';

interface VoteSectionProps {
  comment: CommentSnippetFragment;
  meData: MeQuery | undefined;
}

export const updateAfterVote = (
  value: number,
  commentId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Comment:' + commentId,
    fragment: gql`
      fragment ___ on Comment {
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
      id: 'Comment:' + commentId,
      fragment: gql`
        fragment ____ on Comment {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

export const VoteSection: React.FC<VoteSectionProps> = ({
  comment,
  meData,
}) => {
  const [vote] = useVoteMutation();

  return (
    <Flex alignItems="center">
      <BiUpvote
        color={comment.voteStatus === 1 ? 'orangered' : undefined}
        style={{
          margin: '4px',
          cursor: 'pointer',
          pointerEvents: meData?.me ? 'auto' : 'none',
        }}
        onClick={async () => {
          await vote({
            variables: { commentId: comment.id, value: 1 },
            update: (cache) => updateAfterVote(1, comment.id, cache),
          });
        }}
      />
      {comment.points}
      <BiUpvote
        color={comment.voteStatus === -1 ? 'cornflowerblue' : undefined}
        style={{
          margin: '4px',
          transform: 'rotate(180deg)',
          cursor: 'pointer',
          pointerEvents: meData?.me ? 'auto' : 'none',
        }}
        onClick={async () => {
          await vote({
            variables: { commentId: comment.id, value: -1 },
            update: (cache) => updateAfterVote(-1, comment.id, cache),
          });
        }}
      />
    </Flex>
  );
};
