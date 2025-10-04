import axios from 'axios';

const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000' 
});

export const getHello = () => api.get('/getHello');
export const healthCheck = () => api.get('/healthCheck');
export const getCourses = () => api.get('/courses');
export const getCourse = (id: string) => api.get(`/courses/${id}`);
export const addCourse = (data: any) => api.post('/courses', data);
export const updateCourse = (id: string, data: any) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id: string) => api.delete(`/courses/${id}`);

export default api;
