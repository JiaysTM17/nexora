import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Inject, NotFoundException, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { Auth, Authed, SignedIn } from './auth';
import { Db, serial } from './db';
import { id } from './common';
import { evaluateOOTDSpatialDispersion, rankCommunityFeedEdgeRank } from './algorithms';
import type { Request } from 'express';

const postInclude = {
  author: { select: { id: true, name: true } }, media: { orderBy: { position: 'asc' as const } },
  tags: { include: { product: { select: { id: true, name: true, slug: true, status: true, shop: { select: { id: true, name: true, status: true } }, variants: { where: { active: true }, select: { id: true, price: true, inventory: { select: { onHand: true, reserved: true } } }, take: 10 } } } } },
  comments: { where: { hidden: false }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' as const }, take: 20 },
  _count: { select: { reactions: true, saved: true, comments: { where: { hidden: false } } } },
};
@Controller('community')
export class CommunityController {
  constructor(@Inject(Db) private db: Db, @Inject(Auth) private auth: Auth) {}
  @Get('posts') async feed(@Req() req: Request, @Query('sort') sort?: string) {
    const user = await this.auth.session(req);
    const posts = await this.db.post.findMany({ where: { status: 'PUBLISHED' }, include: postInclude, orderBy: { createdAt: 'desc' }, take: 30 });
    const postIds = posts.map(p => p.id);
    const [liked, saved, follows, openReports] = await Promise.all([
      user ? this.db.reaction.findMany({ where: { userId: user.id, postId: { in: postIds } } }) : Promise.resolve([]),
      user ? this.db.savedPost.findMany({ where: { userId: user.id, postId: { in: postIds } } }) : Promise.resolve([]),
      user ? this.db.follow.findMany({ where: { followerId: user.id }, select: { followedId: true } }) : Promise.resolve([]),
      postIds.length ? this.db.report.groupBy({ by: ['postId'], where: { postId: { in: postIds }, status: 'OPEN' }, _count: { _all: true } }) : Promise.resolve([]),
    ]);
    const reportMap = new Map(openReports.map(r => [r.postId, r._count._all]));
    const enriched = posts.map(p => {
      const tags = p.tags.map(t => ({ ...t, available: t.product.status === 'ACTIVE' && t.product.shop.status === 'APPROVED' }));
      return {
        ...p,
        liked: liked.some(r => r.postId === p.id),
        savedByMe: saved.some(s => s.postId === p.id),
        tags,
      };
    });

    const rankedMeta = rankCommunityFeedEdgeRank({
      posts: enriched.map(p => ({
        postId: p.id,
        authorId: p.authorId,
        createdAtMs: p.createdAt.getTime(),
        reactionsCount: p._count.reactions,
        savesCount: p._count.saved,
        commentsCount: p._count.comments,
        activeProductTagsCount: p.tags.filter(t => t.available).length,
        openReportsCount: reportMap.get(p.id) ?? 0,
      })),
      followedAuthorIds: follows.map(f => f.followedId),
    });
    const scoreMap = new Map(rankedMeta.map(r => [r.postId, r]));
    const withScores = enriched.map(p => ({
      ...p,
      edgeRankScore: scoreMap.get(p.id)?.edgeRankScore ?? 0,
    }));

    if (sort === 'trending') {
      const orderIdx = new Map(rankedMeta.map((r, i) => [r.postId, i]));
      withScores.sort((a, b) => (orderIdx.get(a.id) ?? 999) - (orderIdx.get(b.id) ?? 999));
    }
    return withScores;
  }
  @Post('posts') @UseGuards(SignedIn) async create(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ caption: z.string().trim().min(5).max(2000), images: z.array(z.url().max(2000)).min(1).max(6), tags: z.array(z.object({ productId: id, mediaPosition: z.number().int().min(0).max(5), x: z.number().min(0).max(1), y: z.number().min(0).max(1) })).max(20) }).strict().parse(body);
    const seenTagKeys = new Set<string>();
    for (const tag of data.tags) {
      const tagKey = `${tag.productId}:${tag.mediaPosition}`;
      if (seenTagKeys.has(tagKey)) throw new BadRequestException('Một sản phẩm không thể gắn trùng 2 lần trên cùng một ảnh');
      seenTagKeys.add(tagKey);
    }
    return serial(this.db, async tx => {
      for (const tag of data.tags) {
        if (tag.mediaPosition >= data.images.length || !await tx.product.findFirst({ where: { id: tag.productId, status: 'ACTIVE', shop: { status: 'APPROVED' } } })) throw new NotFoundException('Ảnh hoặc sản phẩm được gắn không hợp lệ');
      }
      return tx.post.create({ data: { authorId: req.user.id, caption: data.caption, media: { create: data.images.map((url, position) => ({ url, position })) }, tags: { create: data.tags } }, include: postInclude });
    });
  }
  private async visible(postId: string) {
    if (!await this.db.post.findFirst({ where: { id: postId, status: 'PUBLISHED' } })) throw new NotFoundException('Bài viết không còn công khai');
  }
  @Post('posts/:id/like') @UseGuards(SignedIn) async like(@Req() req: Authed, @Param('id') postId: string) {
    await this.visible(postId);
    return this.db.reaction.upsert({ where: { userId_postId: { userId: req.user.id, postId } }, create: { userId: req.user.id, postId }, update: {} });
  }
  @Delete('posts/:id/like') @UseGuards(SignedIn) async unlike(@Req() req: Authed, @Param('id') postId: string) { await this.db.reaction.deleteMany({ where: { userId: req.user.id, postId } }); return { ok: true }; }
  @Post('posts/:id/save') @UseGuards(SignedIn) async save(@Req() req: Authed, @Param('id') postId: string) {
    await this.visible(postId);
    return this.db.savedPost.upsert({ where: { userId_postId: { userId: req.user.id, postId } }, create: { userId: req.user.id, postId }, update: {} });
  }
  @Delete('posts/:id/save') @UseGuards(SignedIn) async unsave(@Req() req: Authed, @Param('id') postId: string) { await this.db.savedPost.deleteMany({ where: { userId: req.user.id, postId } }); return { ok: true }; }
  @Get('saved') @UseGuards(SignedIn) saved(@Req() req: Authed) { return this.db.savedPost.findMany({ where: { userId: req.user.id, post: { status: 'PUBLISHED' } }, include: { post: { include: postInclude } }, take: 50 }); }
  @Post('posts/:id/comments') @UseGuards(SignedIn) async comment(@Req() req: Authed, @Param('id') postId: string, @Body() body: unknown) {
    await this.visible(postId);
    const data = z.object({ body: z.string().trim().min(1).max(1000) }).strict().parse(body);
    return this.db.comment.create({ data: { ...data, postId, userId: req.user.id } });
  }
  @Post('posts/:id/report') @UseGuards(SignedIn) async report(@Req() req: Authed, @Param('id') postId: string, @Body() body: unknown) {
    const post = await this.db.post.findFirst({ where: { id: postId, status: 'PUBLISHED' }, select: { id: true, authorId: true } });
    if (!post) throw new NotFoundException('Bài viết không còn công khai');
    if (post.authorId === req.user.id) throw new BadRequestException('Không thể tự báo cáo bài viết của chính mình');
    const data = z.object({ reason: z.string().trim().min(5).max(1000) }).strict().parse(body);
    const existingOpen = await this.db.report.findFirst({ where: { postId, userId: req.user.id, status: 'OPEN' } });
    if (existingOpen) return existingOpen;
    return this.db.report.create({ data: { ...data, postId, userId: req.user.id } });
  }
  @Post('spatial-validate')
  validateSpatialCoordinates(@Body() body: unknown) {
    const data = z.object({
      tags: z.array(z.object({
        productId: z.string(),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
      })),
      minAllowedDistance: z.number().optional().default(0.08),
    }).passthrough().parse(body ?? {});
    return evaluateOOTDSpatialDispersion(data.tags, data.minAllowedDistance);
  }

  @Post('users/:id/follow') @UseGuards(SignedIn) async follow(@Req() req: Authed, @Param('id') followedId: string) {
    if (followedId === req.user.id || !await this.db.user.findUnique({ where: { id: followedId } })) throw new NotFoundException('Tài khoản theo dõi không hợp lệ');
    return this.db.follow.upsert({ where: { followerId_followedId: { followerId: req.user.id, followedId } }, create: { followerId: req.user.id, followedId }, update: {} });
  }
  @Delete('users/:id/follow') @UseGuards(SignedIn) async unfollow(@Req() req: Authed, @Param('id') followedId: string) { await this.db.follow.deleteMany({ where: { followerId: req.user.id, followedId } }); return { ok: true }; }

  @Delete('posts/:id') @UseGuards(SignedIn) async deletePost(@Req() req: Authed, @Param('id') postId: string) {
    return serial(this.db, async tx => {
      const post = await tx.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true, status: true } });
      if (!post) throw new NotFoundException('Không tìm thấy bài viết');
      if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new ForbiddenException('Bạn chỉ có thể xóa bài viết của chính mình');
      }
      if (post.status !== 'HIDDEN') {
        await tx.post.update({ where: { id: postId }, data: { status: 'HIDDEN' } });
        await tx.auditLog.create({ data: { actorId: req.user.id, action: 'COMMUNITY_POST_DELETE', entityId: postId, data: {} } });
      }
      return { ok: true, deletedId: postId };
    });
  }

  @Delete('comments/:id') @UseGuards(SignedIn) async deleteComment(@Req() req: Authed, @Param('id') commentId: string) {
    return serial(this.db, async tx => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        select: { id: true, userId: true, hidden: true, post: { select: { authorId: true } } },
      });
      if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
      const canDelete = comment.userId === req.user.id || comment.post.authorId === req.user.id || req.user.role === 'ADMIN';
      if (!canDelete) throw new ForbiddenException('Bạn không có quyền ẩn/xóa bình luận này');
      if (!comment.hidden) {
        await tx.comment.update({ where: { id: commentId }, data: { hidden: true } });
      }
      return { ok: true, deletedId: commentId };
    });
  }
}
