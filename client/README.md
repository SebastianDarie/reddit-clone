# Example app with [chakra-ui](https://github.com/chakra-ui/chakra-ui) and Typescript

This example features how to use [chakra-ui](https://github.com/chakra-ui/chakra-ui) as the component library within a Next.js app with typescript.

Next.js and chakra-ui have built-in TypeScript declarations, so we'll get autocompletion for their modules straight away.

We are connecting the Next.js `_app.js` with `chakra-ui`'s Provider and theme so the pages can have app-wide dark/light mode. We are also creating some components which shows the usage of `chakra-ui`'s style props.

## Deploy your own

Deploy the example using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-chakra-ui-typescript&project-name=with-chakra-ui-typescript&repository-name=with-chakra-ui-typescript)

## How to use

### Using `create-next-app`

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example with-chakra-ui-typescript with-chakra-ui-typescript-app
# or
yarn create next-app --example with-chakra-ui-typescript with-chakra-ui-typescript-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).


## Environment Variables

To run this project, you will need to add the following environment variables to your .env.local file

`NEXT_PUBLIC_API_URL`
## Features

- Light/Dark Mode
- SSR with Next.js and Apollo
- Chakra UI
- GraphQL Codegen

  
## Run Locally

Clone the project

```bash
  git clone https://github.com/SebastianDarie/reddit-clone.git
```

Go to the project directory

```bash
  cd reddit-clone/client
```

Install dependencies

```bash
  yarn
```

Start the server

```bash
  yarn dev
```
