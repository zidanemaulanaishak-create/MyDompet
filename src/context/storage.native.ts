import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStorage } from './storage';

export const storage: AuthStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};