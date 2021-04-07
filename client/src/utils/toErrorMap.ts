import { FieldError } from '../generated/graphql';

export const toErrorMap = (errors: FieldError[]) =>
  errors.reduce((acc: { [key: string]: string }, { field, message }): Record<
    string,
    string
  > => {
    acc[field] = message;
    return acc;
  }, {});
