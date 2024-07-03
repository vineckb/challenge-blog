import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @Inject('MESSAGE_BROKER') private readonly client: ClientProxy,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { authorId } = createArticleDto;
    const author = (await firstValueFrom(
      this.client.send({ cmd: 'get_user' }, { userId: authorId }),
    )) as { name: string };

    if (!author) {
      throw new Error('Author not found');
    }

    const createdArticle = new this.articleModel({
      ...createArticleDto,
      authorName: author.name,
    });

    return createdArticle.save();
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.find().exec();
  }

  async findOne(id: string): Promise<Article> {
    return this.articleModel.findById(id).exec();
  }

  async update(
    id: string,
    updateArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.articleModel.findByIdAndDelete(id).exec();
  }

  @EventPattern('user_updated')
  async handleUserUpdatedEvent(user: any) {
    await this.articleModel
      .updateMany({ authorId: user.id }, { authorName: user.name })
      .exec();
  }
}
