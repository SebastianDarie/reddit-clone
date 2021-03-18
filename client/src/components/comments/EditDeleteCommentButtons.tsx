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
  useDisclosure,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { MdDelete } from 'react-icons/md';
import { Formik, Form } from 'formik';
import {
  CommentSnippetFragment,
  MeQuery,
  useDeleteCommentMutation,
} from '../../generated/graphql';
import { CommentSchema } from '../../validation/yup';
import { InputField } from '../form-fields/InputField';

interface EditDeleteCommentButtonsProps {
  id: number;
  creatorId: number;
  comment: CommentSnippetFragment;
  meData: MeQuery | undefined;
}

export const EditDeleteCommentButtons: React.FC<EditDeleteCommentButtonsProps> = ({
  id,
  creatorId,
  comment,
  meData,
}) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [deleteComment] = useDeleteCommentMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Flex>
      {/* <Button size="sm" ml={2} mr={2}>
        Edit
      </Button> */}
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="right"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton aria-label="edit" size="sm" icon={<EditIcon />} />
        </PopoverTrigger>
        <PopoverContent p={5}>
          <PopoverArrow />
          <PopoverCloseButton />
          <Formik
            initialValues={{ comment: comment.text }}
            validationSchema={CommentSchema}
            onSubmit={async (values) => {
              console.log(values);
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
                  <Button variant="outline" onClick={onClose}>
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
            },
          });
        }}
      />
    </Flex>
  );
};
