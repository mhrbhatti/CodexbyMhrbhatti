import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  updateClass: (enrolledClass) => API.put('/auth/update-class', { enrolledClass }),
};

export const classAPI = {
  getClasses: () => API.get('/classes'),
};

export const chapterAPI = {
  getChapters: (classNo) => API.get(`/chapters/${classNo}`),
};

export const mcqAPI = {
  getMCQs: (classNo, chapterNo, limit = 0) => API.get(`/mcqs/${classNo}/${chapterNo}${limit > 0 ? `?limit=${limit}` : ''}`),
  submitAnswers: (data) => API.post('/mcqs/submit', data),
};

export const resultAPI = {
  saveResult: (data) => API.post('/results', data),
  getResults: () => API.get('/results'),
  getResult: (id) => API.get(`/results/${id}`),
};

export default API;
