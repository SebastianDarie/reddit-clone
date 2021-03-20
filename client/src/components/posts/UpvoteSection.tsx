import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import {
  MeQuery,
  PostSnippetFragment,
  useVoteMutation,
} from '../../generated/graphql';
import { updateAfterVote } from '../../utils/updateAfterVote';

interface UpvoteSectionProps {
  post: PostSnippetFragment;
  meData?: MeQuery | undefined;
  row?: boolean;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({
  post,
  meData,
  row = false,
}) => {
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [vote] = useVoteMutation();

  return (
    <Flex direction={row ? 'row' : 'column'} alignItems="center" mr={4}>
      <IconButton
        aria-label="upvote"
        colorScheme={post.voteStatus === 1 ? 'orange' : undefined}
        mr={row ? '8px' : undefined}
        icon={<ChevronUpIcon />}
        isDisabled={!meData?.me}
        isLoading={loadingState === 'upvote-loading'}
        onClick={async () => {
          setLoadingState('upvote-loading');
          await vote({
            variables: { postId: post.id, value: 1 },
            update: (cache) => updateAfterVote(1, cache, post.id),
          });
          setLoadingState('not-loading');
        }}
      />
      {post.points}
      <IconButton
        aria-label="downvote"
        colorScheme={post.voteStatus === -1 ? 'blue' : undefined}
        ml={row ? '8px' : undefined}
        icon={<ChevronDownIcon />}
        isDisabled={!meData?.me}
        isLoading={loadingState === 'downvote-loading'}
        onClick={async () => {
          setLoadingState('downvote-loading');
          await vote({
            variables: { postId: post.id, value: -1 },
            update: (cache) => updateAfterVote(-1, cache, post.id),
          });
          setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};
