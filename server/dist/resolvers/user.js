"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const uuid_1 = require("uuid");
const typeorm_1 = require("typeorm");
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const User_1 = require("../entities/User");
const constants_1 = require("../constants");
const UsernamePasswordInput_1 = require("./UsernamePasswordInput");
const validateRegister_1 = require("../utils/validateRegister");
const sendEmail_1 = require("../utils/sendEmail");
const Comment_1 = require("../entities/Comment");
const CommentRepository_1 = require("../repositories/CommentRepository");
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let UserResolver = class UserResolver {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return '';
    }
    users() {
        return User_1.User.find({});
    }
    user(username) {
        return User_1.User.findOne({ username }, { relations: ['posts', 'comments'] });
    }
    changePassword(token, newPassword, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const key = constants_1.FORGET_PASSWORD_PREFIX + token;
            const userId = yield redis.get(key);
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
            const user = yield User_1.User.findOne(userIdNum);
            if (!user) {
                return {
                    errors: [{ field: 'token', message: 'user no longer exists' }],
                };
            }
            yield User_1.User.update({ id: userIdNum }, { password: yield argon2_1.default.hash(newPassword) });
            yield redis.del(key);
            req.session.userId = user.id;
            return { user };
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            if (!user) {
                return true;
            }
            const token = uuid_1.v4();
            yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);
            yield sendEmail_1.sendEmail(email, 'Change Password', `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">reset password</a>`);
            return true;
        });
    }
    me({ req }) {
        if (!req.session.userId) {
            return null;
        }
        return User_1.User.findOne(req.session.userId);
    }
    register(credentials, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = validateRegister_1.validateRegister(credentials);
            if (errors) {
                return { errors };
            }
            const randomVariation = Math.floor(Math.random() * 20) + 1;
            const colorIdx = Math.floor(Math.random() * constants_1.COLOR_VARIATIONS.length);
            const hashedPassword = yield argon2_1.default.hash(credentials.password);
            let user;
            try {
                const result = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(User_1.User)
                    .values({
                    username: credentials.username,
                    email: credentials.email,
                    password: hashedPassword,
                    photoUrl: `https://d2cqrrc2420sv.cloudfront.net/default-user/avatar_default_${randomVariation >= 10 ? randomVariation : '0' + randomVariation}_${constants_1.COLOR_VARIATIONS[colorIdx]}.png`,
                })
                    .returning('*')
                    .execute();
                user = result.raw[0];
            }
            catch (err) {
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
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne(usernameOrEmail.includes('@')
                ? {
                    where: { email: usernameOrEmail },
                }
                : { where: { username: usernameOrEmail } });
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
            const valid = yield argon2_1.default.verify(user.password, password);
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
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                res.clearCookie(constants_1.COOKIE_NAME);
                if (err) {
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
    updateUser(id, photoUrl, currImage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (currImage &&
                !currImage
                    .slice(37, currImage.length)
                    .replace(/[^/]*$/, '')
                    .includes('default-user')) {
                const path = currImage.slice(37, currImage.length);
                const s3 = new s3_1.default({
                    signatureVersion: 'v4',
                    region: 'us-east-1',
                });
                const s3Params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: path,
                };
                yield s3.deleteObject(s3Params).promise();
            }
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(User_1.User)
                .set({ photoUrl })
                .where('id = :id', {
                id,
            })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    deleteUser(username, { req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            const treeRepo = typeorm_1.getManager().getTreeRepository(Comment_1.Comment);
            const commentRepository = typeorm_1.getCustomRepository(CommentRepository_1.CommentTreeRepository);
            const rootComments = yield treeRepo.findRoots();
            for (const root of rootComments) {
                const descendants = yield treeRepo.findDescendantsTree(root);
                const currDescendants = descendants.children.filter((child) => child.creatorId === req.session.userId);
                for (const descendant of currDescendants) {
                    yield commentRepository.deleteComment(descendant.id);
                }
            }
            const currRoots = rootComments.filter((root) => root.creatorId === req.session.userId);
            for (const root of currRoots) {
                yield commentRepository.deleteComment(root.id);
            }
            yield User_1.User.delete({ username });
            return new Promise((resolve) => {
                req.session.destroy((err) => {
                    res.clearCookie(constants_1.COOKIE_NAME);
                    if (err) {
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
            });
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", String)
], UserResolver.prototype, "email", null);
__decorate([
    type_graphql_1.Query(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('token')),
    __param(1, type_graphql_1.Arg('newPassword')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('email')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('credentials')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('usernameOrEmail')),
    __param(1, type_graphql_1.Arg('password')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('photoUrl')),
    __param(2, type_graphql_1.Arg('currImage', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('username')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map