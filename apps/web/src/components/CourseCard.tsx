'use client';

interface Course {
  id: string;
  name: string;
  description: string;
  credits: number;
  prerequisites: string[];
}

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export default function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-zeeky-blue transition-colors">
      <h3 className="text-xl font-bold text-white mb-2 font-heading">{course.name}</h3>
      <p className="text-gray-300 mb-4">{course.description}</p>
      <div className="mb-4">
        <p className="text-sm text-gray-400">Credits: {course.credits}</p>
        {course.prerequisites.length > 0 && (
          <p className="text-sm text-gray-400">
            Prerequisites: {course.prerequisites.join(', ')}
          </p>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(course)}
          className="px-4 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(course.id)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
