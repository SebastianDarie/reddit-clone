## Docker
> **NOTE:** This section assumes you are using Ubuntu or a similar system, for windows you can use WSL2 and follow the same steps.

Make sure you have a `.env.production` file before proceeding and/or a place to host the backend like Heroku, DigitalOcean, GCloud, AWS, Azure.\
The following instructions are for deploying the Docker container to a VPS, in this case DigitalOcean which is the most friendly and cheapest to set up for begginers.\
If you want to automate the process you need to modify the `deploy.sh` file 
The following steps must be done even if you don't plan on using the `deploy.sh` file:
- Go to `https://hub.docker.com/` and create an account, copy your **username** and paste it somewhere so it's to use in the near future.
- Click on the **Create Repository** button in the top right hand corner add a name and then click Create, do the same with the repository name as with the username.
> **NOTE:** The next step requires you to have a credit/debit card and you'll be billed at the end of the month, for free alternatives use **Heroku** and if you can and want to add a payment method you can use the **AWS** 1 year free trial which gives you 750 hrs. of free usage on their t2.micro EC instance or **GCloud**'s 3 month trial which also gives you $300 dollars worth of credit to spend on their platform
> The services above won't charge you unless you go over the free quota and then you can contact customer support and probably solve your issue.
- Go to DigitalOcean create an account and create a $5 **Droplet** with the **Dokku** addon (so we don't have to manually set it up) from their marketplace, follow their instructions and pay attention to the `SSH` keys section so you won't have trouble logging into the machine
- Go to the Droplet and click on its **ipv4**, this should open a new window in the browser and you should see a **Dokku Setup** page 
- After you've scanned the page and made sure the **SSH** is ok then check the **Use virtualhost naming for apps** and click **Finish Setup** 
- Now to edit the `deploy.sh` file:
```bash
#!/bin/bash

echo What version is this?
read VERSION

# Change the $USERNAME with your Docker Hub username and the $REPOSITORY with repository name that you've created earlier.
# $IPV4 is the ipv4 of the droplet

docker build -t $USERNAME/$REPOSITORY:$VERSION .
docker push $USERNAME/$REPOSITORY:$VERSION
# When I initially built the app the docker image tag deployment was still being used but as of 0.24.0 is deprecated in favor of git:from-image

# Deploy the old way
ssh root@$IPV4 "docker pull sebastian2772/reddit-clone:$VERSION && docker tag sebastian2772/reddit-clone:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"

# Deploy the new way
ssh root@$IPV4 "dokku git:from-image api $USERNAME/$REPOSITORY:$VERSION"
# This triggers a rebuild when the image version changes if it doesn't try dokku ps:rebuild api
```

## Ormconfig
Go to the ormconfig.json file and modify the **username**, **password**, and **database** fields to match your credentials.

## Available Scripts

In the server directory, you can run:

### `yarn build`

Compiles the `ts` code to `js` and outputs it in the `dist` folder.
> **NOTE:** This does not delete/clear the `dist` before building, this can lead to errors when generating multiple migrations with TypeORM
> You have to manually delete or add rimraf to the command.

### `yarn watch`

Starts the typescript compiler in watch mode.
> **NOTE:** This also just adds incremental changes to the `dist` folder so beware of the migration problem mentioned above.

### `yarn dev`

Starts the development server at `http://localhost:4000/graphql`.

### `yarn start`

It's the same as `yarn dev` the only difference being that this command doesn't use nodemon so you'll have to manually restart the server for every change.

### `yarn gen-env`

Add env value to `.env.example` and generates TypeScript types.

### `yarn gen-mig`

Generates an empty migration which you can use to alter the database or seed it with dummy data
> **NOTE:** For dummy data this project uses Mockaroo, other tools most likely work but I didn't try them\
> After you get your data you can add it in the `up` method of the migration like this:
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
//  You need to add the code below
//  Text can be changed with link and image, for all the details regarding how to shape the data check the entity in entity/Post.ts
    await queryRunner.query(`
    insert into post (title, text, "creatorId") values ('Title Here', 'Content here', 1);
    ...
    `);
```
