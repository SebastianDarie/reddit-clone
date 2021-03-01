import { ApolloCache } from '@apollo/client';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import gql from 'graphql-tag';
import { useState } from 'react';
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql';

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
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
    if (data.voteStatus === value) {
      return;
    }
    const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;
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

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [vote] = useVoteMutation();

  return (
    <Flex direction='column' justifyContent='center' alignItems='center' mr={4}>
      <IconButton
        aria-label='upvote'
        colorScheme={post.voteStatus === 1 ? 'orange' : undefined}
        icon={<ChevronUpIcon />}
        isLoading={loadingState === 'upvote-loading'}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState('upvote-loading');
          await vote({
            variables: { postId: post.id, value: 1 },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
          setLoadingState('not-loading');
        }}
      />
      {post.points}
      <IconButton
        aria-label='downvote'
        colorScheme={post.voteStatus === -1 ? 'blue' : undefined}
        icon={<ChevronDownIcon />}
        isLoading={loadingState === 'downvote-loading'}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState('downvote-loading');
          await vote({
            variables: { postId: post.id, value: -1 },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
          setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};
