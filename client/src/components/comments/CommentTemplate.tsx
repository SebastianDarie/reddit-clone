import { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Formik, Form } from 'formik';
import {
  CommentSnippetFragment,
  MeQuery,
  PostQuery,
  PostSnippetFragment,
  useCommentMutation,
} from '../../generated/graphql';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { EditDeleteCommentButtons } from './EditDeleteCommentButtons';
import { VoteSection } from './VoteSection';
import { InputField } from '../form-fields/InputField';
import { CommentSchema } from '../../validation/yup';

interface CommentTemplateProps {
  comment: CommentSnippetFragment;
  meData: MeQuery | undefined;
  post: PostSnippetFragment;
}

export const CommentTemplate: React.FC<CommentTemplateProps> = ({
  comment,
  meData,
  post,
}) => {
  const [isReply, setIsReply] = useState(false);
  const [reply] = useCommentMutation();

  return (
    <Flex flexDir="column" m="5px 0px">
      <Flex fontSize={12} fontWeight={400}>
        <Text mr={2}>{comment.creator.username} </Text>
        <Text color="gray.500">
          {formatTimestamp(new Date(+comment.createdAt).getTime())}
        </Text>
        {comment.createdAt !== comment.updatedAt ? (
          <>
            <Text color="gray.500" pl="4px">
              {' '}
              ·{' '}
            </Text>
            <Text color="gray.500" fontStyle="italic" ml="3px">
              edited {formatTimestamp(new Date(+comment.updatedAt).getTime())}
            </Text>
          </>
        ) : null}
      </Flex>

      <Text fontWeight={400} mb={2}>
        {comment.text}
      </Text>
      <Flex alignItems="center">
        <VoteSection comment={comment} />
        <Popover
          isLazy
          isOpen={isReply}
          onClose={() => setIsReply(false)}
          placement="bottom"
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <IconButton
              aria-label="reply"
              size="sm"
              ml={2}
              icon={<FaRegCommentAlt />}
              onClick={() => setIsReply(true)}
            />
          </PopoverTrigger>
          <PopoverContent p={5}>
            <PopoverArrow />
            <PopoverCloseButton />

            <Formik
              initialValues={{ reply: '' }}
              validationSchema={CommentSchema}
              onSubmit={async (values, { resetForm }) => {
                // reply({
                //   variables: { postId: post.id, text: values.reply, depth: comment.depth + 1, parentCommentId: comment.id },
                //   update: (cache, { data: commentData }) => {
                //     const newComment = commentData?.comment;
                //     const currComments = cache.readQuery<PostQuery>({
                //       query: PostDocument,
                //       variables: { id: post.id },
                //     });

                //     cache.writeQuery({
                //       query: PostDocument,
                //       data: {
                //         post: {
                //           ...currComments?.post,
                //           comments: [...currComments!.post?.comments, newComment],
                //         },
                //       },
                //     });
                //   },
                // });
                resetForm();
              }}
            >
              {({ values }) => (
                <Form
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <InputField
                    textarea
                    name="reply"
                    placeholder="What are your thoughts?"
                    label={`Reply as ${meData?.me?.username}`}
                  />
                  <ButtonGroup d="flex" justifyContent="flex-end">
                    <Button variant="outline" onClick={() => setIsReply(false)}>
                      Cancel
                    </Button>
                    <Button
                      alignSelf="flex-end"
                      type="submit"
                      isDisabled={!!!values.reply}
                      colorScheme="teal"
                    >
                      Reply
                    </Button>
                  </ButtonGroup>
                </Form>
              )}
            </Formik>
          </PopoverContent>
        </Popover>

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
