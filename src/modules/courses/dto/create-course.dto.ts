import { IsString, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ 
    description: 'The name of the course',
    example: 'Introduction to TypeScript'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'A detailed description of the course',
    example: 'Learn the fundamentals of TypeScript programming'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Number of credits for the course',
    example: 3,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  credits: number;

  @ApiProperty({ 
    description: 'List of prerequisite course IDs',
    example: ['course-101', 'course-102'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];
}
