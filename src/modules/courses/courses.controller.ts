import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all courses',
    description: 'Retrieves a list of all available courses'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of courses returned successfully',
    type: [Course]
  })
  findAll(): Course[] {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a course by ID',
    description: 'Retrieves a specific course by its ID'
  })
  @ApiParam({ name: 'id', description: 'Course ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Course found and returned successfully',
    type: Course
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found'
  })
  findOne(@Param('id') id: string): Course {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new course',
    description: 'Creates a new course with the provided details'
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Course created successfully',
    type: Course
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  create(@Body() createCourseDto: CreateCourseDto): Course {
    return this.coursesService.create(createCourseDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update a course',
    description: 'Updates an existing course with the provided details'
  })
  @ApiParam({ name: 'id', description: 'Course ID', type: 'string' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Course updated successfully',
    type: Course
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Course {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete a course',
    description: 'Deletes a course by its ID'
  })
  @ApiParam({ name: 'id', description: 'Course ID', type: 'string' })
  @ApiResponse({ 
    status: 204, 
    description: 'Course deleted successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found'
  })
  delete(@Param('id') id: string): void {
    this.coursesService.delete(id);
  }
}
