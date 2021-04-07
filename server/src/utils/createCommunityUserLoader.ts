import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { CommunityUser } from '../entities/CommunityUser';
import { User } from '../entities/User';

const batchUsers = async (communityIds: readonly number[]) => {
  const communityUsers = await CommunityUser.find({
    join: {
      alias: 'communityUser',
      innerJoinAndSelect: {
        user: 'communityUser.user',
      },
    },
    where: {
      communityId: In(communityIds as number[]),
    },
  });

  const communityIdToUsers: { [key: number]: User[] } = {};

  communityUsers.forEach((cu) => {
    if (cu.communityId in communityIdToUsers) {
      communityIdToUsers[cu.communityId].push((cu as any).__user__);
    } else {
      communityIdToUsers[cu.communityId] = [(cu as any).__user__];
    }
  });

  return communityIds.map((communityId) => communityIdToUsers[communityId]);
};

export const createCommunityUserLoader = () => new DataLoader(batchUsers);
