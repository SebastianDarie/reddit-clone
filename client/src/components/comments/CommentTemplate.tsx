import Image from 'next/image';
import NextLink from 'next/link';
import { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Link,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Formik, Form } from 'formik';
import { ClassNames } from '@emotion/react';
import {
  Comment,
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

  const flat = (currComments: Comment[]): Comment[] => {
    let arr: Comment[] = [];
    currComments.forEach((comment) => {
      arr.push(comment);
      if (Array.isArray(comment.children)) {
        arr = arr.concat(flat(comment.children));
      }
    });
    return arr;
  };

  const recurse = (
    currComments: PostQuery | null,
    newComment: Comment | undefined
  ) => {
    const flatComments = flat(currComments?.post?.comments! as any);

    let parentComment: any = flatComments.find(
      (comment) => comment.id === newComment?.parent.id
    );
    parentComment = {
      ...parentComment,
      children: [...parentComment?.children!, newComment!],
    };

    const newComments = flatComments.filter(
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
      <Flex alignItems="center" fontSize={12} fontWeight={400}>
        <ClassNames>
          {({ css }) => (
            <Image
              src={comment.creator.photoUrl}
              alt="profile pic"
              className={css`
                border-radius: 50%;
              `}
              width={28}
              height={28}
            />
          )}
        </ClassNames>

        <NextLink
          href="/user/[username]"
          as={`/user/${comment.creator.username}`}
        >
          <Link m="0 0.5rem">{comment.creator.username}</Link>
        </NextLink>
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
                      skipParent: false,
                    },
                    update: (cache, { data: commentData }) => {
                      const newComment = commentData?.comment;
                      const currComments = cache.readQuery<PostQuery>({
                        query: PostDocument,
                        variables: { id: post.id },
                      });

                      const { newComments, parentComment } = recurse(
                        currComments,
                        newComment as any
                      );

                      cache.writeQuery({
                        query: PostDocument,
                        data: {
                          post: {
                            ...currComments?.post,
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
