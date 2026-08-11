import { Platform } from 'react-native-web';
import { AppData } from './types';
import { isoDate } from './utils';

const STORAGE_KEY = 'habitflow_data_v1';

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Minum 2L Air', icon: '💧', color: '#0ea5e9', frequency: [0, 1, 2, 3, 4, 5, 6], createdAt: new Date().toISOString() },
  { id: 'h2', name: 'Olahraga 20 Menit', icon: '🏃', color: '#f97316', frequency: [1, 3, 5], createdAt: new Date().toISOString() },
  { id: 'h3', name: 'Baca Buku', icon: '📚', color: '#8b5cf6', frequency: [0, 1, 2, 3, 4, 5, 6], createdAt: new Date().toISOString() },
  { id: 'h4', name: 'Tidur Sebelum Jam 11', icon: '🌙', color: '#0d9488', frequency: [0, 1, 2, 3, 4, 5, 6], createdAt: new Date().toISOString() },
];

function seedCompletions(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const today = new Date();
  for (let i = 1; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = isoDate(d);
    const ids = ['h1', 'h3', 'h4'];
    if (i % 2 === 0) ids.push('h2');
    out[iso] = ids;
  }
  return out;
}

/**
 * Storage abstraction. This web build persists via localStorage.
 * In a native Expo/React Native build, swap this for
 * @react-native-async-storage/async-storage with the same read/write shape.
 */
export function loadData(): AppData {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    // ignore parse errors, fall through to defaults
  }
  return {
    habits: DEFAULT_HABITS,
    completions: seedCompletions(),
    darkMode: false,
  };
}

export function saveData(data: AppData) {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    // storage full or unavailable — fail silently, app still works in-memory
  }
}
