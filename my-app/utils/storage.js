import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export const storage = {
  set: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },

  get: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  clearAuth: async () => {
    try {
      const keys = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER, STORAGE_KEYS.ROLE];
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
};