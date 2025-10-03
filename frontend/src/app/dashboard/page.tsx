'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCourses, addCourse, updateCourse, deleteCourse } from '@/lib/apiClient';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';

interface Course {
  id: string;
  name: string;
  description: string;
  credits: number;
  prerequisites: string[];
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: 0,
    prerequisites: '',
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getCurrentUser((user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchCourses();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({ name: '', description: '', credits: 0, prerequisites: '' });
    setShowModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      credits: course.credits,
      prerequisites: course.prerequisites.join(', '),
    });
    setShowModal(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
      setError('');
    } catch (err: any) {
      setError('Failed to delete course');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courseData = {
      name: formData.name,
      description: formData.description,
      credits: Number(formData.credits),
      prerequisites: formData.prerequisites
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p),
    };

    try {
      if (editingCourse) {
        const response = await updateCourse(editingCourse.id, courseData);
        setCourses(courses.map((c) => (c.id === editingCourse.id ? response.data : c)));
      } else {
        const response = await addCourse(courseData);
        setCourses([...courses, response.data]);
      }
      setShowModal(false);
      setError('');
    } catch (err: any) {
      setError(`Failed to ${editingCourse ? 'update' : 'add'} course`);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white font-heading">Courses</h2>
          <button
            onClick={handleAddCourse}
            className="px-6 py-3 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Add Course
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No courses found. Add your first course!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold text-white mb-6 font-heading">
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-300 mb-2">
                  Credits
                </label>
                <input
                  type="number"
                  id="credits"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-300 mb-2">
                  Prerequisites (comma-separated)
                </label>
                <input
                  type="text"
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
                  placeholder="e.g., Introduction to CS, Data Structures"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {editingCourse ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
