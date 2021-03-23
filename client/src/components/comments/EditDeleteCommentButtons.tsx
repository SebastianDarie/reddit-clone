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
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { MdDelete } from 'react-icons/md';
import { Formik, Form } from 'formik';
import { useState } from 'react';
import {
  CommentSnippetFragment,
  MeQuery,
  PostDocument,
  PostQuery,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from '../../generated/graphql';
import { CommentSchema } from '../../validation/yup';
import { InputField } from '../form-fields/InputField';

interface EditDeleteCommentButtonsProps {
  id: number;
  creatorId: number;
  comment: CommentSnippetFragment;
  meData: MeQuery | undefined;
  post: any;
}

export const EditDeleteCommentButtons: React.FC<EditDeleteCommentButtonsProps> = ({
  id,
  creatorId,
  comment,
  meData,
  post,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Flex>
      <Popover
        isLazy
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="right"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton
            aria-label="edit"
            size="sm"
            ml={2}
            icon={<EditIcon />}
            onClick={() => setIsOpen(!isOpen)}
          />
        </PopoverTrigger>
        <PopoverContent p={5}>
          <PopoverArrow />
          <PopoverCloseButton />
          <Formik
            initialValues={{ comment: comment.text }}
            validationSchema={CommentSchema}
            onSubmit={async (values) => {
              updateComment({ variables: { id, text: values.comment } });
              setIsOpen(false);
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
                <InputField textarea name="comment" label="Edit" />
                <ButtonGroup d="flex" justifyContent="flex-end">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isDisabled={!!!values.comment}
                    colorScheme="teal"
                  >
                    Save Edits
                  </Button>
                </ButtonGroup>
              </Form>
            )}
          </Formik>
        </PopoverContent>
      </Popover>

      <IconButton
        aria-label="delete"
        size="sm"
        ml={2}
        icon={<MdDelete />}
        onClick={() => {
          deleteComment({
            variables: { id },
            update: (cache) => {
              cache.evict({ id: 'Comment:' + id });
              cache.evict({ id: 'Post:' + post.id });
            },
          });
        }}
      />
    </Flex>
  );
};
