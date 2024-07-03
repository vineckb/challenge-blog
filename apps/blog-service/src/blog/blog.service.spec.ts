import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogService } from './blog.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article, ArticleDocument } from './schemas/article.schema';
import { ClientProxy } from '@nestjs/microservices';

import { TestBed } from '@automock/jest';

describe('BlogService', () => {
  let blogService: BlogService;
  let articleModel: jest.Mocked<Model<ArticleDocument>>;
  let clientProxy: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(BlogService).compile();

    blogService = unit;
    articleModel = unitRef.get(getModelToken(Article.name));
    clientProxy = unitRef.get('MESSAGE_BROKER');
  });

  describe('create', () => {
    it('should create an article and return it', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'My Article',
        content: 'Lorem ipsum dolor sit amet',
        authorId: '123456789',
      };

      const result = await blogService.create(createArticleDto);

      expect(clientProxy.send).toHaveBeenCalledWith(
        { cmd: 'get_user' },
        { userId: createArticleDto.authorId },
      );
      expect(articleModel.prototype.save).toHaveBeenCalledWith({
        ...createArticleDto,
        authorName: 'John Doe',
      });
      expect(result).toEqual({
        title: 'My Article',
        content: 'Lorem ipsum dolor sit amet',
        authorId: '123456789',
        authorName: 'John Doe',
      });
    });

    it('should throw an error if author is not found', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'My Article',
        content: 'Lorem ipsum dolor sit amet',
        authorId: '123456789',
      };

      await expect(blogService.create(createArticleDto)).rejects.toThrow(
        'Author not found',
      );
    });
  });
});
