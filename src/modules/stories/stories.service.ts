import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateStoryDto,
  CreateHighlightDto,
  StoryQueryDto,
  MediaType,
} from './dto/stories.dto';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createStory(
    userId: string,
    createStoryDto: CreateStoryDto,
    mediaUrl: string,
    file?: Express.Multer.File,
  ) {
    // Get user with coach profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        coachProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is a coach
    if (user.role !== 'COACH') {
      throw new ForbiddenException('Only coaches can create stories');
    }

    if (!user.coachProfile) {
      throw new ForbiddenException('Coach profile not found');
    }

    // Determine media type from file or DTO
    let mediaType = createStoryDto.mediaType;

    if (!mediaType && file) {
      // Auto-detect media type from file mimetype
      if (file.mimetype.startsWith('image/')) {
        mediaType = MediaType.IMAGE;
      } else if (file.mimetype.startsWith('video/')) {
        mediaType = MediaType.VIDEO;
      } else {
        throw new BadRequestException(
          'Unsupported media type. Only images and videos are allowed.',
        );
      }
    }

    // Default to IMAGE if still not set
    if (!mediaType) {
      mediaType = MediaType.IMAGE;
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await this.prisma.story.create({
      data: {
        mediaUrl,
        mediaType: mediaType as any,
        authorId: user.coachProfile.id,
        expiresAt,
      },
      include: {
        author: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
    });

    return {
      data: story,
      message: 'Story created successfully',
    };
  }

  async getActiveStories(query?: StoryQueryDto) {
    const { page = '1', limit = '10' } = query || {};

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      deletedAt: null,
      expiresAt: {
        gt: new Date(), // Only get non-expired stories
      },
    };

    const coachProfile = await this.prisma.coachProfile.findUnique({
      where: { userId: query?.userId },
    });

    if (!coachProfile) {
      throw new NotFoundException('Coach profile not found');
    }

    const authorId = coachProfile.id;

    if (authorId) {
      where.authorId = authorId;
    }

    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where,
        include: {
          author: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.story.count({ where }),
    ]);

    return {
      data: stories.map((story) => ({
        ...story,
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async viewStory(storyId: string, userId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId, deletedAt: null },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.expiresAt < new Date()) {
      throw new BadRequestException('Story has expired');
    }

    // Create or update view
    await this.prisma.storyView.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        storyId,
      },
    });

    return { message: 'Story viewed successfully' };
  }

  async createHighlight(
    userId: string,
    createHighlightDto: CreateHighlightDto,
  ) {
    const { title, storyId } = createHighlightDto;

    if (!storyId) {
      throw new BadRequestException('Story ID is required');
    }

    // Get user with coach profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        coachProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'COACH') {
      throw new ForbiddenException('Only coaches can create highlights');
    }

    if (!user.coachProfile) {
      throw new ForbiddenException('Coach profile not found');
    }

    // Check if story exists and belongs to the coach
    const story = await this.prisma.story.findUnique({
      where: { id: storyId, deletedAt: null },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.authorId !== user.coachProfile.id) {
      throw new ForbiddenException(
        'You can only create highlights from your own stories',
      );
    }

    // Check if highlight already exists for this story
    const existingHighlight = await this.prisma.highlight.findUnique({
      where: { storyId, deletedAt: null },
    });

    if (existingHighlight && !existingHighlight.deletedAt) {
      throw new BadRequestException('Highlight already exists for this story');
    }

    const highlight = await this.prisma.highlight.create({
      data: {
        title,
        coverUrl: story.mediaUrl, // Always use the story's media URL as cover
        authorId: user.coachProfile.id,
        storyId,
      },
      include: {
        story: true,
        author: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Update story to mark as highlight
    await this.prisma.story.update({
      where: { id: storyId },
      data: { isHighlight: true },
    });

    return highlight;
  }

  async getHighlights(authorId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (authorId) {
      where.authorId = authorId;
    }

    const [highlights, total] = await Promise.all([
      this.prisma.highlight.findMany({
        where,
        include: {
          story: true,
          author: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.highlight.count({ where }),
    ]);

    return {
      data: highlights,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteStory(storyId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        coachProfile: true,
      },
    });

    if (!user?.coachProfile) {
      throw new ForbiddenException('Coach profile not found');
    }

    const story = await this.prisma.story.findUnique({
      where: { id: storyId, deletedAt: null },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.authorId !== user.coachProfile.id) {
      throw new ForbiddenException('You can only delete your own stories');
    }

    await this.prisma.story.update({
      where: { id: storyId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Story deleted successfully' };
  }

  async deleteHighlight(highlightId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        coachProfile: true,
      },
    });

    if (!user?.coachProfile) {
      throw new ForbiddenException('Coach profile not found');
    }

    const highlight = await this.prisma.highlight.findUnique({
      where: { id: highlightId, deletedAt: null },
    });

    if (!highlight) {
      throw new NotFoundException('Highlight not found');
    }

    if (highlight.authorId !== user.coachProfile.id) {
      throw new ForbiddenException('You can only delete your own highlights');
    }

    await this.prisma.highlight.update({
      where: { id: highlightId },
      data: { deletedAt: new Date() },
    });

    // Update the story to mark as not highlight
    await this.prisma.story.update({
      where: { id: highlight.storyId },
      data: { isHighlight: false },
    });

    return { message: 'Highlight deleted successfully' };
  }

  // Clean up expired stories (can be run as a cron job)
  async cleanupExpiredStories() {
    const expiredStories = await this.prisma.story.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        deletedAt: null,
        isHighlight: false, // Don't delete if it's a highlight
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { deletedCount: expiredStories.count };
  }

  // Get coach's own stories (including expired ones)
  async getCoachOwnStories(userId: string, page = 1, limit = 10) {
    // Get user with coach profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: { coachProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'COACH') {
      throw new ForbiddenException('Only coaches can view their own stories');
    }

    if (!user.coachProfile) {
      throw new ForbiddenException('Coach profile not found');
    }

    const skip = (page - 1) * limit;

    const [stories, total] = await this.prisma.$transaction([
      this.prisma.story.findMany({
        where: {
          authorId: user.coachProfile.id,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              views: true,
            },
          },
        },
      }),
      this.prisma.story.count({
        where: {
          authorId: user.coachProfile.id,
          deletedAt: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: stories,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Get coach's highlights
  async getCoachHighlights(userId: string, page = 1, limit = 10) {
    // Get user with coach profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: { coachProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'COACH') {
      throw new ForbiddenException(
        'Only coaches can view their own highlights',
      );
    }

    if (!user.coachProfile) {
      throw new ForbiddenException('Coach profile not found');
    }

    return this.getHighlights(user.coachProfile.id, page, limit);
  }
}
