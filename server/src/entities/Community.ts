import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  //  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityUser } from './CommunityUser';
import { Post } from './Post';
// import { User } from './User';

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

  @Field()
  @Column({ type: 'int', default: 1 })
  memberCount: number;

  @OneToMany(() => Post, (post) => post.community)
  posts: Post[];

  // @ManyToMany(() => User)
  // users: User[];

  @OneToMany(() => CommunityUser, (cu) => cu.user)
  userConnection: Promise<CommunityUser[]>;

  // @Column()
  // creatorId: number;

  // @ManyToOne(() => User, (user) => user.communities)
  // creator: User;

  // @Column()
  // postId: number;

  // @ManyToOne(() => Post, (post) => post.upvotes, {
  //   onDelete: 'CASCADE',
  // })
  // post: Post;
}
