//import {useState} from 'react'
import { Flex } from '@chakra-ui/react';
import { BiUpvote } from 'react-icons/bi';
import {
  CommentSnippetFragment,
  useVoteMutation,
} from '../../generated/graphql';
import { updateAfterVote } from '../../utils/updateAfterVote';

interface VoteSectionProps {
  comment: CommentSnippetFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ comment }) => {
  // const [loadingState, setLoadingState] = useState<
  //   'upvote-loading' | 'downvote-loading' | 'not-loading'
  // >('not-loading');
  const [vote] = useVoteMutation();

  return (
    <Flex alignItems="center">
      <BiUpvote
        color={comment.voteStatus === 1 ? 'orangered' : undefined}
        style={{ margin: '4px', cursor: 'pointer' }}
        //isLoading={loadingState === 'upvote-loading'}
        onClick={async () => {
          //setLoadingState('upvote-loading');
          await vote({
            variables: { commentId: comment.id, value: 1 },
            update: (cache) => updateAfterVote(1, cache, comment.id),
          });
          // setLoadingState('not-loading');
        }}
      />
      {comment.points}
      <BiUpvote
        color={comment.voteStatus === -1 ? 'cornflowerblue' : undefined}
        style={{
          margin: '4px',
          transform: 'rotate(180deg)',
          cursor: 'pointer',
        }}
        onClick={async () => {
          //setLoadingState('downvote-loading');
          await vote({
            variables: { commentId: comment.id, value: -1 },
            update: (cache) => updateAfterVote(-1, cache, comment.id),
          });
          // setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};
