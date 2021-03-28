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

  //@Field(() => [CommentUpvote])
  @OneToMany(() => CommentUpvote, (commentUpvote) => commentUpvote.user)
  commentUpvotes: CommentUpvote[];

  //@Field(() => [Upvote])
  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
