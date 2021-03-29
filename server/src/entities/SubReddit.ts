import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
//import { SubRedditUser } from './SubRedditUser';
//import { Post } from './Post';
//import { User } from './User';

@ObjectType()
@Entity()
export class SubReddit extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  description!: string;

  @Field()
  @Column({ type: 'int', default: 1 })
  memberCount: number;

  // @ManyToMany(() => User)
  // users: User[];

  // @OneToMany(() => SubRedditUser, su => su.user)
  // userConnection: Promise<SubRedditUser[]>

  @Column()
  creatorId: number;

  // @ManyToOne(() => User, (user) => user.subReddits)
  // creator: User;

  // @Column()
  // postId: number;

  // @ManyToOne(() => Post, (post) => post.upvotes, {
  //   onDelete: 'CASCADE',
  // })
  // post: Post;
}
