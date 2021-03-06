import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Redis } from 'ioredis';
import { createCommentUpvoteLoader } from './utils/createCommentUpvoteLoader';
import { createCommunityLoader } from './utils/createCommunityLoader';
import { createCommunityUserLoader } from './utils/createCommunityUserLoader';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserCommunityLoader } from './utils/createUserCommunityLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number };
  };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
  commentUpvoteLoader: ReturnType<typeof createCommentUpvoteLoader>;
  communityLoader: ReturnType<typeof createCommunityLoader>;
  communityUserLoader: ReturnType<typeof createCommunityUserLoader>;
  userCommunityLoader: ReturnType<typeof createUserCommunityLoader>;
};
