import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of courses', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', () => {
      const courses = service.findAll();
      const course = controller.findOne(courses[0].id);
      expect(course).toBeDefined();
      expect(course.id).toBe(courses[0].id);
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
      const course = controller.create(courseData);
      expect(course).toBeDefined();
      expect(course.name).toBe(courseData.name);
    });
  });

  describe('update', () => {
    it('should update a course', () => {
      const courses = service.findAll();
      const updateData = { name: 'Updated Name' };
      const updated = controller.update(courses[0].id, updateData);
      expect(updated.name).toBe(updateData.name);
    });
  });

  describe('delete', () => {
    it('should delete a course', () => {
      const courseData = {
        name: 'Test Course to Delete',
        description: 'Test Description',
        credits: 3,
        prerequisites: [],
      };
      const course = service.create(courseData);
      controller.delete(course.id);
      // Verify it was deleted by checking service directly
      expect(() => service.findOne(course.id)).toThrow();
    });
  });
});
