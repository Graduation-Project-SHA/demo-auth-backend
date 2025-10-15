import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { StoriesService } from '../stories.service';
import {
  CreateStoryDto,
  CreateHighlightDto,
  StoryQueryDto,
} from '../dto/stories.dto';

@Controller('coaches/stories')
@UseGuards(AuthGuard('jwt-access'))
export class StoriesCoachController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // Create new story (coaches only)
  @Post()
  @UseInterceptors(FileInterceptor('media'))
  async createStory(
    @Request() req,
    @Body() createStoryDto: CreateStoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Media file is required for stories');
    }

    const mediaUrl = await this.fileUploadService.uploadFile(file, 'stories');

    return this.storiesService.createStory(
      req.user.id,
      createStoryDto,
      mediaUrl,
      file,
    );
  }

  // Get my stories
  @Get('my-stories')
  async getMyStories(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const userId = req.user.id;

    return this.storiesService.getCoachOwnStories(userId, pageNum, limitNum);
  }

  // Delete my story
  @Delete(':storyId')
  async deleteStory(@Param('storyId') storyId: string, @Request() req) {
    const userId = req.user.id;
    return this.storiesService.deleteStory(storyId, userId);
  }

  // Create highlight from my story
  @Post(':storyId/highlight')
  async createHighlight(
    @Param('storyId') storyId: string,
    @Body() createHighlightDto: CreateHighlightDto,
    @Request() req,
  ) {
    const userId = req.user.id;
     
    const highlightData = { ...createHighlightDto, storyId };
    return this.storiesService.createHighlight(userId, highlightData);
  }

  // Get my highlights
  @Get('highlights')
  async getMyHighlights(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Request() req,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const userId = req.user.id;

    return this.storiesService.getCoachHighlights(userId, pageNum, limitNum);
  }

  // Delete my highlight
  @Delete('highlights/:highlightId')
  async deleteHighlight(
    @Param('highlightId') highlightId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.storiesService.deleteHighlight(highlightId, userId);
  }
}
