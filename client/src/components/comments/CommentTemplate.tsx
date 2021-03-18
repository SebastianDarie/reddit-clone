import { Flex, IconButton, Text } from '@chakra-ui/react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { CommentSnippetFragment, MeQuery } from '../../generated/graphql';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { EditDeleteCommentButtons } from './EditDeleteCommentButtons';
import { VoteSection } from './VoteSection';

interface CommentTemplateProps {
  comment: CommentSnippetFragment;
  meData: MeQuery | undefined;
}

export const CommentTemplate: React.FC<CommentTemplateProps> = ({
  comment,
  meData,
}) => {
  return (
    <Flex flexDir="column" m="5px 0px">
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
        <Flex alignItems="center" mr={2}>
          <IconButton
            aria-label="reply"
            size="sm"
            icon={<FaRegCommentAlt />}
            ml={2}
            mr={1}
          />
          <Text>Reply</Text>
        </Flex>
        <EditDeleteCommentButtons
          id={comment.id}
          creatorId={comment.creator.id}
          comment={comment}
          meData={meData}
        />
      </Flex>
    </Flex>
  );
};
