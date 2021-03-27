import { ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Comment } from './Comment';
import { User } from './User';

@ObjectType()
@Entity()
export class CommentUpvote extends BaseEntity {
  @Column({ type: 'int' })
  value: number;

  @PrimaryColumn()
  commentId: number;

  @ManyToOne(() => Comment, (comment) => comment.upvotes, {
    onDelete: 'CASCADE',
  })
  comment: Comment;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.commentUpvotes, { onDelete: 'CASCADE' })
  user: User;
}
