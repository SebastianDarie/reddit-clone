import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import argon2 from 'argon2';
import { v4 } from 'uuid';
import { getConnection, getCustomRepository, getManager } from 'typeorm';
import S3 from 'aws-sdk/clients/s3';
import { User } from '../entities/User';
import { MyContext } from '../types';
import {
  COLOR_VARIATIONS,
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
} from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { Comment } from '../entities/Comment';
import { CommentTreeRepository } from '../repositories/CommentRepository';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext): string {
    if (req.session.userId === user.id) {
      return user.email;
    }

    return '';
  }

  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find({});
  }

  @Query(() => User, { nullable: true })
  user(@Arg('username') username: string): Promise<User | undefined> {
    return User.findOne({ username }, { relations: ['posts', 'comments'] });
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be longer than 2',
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [{ field: 'token', message: 'user no longer exists' }],
      };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(
      email,
      'Change Password',
      `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext): Promise<User | undefined> | null {
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('credentials') credentials: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(credentials);
    if (errors) {
      return { errors };
    }

    const randomVariation = Math.floor(Math.random() * 20) + 1;
    const colorIdx = Math.floor(Math.random() * COLOR_VARIATIONS.length);

    const hashedPassword = await argon2.hash(credentials.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: credentials.username,
          email: credentials.email,
          password: hashedPassword,
          // photoUrl: `https://d2cqrrc2420sv.cloudfront.net/default-user/avatar_default_${
          //   randomVariation >= 10 ? randomVariation : '0' + randomVariation
          // }_${COLOR_VARIATIONS[colorIdx]}.png`,
          photoUrl: `https://www.redditstatic.com/avatars/avatar_default_${
            randomVariation >= 10 ? randomVariation : '0' + randomVariation
          }_${COLOR_VARIATIONS[colorIdx]}.png`,
        })
        .returning('*')
        .execute();

      user = result.raw[0];
    } catch (err) {
      if (err.code === '23505') {
        if (err.detail.includes('email')) {
          return {
            errors: [
              {
                field: 'email',
                message: 'email already taken',
              },
            ],
          };
        }
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? {
            where: { email: usernameOrEmail },
          }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  @Mutation(() => User, { nullable: true })
  async updateUser(
    @Arg('id', () => Int) id: number,
    @Arg('photoUrl') photoUrl: string,
    @Arg('currImage', { nullable: true }) currImage: string
  ): Promise<User | null> {
    if (
      currImage &&
      !currImage
        .slice(37, currImage.length)
        .replace(/[^/]*$/, '')
        .includes('default-user')
    ) {
      const path = currImage.slice(37, currImage.length);

      const s3 = new S3({
        signatureVersion: 'v4',
        region: 'us-east-1',
      });

      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: path,
      };

      await s3.deleteObject(s3Params).promise();
    }

    const result = await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({ photoUrl })
      .where('id = :id', {
        id,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg('username') username: string,
    @Ctx() { req, res }: MyContext
  ): Promise<Boolean> {
    const treeRepo = getManager().getTreeRepository(Comment);
    const commentRepository = getCustomRepository(CommentTreeRepository);

    const rootComments = await treeRepo.findRoots();
    for (const root of rootComments) {
      const descendants = await treeRepo.findDescendantsTree(root);
      const currDescendants = descendants.children.filter(
        (child) => child.creatorId === req.session.userId
      );
      for (const descendant of currDescendants) {
        await commentRepository.deleteComment(descendant.id);
      }
    }
    const currRoots = rootComments.filter(
      (root) => root.creatorId === req.session.userId
    );

    for (const root of currRoots) {
      await commentRepository.deleteComment(root.id);
    }

    await User.delete({ username });
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }
}
