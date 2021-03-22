import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeLevelColumn,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { CommentUpvote } from './CommentUpvote';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
@Tree('closure-table')
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  text!: string;

  // @Field()
  // @Column({ type: 'int', default: 0 })
  // depth!: number;

  // @Field(() => Int, { nullable: true })
  // @Column({ nullable: true, type: 'integer' })
  // parentCommentId: number | null;

  @TreeParent()
  parent: Comment;

  @Field(() => [Comment])
  @TreeChildren()
  children: Comment[];

  // @Field()
  // @TreeLevelColumn()
  // level: number;

  @Field(() => Int, { nullable: true })
  depth: number;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null;

  @OneToMany(() => CommentUpvote, (upvote) => upvote.comment)
  upvotes: CommentUpvote[];

  @Field()
  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.comments)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
