import {
  Box,
  Divider,
  Select,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import {
  useCreatePostMutation,
  useSignS3Mutation,
  useGetCommunitiesQuery,
} from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';
import { DividerWithText } from '../components/DividerWithText';
import { InputField } from '../components/form-fields/InputField';
import { ImageForm } from '../components/forms/ImageForm';
import { FormContainer } from '../components/forms/FormContainer';
import { FormWrapper } from '../components/forms/FormWrapper';
import { ImageSchema, LinkSchema, TextSchema } from '../validation/yup';
import { formatFilename } from '../utils/formatFilename';
import { FormValues } from '../shared/interfaces';
import { OptionsGrid } from '../components/forms/OptionsGrid';

const CreatePost: React.FC<unknown> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const { data, loading } = useGetCommunitiesQuery();
  const [postType, setPostType] = useState('text');
  const [createPost] = useCreatePostMutation();
  const [s3Sign] = useSignS3Mutation();

  const uploadToS3 = async (file: File, signedRequest: string) => {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': `${file.type}`,
      },
      body: file,
    };

    await fetch(signedRequest, options);
  };

  const initialValues: FormValues = {
    title: '',
    text: '',
    link: '',
    image: ('' as unknown) as File,
    communityId: data?.getCommunities[0].id || -1,
  };
  return (
    <Layout variant="regular">
      <Box bg={mode('white', 'inherit')} py="12" px={{ sm: '6', lg: '8' }}>
        <Box maxW={{ sm: 'md' }} mx={{ sm: 'auto' }} w={{ sm: 'full' }}>
          <Text fontSize={18} fontWeight={500} lineHeight="22px" mb={2}>
            Create a post
          </Text>
          <Divider />
        </Box>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={
            postType === 'link'
              ? LinkSchema
              : postType === 'image'
              ? ImageSchema
              : TextSchema
          }
          onSubmit={async (values) => {
            let image: string = '';
            if (postType === 'image') {
              const { data } = await s3Sign({
                variables: {
                  filename: formatFilename(values.image.name, 'posts'),
                  filetype: values.image.type,
                },
              });
              image = data?.signS3.url || image;

              await uploadToS3(values.image, data!.signS3.signedRequest);
            }

            const { errors } = await createPost({
              variables: {
                input: {
                  ...values,
                  image,
                  communityId: parseInt(values.communityId as any),
                },
              },
              update: (cache) => {
                cache.evict({ fieldName: 'posts:{}' });
                cache.gc();
              },
            });
            if (!errors) {
              router.push('/');
            }
          }}
        >
          {({
            isSubmitting,
            setFieldValue,
            resetForm,
            handleChange,
            handleBlur,
          }) => (
            <FormContainer>
              <DividerWithText>Options</DividerWithText>
              <OptionsGrid
                postType={postType}
                resetForm={resetForm}
                setPostType={setPostType}
              />
              <Select
                name="communityId"
                variant="filled"
                onChange={handleChange}
                onBlur={handleBlur}
                mb={4}
              >
                {data &&
                  !loading &&
                  data.getCommunities.map((community) => (
                    <option
                      id="communityId"
                      key={community.id}
                      value={community.id}
                    >
                      {community.name}
                    </option>
                  ))}
              </Select>

              <FormWrapper isSubmitting={isSubmitting}>
                {postType === 'text' ? (
                  <InputField
                    textarea
                    name="text"
                    placeholder="text"
                    label="Body"
                  />
                ) : postType === 'link' ? (
                  <InputField name="link" placeholder="Url" label="Link" />
                ) : (
                  <ImageForm setFieldValue={setFieldValue} />
                )}
              </FormWrapper>
            </FormContainer>
          )}
        </Formik>
      </Box>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
