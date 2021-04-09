import { Ctx, Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './Comment';
import { CommentUpvote } from './CommentUpvote';
import { Post } from './Post';
import { CommunityUser } from './CommunityUser';
import { Upvote } from './Upvote';
import { Community } from './Community';
import { MyContext } from '../types';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @Column()
  photoUrl!: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.creator)
  comments: Comment[];

  @OneToMany(() => CommentUpvote, (commentUpvote) => commentUpvote.user)
  commentUpvotes: CommentUpvote[];

  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[];

  @OneToMany(() => CommunityUser, (cu) => cu.community)
  communityConnection: Promise<CommunityUser[]>;

  @Field(() => [Community], { defaultValue: [] })
  async communities(
    @Ctx() { userCommunityLoader }: MyContext
  ): Promise<Community[]> {
    return userCommunityLoader.load(this.id) || [];
  }

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
