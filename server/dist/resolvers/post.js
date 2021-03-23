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
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const Post_1 = require("../entities/Post");
const User_1 = require("../entities/User");
const Comment_1 = require("../entities/Comment");
const isAuth_1 = require("../middleware/isAuth");
const vote_1 = require("./vote");
let PostInput = class PostInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "link", void 0);
PostInput = __decorate([
    type_graphql_1.InputType()
], PostInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    type_graphql_1.Field(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    type_graphql_1.ObjectType()
], PaginatedPosts);
let CommentsPost = class CommentsPost {
};
__decorate([
    type_graphql_1.Field(() => Post_1.Post),
    __metadata("design:type", Object)
], CommentsPost.prototype, "content", void 0);
__decorate([
    type_graphql_1.Field(() => [Comment_1.Comment]),
    __metadata("design:type", Array)
], CommentsPost.prototype, "comments", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], CommentsPost.prototype, "length", void 0);
CommentsPost = __decorate([
    type_graphql_1.ObjectType()
], CommentsPost);
let S3Payload = class S3Payload {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], S3Payload.prototype, "signedRequest", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], S3Payload.prototype, "url", void 0);
S3Payload = __decorate([
    type_graphql_1.ObjectType()
], S3Payload);
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 50);
    }
    linkSnippet(root) {
        if (!root.link) {
            return '';
        }
        let result = root.link.match(/^(?:(?:(([^:\/#\?]+:)?(?:(?:\/\/)(?:(?:(?:([^:@\/#\?]+)(?:\:([^:@\/#\?]*))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/i);
        if (result)
            return result[6] + result[8].slice(0, 8) + '...';
        else
            return '';
    }
    creator(post, { userLoader }) {
        return userLoader.load(post.creatorId);
    }
    voteStatus(post, { req, upvoteLoader }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const upvote = yield upvoteLoader.load({
                postId: post.id,
                userId: req.session.userId,
            });
            return upvote ? upvote.value : null;
        });
    }
    posts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const qb = typeorm_1.getConnection()
                .getRepository(Post_1.Post)
                .createQueryBuilder('p')
                .addSelect('c.id')
                .leftJoin('p.comments', 'c', 'c."postId" = p.id')
                .orderBy('p.createdAt', 'DESC')
                .take(realLimitPlusOne);
            if (cursor) {
                qb.where('p."createdAt" < :cursor', {
                    cursor: new Date(parseInt(cursor)),
                });
            }
            const posts = yield qb.getMany();
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.length === realLimitPlusOne,
            };
        });
    }
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const treeRepo = typeorm_1.getManager().getTreeRepository(Comment_1.Comment);
            const rootComments = yield treeRepo.findRoots();
            const currRoots = rootComments.filter((root) => root.postId === id);
            let finalComments = [];
            let finalCount = 0;
            for (const root of currRoots) {
                const childrenObj = yield treeRepo.findDescendantsTree(root);
                const currCount = yield treeRepo.countDescendants(root);
                root.children = childrenObj.children;
                finalComments.push(root);
                finalCount += currCount;
            }
            const post = yield Post_1.Post.findOne(id);
            return {
                content: post,
                comments: finalComments,
                length: finalCount,
            };
        });
    }
    signS3(filename, filetype) {
        return __awaiter(this, void 0, void 0, function* () {
            const s3 = new s3_1.default({
                signatureVersion: 'v4',
                region: 'us-east-1',
            });
            const s3Params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: filename,
                Expires: 60,
                ContentType: filetype,
                ACL: 'public-read',
            };
            const signedRequest = yield s3.getSignedUrl('putObject', s3Params);
            const url = `https://${process.env.CF_DOMAIN_NAME}/${filename}`;
            return {
                signedRequest,
                url,
            };
        });
    }
    createPost(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
        });
    }
    updatePost(id, title, text, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(Post_1.Post)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
                .returning('*')
                .execute();
            return result.raw[0];
        });
    }
    deletePost(id, image, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (image !== '') {
                const path = image.slice(37, image.length);
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
            yield Post_1.Post.delete({ id, creatorId: req.session.userId });
            return true;
        });
    }
    vote(postId, commentId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUpvote = value !== -1;
            const realValue = isUpvote ? 1 : -1;
            const { userId } = req.session;
            return vote_1.submitVote(postId, commentId, userId, realValue);
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", String)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Object)
], PostResolver.prototype, "linkSnippet", null);
__decorate([
    type_graphql_1.FieldResolver(() => User_1.User),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteStatus", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    type_graphql_1.Query(() => CommentsPost, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Mutation(() => S3Payload),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('filename')),
    __param(1, type_graphql_1.Arg('filetype')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "signS3", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('title')),
    __param(2, type_graphql_1.Arg('text')),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('image')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('postId', () => type_graphql_1.Int, { nullable: true })),
    __param(1, type_graphql_1.Arg('commentId', () => type_graphql_1.Int, { nullable: true })),
    __param(2, type_graphql_1.Arg('value', () => type_graphql_1.Int)),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
PostResolver = __decorate([
    type_graphql_1.Resolver(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map