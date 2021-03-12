import Image from 'next/image';
import { Box, Link, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Post } from '../../generated/graphql';

interface PostDataProps {
  post: {
    __typename?: 'Post' | undefined;
  } & {
    __typename?: 'Post' | undefined;
  } & Pick<
      Post,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'title'
      | 'text'
      | 'textSnippet'
      | 'image'
      | 'link'
      | 'linkSnippet'
      | 'points'
      | 'voteStatus'
    >;
  single?: boolean;
}

export const PostData: React.FC<PostDataProps> = ({ post, single = false }) => {
  return (
    <>
      {(single ? post.text : post.textSnippet) !== '' ? (
        <Text mt={2}>{post.textSnippet || post.text}</Text>
      ) : post.image !== '' ? (
        <Box mt={2} w="100%" maxH={512} pos="relative">
          <Image
            src={`${post.image}`}
            alt="post image"
            layout="responsive"
            objectFit="contain"
            width={706}
            height={400}
          />
        </Box>
      ) : /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(
          post.link
        ) ? (
        <Box mt={2} maxH={512} w="100%">
          <iframe
            title={post.link}
            src={`//www.youtube.com/embed/${post.link.split('v=')[1]}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            height={400}
            width="100%"
          />
        </Box>
      ) : (
        <Link color="blue.400" mt={2} href={`${post.link}`} isExternal>
          {single ? post.link : post.linkSnippet} <ExternalLinkIcon />{' '}
        </Link>
      )}
    </>
  );
};
