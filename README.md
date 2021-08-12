# Getting Started with this project

This project contains two main folders client and server.

First run `yarn` or `yarn install` in the project directory
> **NOTE:** For npm users follow the steps below:
> - Delete the `yarn.lock` file from the project directory
> - You should now have no `.lock` files
> - Now you can run `npm i` or `npm install`
> - You should now be able to continue using npm in this directory only.
> - To use in the other directories repeat the steps above.

Then run the following commands to setup the server:
```bash
cd server
yarn
yarn watch
```
Next you need to create a new `.env` file for local development and `.env.production` for production if you want to deploy the app.
The values that you need to provide are located in the `.env.example` file in the same directory.

Assuming you are still in the server directory run the following to setup and start the dev server for the frontend:
```bash
cd ../client
yarn
yarn dev
```

## Available Scripts

In the project directory, you can run:

### `yarn type-check`

Checks types throught the whole project and returns errors(if any).

### `yarn test:w`

Launches the test runner in the interactive watch mode.

### `yarn test:frontend`

Performs the tests only for the next app with its own jest config.

### `yarn lint`

Runs eslint for files in the project with the following extensions: `js, ts, tsx`.

### `yarn lint:fix`

Applies possible automatic fixes for the linted files mentioned above.
