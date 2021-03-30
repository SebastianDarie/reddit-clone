import { Field, ObjectType } from 'type-graphql';
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
// import { Community } from './Community';
import { CommunityUser } from './CommunityUser';
import { Upvote } from './Upvote';

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

  // @OneToMany(() => Community, (community) => community.creator)
  // communities: Community[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
