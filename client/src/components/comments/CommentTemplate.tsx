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
  CommentsRecursiveFragment,
  MeQuery,
  PostDocument,
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
  comment: CommentSnippetFragment & CommentsRecursiveFragment;
  meData: MeQuery | undefined;
  post: PostSnippetFragment;
  nestLevel?: 0 | 1 | 2 | 3 | 4;
}

export const CommentTemplate: React.FC<CommentTemplateProps> = ({
  comment,
  meData,
  post,
  nestLevel,
}) => {
  const [isReply, setIsReply] = useState(false);
  const [reply] = useCommentMutation();

  const recurse = (
    currComments: PostQuery | null,
    newComment:
      | ({
          __typename?: 'Comment' | undefined;
        } & {
          parent: {
            __typename?: 'Comment' | undefined;
          } & Pick<Comment, 'id'>;
        } & {
          __typename?: 'Comment' | undefined;
        })
      | undefined
  ) => {
    let parentComment:
      | (CommentSnippetFragment & CommentsRecursiveFragment)
      | undefined;
    parentComment = currComments?.post?.comments.find(
      (oldComm) => newComment?.parent.id === oldComm.id
    );
    if (parentComment) {
      parentComment = {
        ...parentComment,
        children: [...parentComment!.children, newComment],
      };
    } else {
      currComments?.post?.comments.forEach((comment) => {
        parentComment = comment.children.find(
          (child) => newComment?.parent.id === child.id
        );
        if (!parentComment) {
          recurse(currComments, newComment);
        }
      });
    }

    const newComments = currComments!.post?.comments.filter(
      (comment) => comment.id !== parentComment?.id
    );

    return {
      parentComment,
      newComments,
    };
  };

  return (
    <Flex
      flexDir="column"
      m="5px 0px"
      ml={
        nestLevel === 1
          ? '10px'
          : nestLevel === 2
          ? '20px'
          : nestLevel === 3
          ? '40px'
          : nestLevel === 4
          ? '80px'
          : undefined
      }
    >
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
        <VoteSection comment={comment} meData={meData} />

        {meData?.me?.id === comment.creator.id ? (
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
                  reply({
                    variables: {
                      postId: post.id,
                      text: values.reply,
                      parent: comment.id,
                    },
                    update: (cache, { data: commentData }) => {
                      const newComment = commentData?.comment;
                      const currComments = cache.readQuery<PostQuery>({
                        query: PostDocument,
                        variables: { id: post.id },
                      });

                      const { newComments, parentComment } = recurse(
                        currComments,
                        newComment
                      );

                      cache.writeQuery({
                        query: PostDocument,
                        data: {
                          post: {
                            ...currComments?.post,
                            // comments: [
                            //   ...currComments!.post?.comments!,
                            //   newComment,
                            // ],
                            comments: [...newComments!, parentComment],
                            length: currComments?.post?.length! + 1,
                          },
                        },
                        variables: { id: post.id },
                      });
                    },
                  });
                  resetForm();
                  setIsReply(false);
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
                      <Button
                        variant="outline"
                        onClick={() => setIsReply(false)}
                      >
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
        ) : null}

        <EditDeleteCommentButtons
          id={comment.id}
          creatorId={comment.creator.id}
          comment={comment}
          meData={meData}
          post={post}
        />
      </Flex>

      {comment.children &&
        comment.children
          .slice()
          .sort((a, b) => b.points - a.points)
          .map((comment) => {
            comment = { ...comment, depth: nestLevel };
            return (
              <CommentTemplate
                key={comment.id}
                comment={comment as any}
                meData={meData}
                post={post}
                nestLevel={
                  (comment.depth! + 1) as 0 | 1 | 2 | 3 | 4 | undefined
                }
              />
            );
          })}
    </Flex>
  );
};
