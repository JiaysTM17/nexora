import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { Auth, Authed, SignedIn } from './auth';
import { Db, serial } from './db';
import { id } from './common';
import type { Request } from 'express';

const postInclude = {
  author: { select: { id: true, name: true } }, media: { orderBy: { position: 'asc' as const } },
  tags: { include: { product: { select: { id: true, name: true, slug: true, status: true, shop: { select: { id: true, name: true, status: true } }, variants: { where: { active: true }, select: { price: true }, take: 1 } } } } },
  comments: { where: { hidden: false }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' as const }, take: 20 },
  _count: { select: { reactions: true, saved: true, comments: { where: { hidden: false } } } },
};
@Controller('community')
export class CommunityController {
  constructor(@Inject(Db) private db: Db, @Inject(Auth) private auth: Auth) {}
  @Get('posts') async feed(@Req() req: Request) {
    const user = await this.auth.session(req);
    const posts = await this.db.post.findMany({ where: { status: 'PUBLISHED' }, include: postInclude, orderBy: { createdAt: 'desc' }, take: 30 });
    const liked = user ? await this.db.reaction.findMany({ where: { userId: user.id, postId: { in: posts.map(p => p.id) } } }) : [];
    const saved = user ? await this.db.savedPost.findMany({ where: { userId: user.id, postId: { in: posts.map(p => p.id) } } }) : [];
    return posts.map(p => ({ ...p, liked: liked.some(r => r.postId === p.id), savedByMe: saved.some(s => s.postId === p.id), tags: p.tags.map(t => ({ ...t, available: t.product.status === 'ACTIVE' && t.product.shop.status === 'APPROVED' })) }));
  }
  @Post('posts') @UseGuards(SignedIn) async create(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ caption: z.string().trim().min(5).max(2000), images: z.array(z.url().max(2000)).min(1).max(6), tags: z.array(z.object({ productId: id, mediaPosition: z.number().int().min(0).max(5), x: z.number().min(0).max(1), y: z.number().min(0).max(1) })).max(20) }).strict().parse(body);
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
    await this.visible(postId);
    const data = z.object({ reason: z.string().trim().min(5).max(1000) }).strict().parse(body);
    return this.db.report.create({ data: { ...data, postId, userId: req.user.id } });
  }
  @Post('users/:id/follow') @UseGuards(SignedIn) async follow(@Req() req: Authed, @Param('id') followedId: string) {
    if (followedId === req.user.id || !await this.db.user.findUnique({ where: { id: followedId } })) throw new NotFoundException('Tài khoản theo dõi không hợp lệ');
    return this.db.follow.upsert({ where: { followerId_followedId: { followerId: req.user.id, followedId } }, create: { followerId: req.user.id, followedId }, update: {} });
  }
  @Delete('users/:id/follow') @UseGuards(SignedIn) async unfollow(@Req() req: Authed, @Param('id') followedId: string) { await this.db.follow.deleteMany({ where: { followerId: req.user.id, followedId } }); return { ok: true }; }
}
