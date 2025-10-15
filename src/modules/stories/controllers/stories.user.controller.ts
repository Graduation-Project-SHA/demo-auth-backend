import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoriesService } from '../stories.service';
import { StoryQueryDto } from '../dto/stories.dto';

@Controller('stories')
@UseGuards(AuthGuard('jwt-access'))
export class StoriesUserController {
  constructor(private readonly storiesService: StoriesService) {}

  // Get active stories feed (from followed coaches)
  // @Get()
  // async getActiveStories(@Request() req, @Query() query: StoryQueryDto) {
  //   return this.storiesService.getActiveStories(req.user.id, query);
  // }

  // Get stories from specific coach
  @Get('coach/:userId')
  async getCoachStories(
    @Request() req,
    @Param('userId') userId: string,
    @Query() query: StoryQueryDto,
  ) {
    const queryWithAuthor = { ...query, userId: userId };
    return this.storiesService.getActiveStories(queryWithAuthor);
  }

  // View a story
  @Post(':storyId/view')
  async viewStory(@Request() req, @Param('storyId') storyId: string) {
    return this.storiesService.viewStory(storyId, req.user.id);
  }

  // Get highlights from all coaches (public)
  @Get('highlights')
  async getHighlights(
    @Query('authorId') authorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.storiesService.getHighlights(authorId, pageNum, limitNum);
  }

  // Get highlights from specific coach
  @Get('highlights/coach/:coachId')
  async getCoachHighlights(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.storiesService.getHighlights(userId, pageNum, limitNum);
  }
}
