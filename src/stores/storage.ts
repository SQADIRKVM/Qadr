import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, StateStorage } from 'zustand/middleware';

export const asyncStorage: StateStorage = {
  getItem: async (name) => AsyncStorage.getItem(name),
  setItem: async (name, value) => AsyncStorage.setItem(name, value),
  removeItem: async (name) => AsyncStorage.removeItem(name),
};

export const createPersistStorage = () => createJSONStorage(() => asyncStorage);
