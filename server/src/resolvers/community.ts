import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Community } from '../entities/Community';
import { CommunityUser } from '../entities/CommunityUser';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@Resolver(Community)
export class CommunityResolver {
  @Query(() => [Community])
  async getCommunities(): Promise<Community[]> {
    return Community.find({ select: ['id', 'name'] });
  }

  @Query(() => Community, { nullable: true })
  async getCommunity(
    @Arg('name') name: string
  ): Promise<Community | undefined> {
    return Community.findOne({ name });
  }

  @Mutation(() => Community)
  @UseMiddleware(isAuth)
  async createCommunity(
    @Arg('name') name: string,
    @Arg('description') description: string
  ): Promise<Community> {
    return Community.create({ name, description }).save();
  }

  @Mutation(() => Boolean)
  async addCommunityUser(
    @Arg('userId', () => Int) userId: number,
    @Arg('communityId', () => Int) communityId: number
  ): Promise<Boolean> {
    await CommunityUser.create({ userId, communityId }).save();
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async leaveCommunity(
    @Arg('communityId', () => Int) communityId: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await CommunityUser.delete({ communityId, userId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteCommunity(
    @Arg('communityId', () => Int) communityId: number
  ): Promise<Boolean> {
    await CommunityUser.delete({ communityId });
    await Community.delete({ id: communityId });
    return true;
  }
}
