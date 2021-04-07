import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { Community } from '../entities/Community';
import { CommunityUser } from '../entities/CommunityUser';

const batchCommunities = async (userIds: readonly number[]) => {
  const userCommunities = await CommunityUser.find({
    join: {
      alias: 'userCommunity',
      innerJoinAndSelect: {
        community: 'userCommunity.community',
      },
    },
    where: {
      userId: In(userIds as number[]),
    },
  });

  const userIdToCommunities: { [key: number]: Community[] } = {};

  userCommunities.forEach((cu) => {
    if (cu.userId in userIdToCommunities) {
      userIdToCommunities[cu.userId].push((cu as any).__community__);
    } else {
      userIdToCommunities[cu.userId] = [(cu as any).__community__];
    }
  });

  return userIds.map((userId) => userIdToCommunities[userId]);
};

export const createUserCommunityLoader = () => new DataLoader(batchCommunities);
