import type { ChangePassword, SignIn, SignUp } from '../types';
import type { Session } from '../types';
import api from '../api';

const auth = {
  signUp: async (data: SignUp) => {
    const response = await api.post('/auth/sign-up', { json: data }).json<Session>();
    return response;
  },

  signIn: async (data: SignIn) => {
    const response = await api.post('/auth/sign-in', { json: data }).json<Session>();
    return response;
  },
  signOut: async () => {
    const response = await api.post('/auth/sign-out', { json: {} }).json();
    return response;
  },

  changePassword: async (data: ChangePassword) => {
    const response = await api.put('/auth/change-password', { json: data }).json();
    return response;
  },
  refresh: async () => {
    const response = await api.post('/auth/refresh', { json: {} }).json<Session>();
    return response;
  },
};

export default auth;
