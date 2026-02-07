import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  deactivateAccount: () => api.post('/auth/deactivate')
};

export const ideaAPI = {
  createIdea: (data) => api.post('/ideas', data),
  getIdeas: (params) => api.get('/ideas', { params }),
  getIdeaById: (id) => api.get(`/ideas/${id}`),
  updateIdea: (id, data) => api.put(`/ideas/${id}`, data),
  deleteIdea: (id) => api.delete(`/ideas/${id}`),
  reviewIdea: (id, data) => api.post(`/ideas/${id}/review`, data),
  getSimilarIdeas: (id) => api.get(`/ideas/${id}/similar`),
  getAiInsights: (id) => api.get(`/ideas/${id}/ai-insights`),
  mergeIdeas: (data) => api.post('/ideas/merge', data),
  getStudentStats: () => api.get('/ideas/stats/student'),
  getTeacherStats: () => api.get('/ideas/stats/teacher'),
  addComment: (id, data) => api.post(`/ideas/${id}/comments`, data),
  getComments: (id) => api.get(`/ideas/${id}/comments`),
  deleteComment: (id, commentId) => api.delete(`/ideas/${id}/comments/${commentId}`)
};

export const groupAPI = {
  createGroup: (data) => api.post('/groups', data),
  getGroups: () => api.get('/groups'),
  getGroupById: (id) => api.get(`/groups/${id}`),
  inviteToGroup: (id, data) => api.post(`/groups/${id}/invite`, data),
  acceptInvite: (id) => api.post(`/groups/${id}/accept`),
  rejectInvite: (id) => api.post(`/groups/${id}/reject`),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  joinByCode: (data) => api.post('/groups/join-by-code', data)
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemStats: () => api.get('/admin/stats'),
  reviewIdea: (id, data) => api.post(`/admin/ideas/${id}/review`, data),
  mergeIdeas: (data) => api.post('/admin/ideas/merge', data),
  getStudentActivity: (studentId) => api.get(`/admin/students/${studentId}/activity`),
  assignAdminRole: (studentId) => api.post(`/admin/users/${studentId}/assign-admin`),
  removeAdminRole: (adminId) => api.post(`/admin/users/${adminId}/remove-admin`)
};

export const teacherAPI = {
  getStudents: () => api.get('/teacher/students')
};

export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  sendMessageWithFile: (formData) => api.post('/messages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getGroupMessages: (groupId, params) => api.get(`/messages/${groupId}`, { params }),
  markMessageAsRead: (messageId) => api.put(`/messages/${messageId}/read`)
};

export default api;
