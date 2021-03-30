import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Community } from './Community';
import { User } from './User';

@Entity()
export class CommunityUser extends BaseEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  communityId: number;

  @ManyToOne(() => User, (user) => user.communityConnection, { primary: true })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @ManyToOne(() => Community, (community) => community.userConnection, {
    primary: true,
  })
  @JoinColumn({ name: 'communityId' })
  community: Promise<Community>;
}
