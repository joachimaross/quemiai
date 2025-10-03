import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiPropertyOptional({ 
    description: 'The name of the course',
    example: 'Advanced TypeScript'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ 
    description: 'A detailed description of the course',
    example: 'Advanced TypeScript concepts and patterns'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Number of credits for the course',
    example: 4,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credits?: number;

  @ApiPropertyOptional({ 
    description: 'List of prerequisite course IDs',
    example: ['course-201', 'course-202'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];
}
