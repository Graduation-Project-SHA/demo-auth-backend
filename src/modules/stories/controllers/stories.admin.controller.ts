import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsActiveGuard } from 'src/modules/auth/guards/is-active.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permission.guard';
import {
  RequireRead,
  RequireDelete,
} from 'src/modules/auth/decorator/permission.decorator';
import { StoriesService } from '../stories.service';
import { StoryQueryDto } from '../dto/stories.dto';

@Controller('admin/stories')
@UseGuards(AuthGuard('jwt-access'), IsActiveGuard, PermissionsGuard)
export class StoriesAdminController {
  constructor(private readonly storiesService: StoriesService) {}

  // @Get()
  // @RequireRead('posts')
  // async getAllStories(@Query() query: StoryQueryDto) {
  //   // Use getActiveStories but show all (including expired for admin)
  //   return this.storiesService.getActiveStories(undefined, query);
  // }

  @Get('stats')
  @RequireRead('posts')
  async getStoriesStats() {
    // We'll implement this later - for now return basic info
    return { message: 'Stories statistics - to be implemented' };
  }

  @Get('highlights')
  @RequireRead('posts')
  async getAllHighlights(
    @Query('authorId') authorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.storiesService.getHighlights(authorId, pageNum, limitNum);
  }

  @Delete(':storyId')
  @RequireDelete('posts')
  async deleteStory(@Param('storyId') storyId: string) {
    // Use regular deleteStory - admin doesn't need user check
    return this.storiesService.deleteStory(storyId, 'admin');
  }

  @Delete('highlights/:highlightId')
  @RequireDelete('posts')
  async deleteHighlight(@Param('highlightId') highlightId: string) {
    // Use regular deleteHighlight - admin doesn't need user check
    return this.storiesService.deleteHighlight(highlightId, 'admin');
  }

  @Get('cleanup-expired')
  @RequireDelete('posts')
  async cleanupExpiredStories() {
    return this.storiesService.cleanupExpiredStories();
  }
}
