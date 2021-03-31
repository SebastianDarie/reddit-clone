import DataLoader from 'dataloader';
import { Community } from '../entities/Community';

export const createCommunityLoader = (): DataLoader<
  number,
  Community,
  number
> =>
  new DataLoader<number, Community>(async (communityIds) => {
    const communities = await Community.findByIds(communityIds as number[]);
    const communityIdToCommunity: Record<number, Community> = {};

    communities.forEach((c) => {
      communityIdToCommunity[c.id] = c;
    });

    return communityIds.map(
      (communityId) => communityIdToCommunity[communityId]
    );
  });
