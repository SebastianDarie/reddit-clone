import {
  Box,
  Button,
  Divider,
  Stack,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { InputField } from '../components/form-fields/InputField';
import { FormContainer } from '../components/forms/FormContainer';
import { Layout } from '../components/Layout';
import {
  GetCommunityDocument,
  GetCommunityQuery,
  useAddCommunityUserMutation,
  useCreateCommunityMutation,
  useMeQuery,
} from '../generated/graphql';
import { isServer } from '../utils/isServer';
//import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';

const CreateCommunity: React.FC<unknown> = ({}) => {
  const router = useRouter();
  //useIsAuth();
  const { data: meData } = useMeQuery({
    variables: { skipCommunities: true },
    skip: isServer(),
  });
  const [createCommunity] = useCreateCommunityMutation();
  const [addUser] = useAddCommunityUserMutation();

  return (
    <Layout variant="regular">
      <Box bg={mode('white', 'inherit')} py="12" px={{ sm: '6', lg: '8' }}>
        <Box maxW={{ sm: 'md' }} mx={{ sm: 'auto' }} w={{ sm: 'full' }}>
          <Text fontSize={18} fontWeight={500} lineHeight="22px" mb={2}>
            Create a community
          </Text>
          <Divider />
        </Box>
        <Formik
          initialValues={{ name: '', description: '' }}
          onSubmit={async (values) => {
            const { data, errors } = await createCommunity({
              variables: {
                name: values.name,
                description: values.description,
              },
            });
            const { errors: joinErr } = await addUser({
              variables: {
                communityId: data?.createCommunity.id!,
                userId: meData?.me?.id!,
              },
              update: (cache) => {
                // const currData = cache.readQuery<GetCommunityQuery>({
                //   query: GetCommunityDocument,
                //   variables: { name: data?.createCommunity.name },
                // });
                // cache.writeQuery({
                //   query: GetCommunityDocument,
                //   variables: { name: data?.createCommunity.name },
                //   data: {
                //     getCommunity: {
                //       ...currData,
                //       users: [
                //         ...currData?.getCommunity?.users!,
                //         { id: meData?.me?.id },
                //       ],
                //     },
                //   },
                // });

                const normalizedId = cache.identify({
                  __typename: 'User',
                  id: meData?.me?.id,
                });
                cache.evict({ id: normalizedId });
                cache.gc();
              },
            });
            if (!errors && !joinErr) {
              router.push('/');
            }
          }}
        >
          {({ isSubmitting }) => (
            <FormContainer>
              <Form>
                <Stack spacing="6">
                  <InputField name="name" placeholder="React" label="Name" />
                  <Box mt={4}>
                    <InputField
                      textarea
                      name="description"
                      placeholder="describe your community here"
                      label="Description"
                    />
                  </Box>
                  <Button
                    mt={4}
                    type="submit"
                    isLoading={isSubmitting}
                    colorScheme="teal"
                  >
                    Create Community
                  </Button>
                </Stack>
              </Form>
            </FormContainer>
          )}
        </Formik>
      </Box>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreateCommunity);
