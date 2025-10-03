import { ApiProperty } from '@nestjs/swagger';

export class Course {
  @ApiProperty({ 
    description: 'Unique identifier for the course',
    example: 'course-123'
  })
  id: string;

  @ApiProperty({ 
    description: 'The name of the course',
    example: 'Introduction to TypeScript'
  })
  name: string;

  @ApiProperty({ 
    description: 'A detailed description of the course',
    example: 'Learn the fundamentals of TypeScript programming'
  })
  description: string;

  @ApiProperty({ 
    description: 'Number of credits for the course',
    example: 3
  })
  credits: number;

  @ApiProperty({ 
    description: 'List of prerequisite course IDs',
    example: ['course-101', 'course-102'],
    type: [String]
  })
  prerequisites: string[];
}
