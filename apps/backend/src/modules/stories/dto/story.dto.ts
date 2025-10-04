import { IsString, IsUrl, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateStoryDto {
  @IsUUID()
  authorId: string;

  @IsUrl()
  mediaUrl: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class StoryResponseDto {
  id: string;
  authorId: string;
  mediaUrl: string;
  audioUrl?: string;
  createdAt: Date;
  expiresAt: Date;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export class StoryReactionDto {
  @IsUUID()
  storyId: string;

  @IsUUID()
  userId: string;

  @IsString()
  emoji: string;
}

export class StoryReplyDto {
  @IsUUID()
  storyId: string;

  @IsUUID()
  userId: string;

  @IsString()
  content: string;
}
