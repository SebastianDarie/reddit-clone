// import {
//   BaseEntity,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   PrimaryColumn
// } from "typeorm";
// import { SubReddit } from "./SubReddit";
// import { User } from "./User";

// @Entity()
// export class SubRedditUser extends BaseEntity {
//   @PrimaryColumn()
//   userId: number;

//   @PrimaryColumn()
//   subRedditId: number;

//   @ManyToOne(() => User, user => user.subRedditConnection, { primary: true })
//   @JoinColumn({ name: "userId" })
//   user: Promise<User>;

//   @ManyToOne(() => SubReddit, subReddit => subReddit.userConnection, {
//     primary: true
//   })
//   @JoinColumn({ name: "subRedditId" })
//   subReddit: Promise<SubReddit>;
// }
