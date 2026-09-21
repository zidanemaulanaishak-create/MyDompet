import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStorage } from './authStorage';

export const authStorage: AuthStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};