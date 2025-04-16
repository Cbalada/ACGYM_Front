import { storage } from '../utils/storage';
import { api } from './api';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

export const authService = {
  login: async (usuario, contrasena) => {
    try {
      const data = await api.post(API_CONFIG.ENDPOINTS.LOGIN, { usuario, contrasena });
      const { token, usuario: user, role } = data;

      await Promise.all([
        storage.set(STORAGE_KEYS.AUTH_TOKEN, token),
        storage.set(STORAGE_KEYS.USER, user),
        storage.set(STORAGE_KEYS.ROLE, role),
      ]);

      return { success: true, token, usuario: user, role };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  },

  logout: async () => {
    await storage.clearAuth();
  },

  getToken: () => storage.get(STORAGE_KEYS.AUTH_TOKEN),
  
  getUserRole: () => storage.get(STORAGE_KEYS.ROLE),
};