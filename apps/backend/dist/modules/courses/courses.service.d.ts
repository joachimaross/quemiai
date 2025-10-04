import { Course } from './course.entity';
export declare class CoursesService {
    private courses;
    findAll(): Course[];
    findOne(id: string): Course;
    create(courseData: Omit<Course, 'id'>): Course;
    update(id: string, courseData: Partial<Omit<Course, 'id'>>): Course;
    delete(id: string): void;
}
