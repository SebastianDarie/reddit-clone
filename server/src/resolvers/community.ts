import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection, getCustomRepository, getManager } from 'typeorm';
import { Community } from '../entities/Community';
import { CommunityUser } from '../entities/CommunityUser';
import { User } from '../entities/User';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@Resolver(Community)
export class CommunityResolver {
  @Query(() => [Community])
  async getCommunities(): Promise<Community[]> {
    return Community.find({});
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
  async deleteCommunity(
    @Arg('communityId', () => Int) communityId: number
  ): Promise<Boolean> {
    await CommunityUser.delete({ communityId });
    await Community.delete({ id: communityId });
    return true;
  }
}
