import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of courses', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', () => {
      const courses = service.findAll();
      const course = service.findOne(courses[0].id);
      expect(course).toBeDefined();
      expect(course.id).toBe(courses[0].id);
    });

    it('should throw NotFoundException for invalid id', () => {
      expect(() => service.findOne('invalid-id')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new course', () => {
      const courseData = {
        name: 'Test Course',
        description: 'Test Description',
        credits: 3,
        prerequisites: [],
      };
      const course = service.create(courseData);
      expect(course).toBeDefined();
      expect(course.id).toBeDefined();
      expect(course.name).toBe(courseData.name);
    });
  });

  describe('update', () => {
    it('should update a course', () => {
      const courses = service.findAll();
      const updateData = { name: 'Updated Name' };
      const updated = service.update(courses[0].id, updateData);
      expect(updated.name).toBe(updateData.name);
    });

    it('should throw NotFoundException for invalid id', () => {
      expect(() => service.update('invalid-id', { name: 'Test' })).toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a course', () => {
      const courses = service.findAll();
      const initialLength = courses.length;
      service.delete(courses[0].id);
      const afterDelete = service.findAll();
      expect(afterDelete.length).toBe(initialLength - 1);
    });

    it('should throw NotFoundException for invalid id', () => {
      expect(() => service.delete('invalid-id')).toThrow(NotFoundException);
    });
  });
});
