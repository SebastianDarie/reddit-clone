import NextLink from 'next/link';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, IconButton, Link } from '@chakra-ui/react';
import { useDeletePostMutation, useMeQuery } from '../../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
  editable?: boolean;
  image?: string;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
  editable,
  image = '',
}) => {
  const { data: meData } = useMeQuery({
    variables: { skipCommunities: true },
  });
  const [deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      {editable ? (
        <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
          <IconButton as={Link} mr={4} aria-label="edit" icon={<EditIcon />} />
        </NextLink>
      ) : null}
      <IconButton
        aria-label="delete"
        icon={<DeleteIcon />}
        onClick={() => {
          deletePost({
            variables: { id, image },
            update: (cache) => {
              cache.evict({ id: 'Post:' + id });
            },
          });
        }}
      />
    </Box>
  );
};
