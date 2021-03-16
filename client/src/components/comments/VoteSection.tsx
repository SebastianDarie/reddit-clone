//import {useState} from 'react'
import { Box, Flex } from '@chakra-ui/react';
import { BiUpvote } from 'react-icons/bi';
import {
  CommentSnippetFragment,
  useVoteMutation,
} from '../../generated/graphql';

interface VoteSectionProps {
  comment: CommentSnippetFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ comment }) => {
  // const [loadingState, setLoadingState] = useState<
  //   'upvote-loading' | 'downvote-loading' | 'not-loading'
  // >('not-loading');
  const [vote] = useVoteMutation();

  return (
    <Flex alignItems="center" mt={2}>
      <BiUpvote
        color={comment.voteStatus === 1 ? 'orange' : undefined}
        //isLoading={loadingState === 'upvote-loading'}
        onClick={async () => {
          //setLoadingState('upvote-loading');
          await vote({
            variables: { commentId: comment.id, value: 1 },
            //update: (cache) => updateAfterVote(1, comment.id, cache),
          });
          // setLoadingState('not-loading');
        }}
      />
      {comment.points}
      <BiUpvote
        color={comment.voteStatus === -1 ? 'blue' : undefined}
        transform="rotate(360deg)"
        onClick={async () => {
          //setLoadingState('downvote-loading');
          await vote({
            variables: { postId: comment.id, value: -1 },
            //update: (cache) => updateAfterVote(-1, comment.id, cache),
          });
          // setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};
