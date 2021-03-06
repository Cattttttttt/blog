import * as path from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';

import { BlogPostPath, BlogPostIgnore } from './constants';

export interface PostsDetail {
  title: string;
  description: string;
  categories: string[];
  createdAt: number;
  banner?: string;
  filename: string;
}

export const getPostLists = (): string[] =>
  fs
    .readdirSync(BlogPostPath)
    .filter((filename) => /.+\.md$/.test(filename))
    .filter((filename) => !BlogPostIgnore.includes(filename));

export const getPostsDetail = (offset = 0, pageSize = 10): PostsDetail[] =>
  getPostLists()
    .sort((a, b) =>
      new Date(fs.statSync(path.join(BlogPostPath, a)).birthtime) <
      new Date(fs.statSync(path.join(BlogPostPath, b)).birthtime)
        ? 1
        : -1
    )
    .slice(offset, pageSize ? offset + pageSize : undefined)
    .map((file) => {
      const frontMatter = matter(
        fs.readFileSync(path.join(BlogPostPath, file), 'utf-8')
      );
      return {
        title: frontMatter.data.title as string,
        description:
          (frontMatter.data?.description as string | undefined) ||
          `${frontMatter.content.slice(0, 50)}${
            frontMatter.content.length > 50 ? '...' : ''
          }`,
        createdAt: fs.statSync(path.join(BlogPostPath, file)).birthtimeMs,
        categories:
          (frontMatter.data?.categories as string[] | undefined) || [],
        filename: file,
        banner: (frontMatter.data?.banner as string | undefined) ?? '',
      };
    });

export const getPostsDetailByTag = (
  tag: string
): Omit<PostsDetail, 'banner' | 'categories' | 'description'>[] =>
  getPostsDetail(0, 0)
    .filter((post) => (tag ? post.categories.includes(tag) : true))
    .map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { categories, banner, description, ...rest } = item;
      return rest;
    });
