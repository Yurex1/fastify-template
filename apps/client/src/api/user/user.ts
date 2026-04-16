import api from '../api';

const user = {
  getAll: () => api.get('/user/get-all'),
  getById: (id: string) => api.get(`/user/id/${id}`),
  // update: (id: string, data: any) => api.put(`/user/update/${id}`, data),
  remove: (id: string) => api.delete(`/user/remove/${id}`),
};

export default user;
