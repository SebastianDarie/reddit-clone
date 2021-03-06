import 'reflect-metadata';
import 'dotenv-safe/config';
import express from 'express';
import path from 'path';
import { COOKIE_NAME, __prod__ } from './constants';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Upvote } from './entities/Upvote';
import { createUserLoader } from './utils/createUserLoader';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { Comment } from './entities/Comment';
import { CommentUpvote } from './entities/CommentUpvote';
import { CommentResolver } from './resolvers/comment';
import { createCommentUpvoteLoader } from './utils/createCommentUpvoteLoader';
import { Community } from './entities/Community';
import { CommunityUser } from './entities/CommunityUser';
import { CommunityResolver } from './resolvers/community';
import { createCommunityLoader } from './utils/createCommunityLoader';
import { createCommunityUserLoader } from './utils/createCommunityUserLoader';
import { createUserCommunityLoader } from './utils/createUserCommunityLoader';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [
      Post,
      User,
      Upvote,
      Comment,
      CommentUpvote,
      Community,
      CommunityUser,
    ],
  });

  await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.set('trust proxy', 1);

  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
        domain: __prod__ ? '.reddit-clone.tech' : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        PostResolver,
        UserResolver,
        CommentResolver,
        CommunityResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
      commentUpvoteLoader: createCommentUpvoteLoader(),
      communityLoader: createCommunityLoader(),
      communityUserLoader: createCommunityUserLoader(),
      userCommunityLoader: createUserCommunityLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(parseInt(process.env.PORT), () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
