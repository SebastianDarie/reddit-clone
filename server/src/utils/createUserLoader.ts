import DataLoader from 'dataloader';
import { User } from '../entities/User';

export const createUserLoader = (): DataLoader<number, User, number> =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};

    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return userIds.map((userId) => userIdToUser[userId]);
  });
