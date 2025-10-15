import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export class CreateStoryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;
}

export class CreateHighlightDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  storyId?: string; // Made optional since it comes from URL param
}

export class StoryQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '10';
}
