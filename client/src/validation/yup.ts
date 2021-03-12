import * as Yup from 'yup';

const Title = Yup.string()
  .min(3, 'Choose an interesting title!')
  .max(300, 'Too much already!')
  .required('Anything works!');

export const TextSchema = Yup.object().shape({
  title: Yup.string().concat(Title),
  text: Yup.string()
    .min(3, "There's gotta be more to your content!")
    .max(10000, 'Create separate posts!')
    .required('Why are you here for?'),
});

export const LinkSchema = Yup.object().shape({
  title: Yup.string().concat(Title),
  link: Yup.string()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Please enter a valid url!'
    )
    .max(2000, 'Too much shorthen it')
    .required('Add a link to something'),
});

export const ImageSchema = Yup.object().shape({
  title: Yup.string().concat(Title),
  image: Yup.mixed()
    .required('Please upload an image')
    .test(
      'fileSize',
      'File too large',
      (value) => value && value.size <= 20000 * 1024
    )
    .test(
      'fileFormat',
      'Unsupported Format',
      (value) =>
        value &&
        ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'].includes(
          value.type
        )
    ),
});
