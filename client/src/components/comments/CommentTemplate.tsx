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
      <Flex fontSize={12} fontWeight={400}>
        <Text mr={2}>{comment.creator.username} </Text>
        <Text color="gray.500">
          {formatTimestamp(new Date(+comment.createdAt).getTime())}
        </Text>
      </Flex>

      <Text fontWeight={400} mb={2}>
        {comment.text}
      </Text>
      <Flex alignItems="center">
        <VoteSection comment={comment} />
        <Flex alignItems="center">
          <IconButton
            aria-label="reply"
            size="sm"
            icon={<FaRegCommentAlt />}
            ml={2}
            mr={1}
          />
          <Text>Reply</Text>
        </Flex>
        <Button size="sm" ml={2} mr={2}>
          Edit
        </Button>
        <IconButton aria-label="delete" size="sm" icon={<MdDelete />} />
      </Flex>
    </Flex>
  );
};
