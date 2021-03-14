import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentUpvote } from './CommentUpvote';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  text!: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentCommentId: number;

  @OneToMany(() => CommentUpvote, (upvote) => upvote.comment)
  upvotes: CommentUpvote[];

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Field()
  @PrimaryColumn()
  creatorId: number;

  @ManyToOne(() => User, (user) => user.comments)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
