import { Injectable, NotFoundException } from '@nestjs/common';
import { Course } from './course.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CoursesService {
  private courses: Course[] = [
    {
      id: '1',
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science and programming',
      credits: 4,
      prerequisites: [],
    },
    {
      id: '2',
      name: 'Data Structures',
      description: 'Study of common data structures and algorithms',
      credits: 4,
      prerequisites: ['Introduction to Computer Science'],
    },
  ];

  findAll(): Course[] {
    return this.courses;
  }

  findOne(id: string): Course {
    const course = this.courses.find((course) => course.id === id);
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    return course;
  }

  create(courseData: Omit<Course, 'id'>): Course {
    const newCourse: Course = {
      id: uuidv4(),
      ...courseData,
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  update(id: string, courseData: Partial<Omit<Course, 'id'>>): Course {
    const courseIndex = this.courses.findIndex((course) => course.id === id);
    if (courseIndex === -1) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    this.courses[courseIndex] = {
      ...this.courses[courseIndex],
      ...courseData,
    };
    return this.courses[courseIndex];
  }

  delete(id: string): void {
    const courseIndex = this.courses.findIndex((course) => course.id === id);
    if (courseIndex === -1) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    this.courses.splice(courseIndex, 1);
  }
}
