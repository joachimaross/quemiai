"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let CoursesService = class CoursesService {
    constructor() {
        this.courses = [
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
    }
    findAll() {
        return this.courses;
    }
    findOne(id) {
        const course = this.courses.find((course) => course.id === id);
        if (!course) {
            throw new common_1.NotFoundException(`Course with ID "${id}" not found`);
        }
        return course;
    }
    create(courseData) {
        const newCourse = {
            id: (0, uuid_1.v4)(),
            ...courseData,
        };
        this.courses.push(newCourse);
        return newCourse;
    }
    update(id, courseData) {
        const courseIndex = this.courses.findIndex((course) => course.id === id);
        if (courseIndex === -1) {
            throw new common_1.NotFoundException(`Course with ID "${id}" not found`);
        }
        this.courses[courseIndex] = {
            ...this.courses[courseIndex],
            ...courseData,
        };
        return this.courses[courseIndex];
    }
    delete(id) {
        const courseIndex = this.courses.findIndex((course) => course.id === id);
        if (courseIndex === -1) {
            throw new common_1.NotFoundException(`Course with ID "${id}" not found`);
        }
        this.courses.splice(courseIndex, 1);
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)()
], CoursesService);
//# sourceMappingURL=courses.service.js.map