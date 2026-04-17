import api from '../api';

const user = {
  getAll: () => api.get('/user/get-all'),
  getById: (id: number) => api.get(`/user/id/${id}`),
  // update: (id: string, data: any) => api.put(`/user/update/${id}`, data),
  remove: (id: number) => api.delete(`/user/remove/${id}`),
};

export default user;
