import { Button, Flex, IconButton, Text } from '@chakra-ui/react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { CommentSnippetFragment } from '../../generated/graphql';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { VoteSection } from './VoteSection';

interface CommentTemplateProps {
  comment: CommentSnippetFragment;
}

export const CommentTemplate: React.FC<CommentTemplateProps> = ({
  comment,
}) => {
  return (
    <Flex flexDir="column">
      <Text>
        {comment.creator.username}{' '}
        {formatTimestamp(new Date(+comment.createdAt).getTime())}
      </Text>
      <Text mb={2}>{comment.text}</Text>
      <Flex>
        <VoteSection comment={comment} />
        <Flex>
          <IconButton
            aria-label="reply"
            size="sm"
            icon={<FaRegCommentAlt />}
            ml={2}
            mr={2}
          />
          <Text>Reply</Text>
        </Flex>
        <Button>Edit</Button>
        <IconButton aria-label="delete" size="sm" icon={<MdDelete />} />
      </Flex>
    </Flex>
  );
};
