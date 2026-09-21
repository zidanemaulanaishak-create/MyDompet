import type { AuthStorage } from './storage';

function getLocalStorage(): Storage {
  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage hanya tersedia di browser.');
  }
  return localStorage;
}

export const storage: AuthStorage = {
  async getItem(key) {
    return getLocalStorage().getItem(key);
  },
  async setItem(key, value) {
    getLocalStorage().setItem(key, value);
  },
  async removeItem(key) {
    getLocalStorage().removeItem(key);
  },
};