import { CoursesService } from './courses.service';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAll(): Course[];
    findOne(id: string): Course;
    create(createCourseDto: CreateCourseDto): Course;
    update(id: string, updateCourseDto: UpdateCourseDto): Course;
    delete(id: string): void;
}
