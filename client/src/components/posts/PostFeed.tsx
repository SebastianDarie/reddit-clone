import {
  Box,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Post } from '../../generated/graphql';
import { EditDeletePostButtons } from './EditDeletePostButtons';
import { PostData } from './PostData';
import { UpvoteSection } from './UpvoteSection';
import { formatTimestamp } from '../../utils/formatTimestamp';

type FeedPost = Omit<
  Post[],
  'text' | 'creatorId' | 'communityId' | 'updatedAt'
>;

interface PostFeedProps {
  posts: FeedPost;
}

export const PostFeed: React.FC<PostFeedProps> = ({ posts }) => {
  return (
    <>
      <Stack spacing={8}>
        {posts.map((p: Post) =>
          !p ? null : (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpvoteSection post={p} />
              <Box data-testid="posts" flex={1}>
                <Flex>
                  <Flex flexDir="column">
                    <Flex
                      color="gray.500"
                      fontSize={12}
                      fontWeight={400}
                      mb="4px"
                    >
                      <NextLink href="/r/[name]" as={`/r/${p.community.name}`}>
                        <Link color="gray.200" fontWeight={700} mr="2px">
                          r/{p.community.name}
                        </Link>
                      </NextLink>
                      <Text m="0 4px">•</Text>
                      <Text>Posted by u/ </Text>
                      <NextLink
                        href="/user/[username]"
                        as={`/user/${p.creator.username}`}
                      >
                        <Link mr="2px">{p.creator.username}</Link>
                      </NextLink>
                      {formatTimestamp(new Date(+p.createdAt).getTime())}
                    </Flex>

                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                      <Link>
                        <Heading fontSize={18} mt={2}>
                          {p.title}
                        </Heading>
                      </Link>
                    </NextLink>
                  </Flex>
                  <Box ml="auto">
                    <EditDeletePostButtons
                      id={p.id}
                      creatorId={p.creator.id}
                      editable={!!p.textSnippet}
                      image={p.image}
                    />
                  </Box>
                </Flex>
                <Flex align="center">
                  <PostData post={p as any} />
                </Flex>
                <Flex mt={4}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link _hover={{ textDecoration: 'none' }}>
                      <Flex alignItems="center">
                        <IconButton
                          aria-label="comments"
                          size="md"
                          variant="outline"
                          icon={<FaRegCommentAlt />}
                          mr={2}
                        />
                        <Text>{p.comments.length} Comments</Text>
                      </Flex>
                    </Link>
                  </NextLink>
                </Flex>
              </Box>
            </Flex>
          )
        )}
      </Stack>
    </>
  );
};
