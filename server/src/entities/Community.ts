import { Ctx, Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MyContext } from '../types';
import { CommunityUser } from './CommunityUser';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class Community extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column()
  description!: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.community)
  posts: Post[];

  @OneToMany(() => CommunityUser, (cu) => cu.user)
  userConnection: Promise<CommunityUser[]>;

  @Field(() => [User])
  async users(@Ctx() { communityUserLoader }: MyContext): Promise<User[]> {
    return communityUserLoader.load(this.id);
  }
}
