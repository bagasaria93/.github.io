import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppData, Habit } from '../types';
import { loadData, saveData } from '../storage';
import { getTheme, Theme } from '../theme';
import { todayISO, uid } from '../utils';

interface AppContextValue {
  data: AppData;
  theme: Theme;
  toggleDarkMode: () => void;
  toggleCompletion: (habitId: string, dateISO?: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  resetAll: () => void;
  exportJSON: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const theme = useMemo(() => getTheme(data.darkMode), [data.darkMode]);

  const toggleDarkMode = () => setData((d) => ({ ...d, darkMode: !d.darkMode }));

  const toggleCompletion = (habitId: string, dateISO: string = todayISO()) => {
    setData((d) => {
      const current = d.completions[dateISO] || [];
      const has = current.includes(habitId);
      const next = has ? current.filter((id) => id !== habitId) : [...current, habitId];
      return { ...d, completions: { ...d.completions, [dateISO]: next } };
    });
  };

  const addHabit: AppContextValue['addHabit'] = (habit) => {
    setData((d) => ({
      ...d,
      habits: [...d.habits, { ...habit, id: uid(), createdAt: new Date().toISOString() }],
    }));
  };

  const updateHabit = (id: string, patch: Partial<Habit>) => {
    setData((d) => ({
      ...d,
      habits: d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));
  };

  const deleteHabit = (id: string) => {
    setData((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) }));
  };

  const resetAll = () => {
    setData((d) => ({ habits: [], completions: {}, darkMode: d.darkMode }));
  };

  const exportJSON = () => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habitflow-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const value: AppContextValue = {
    data,
    theme,
    toggleDarkMode,
    toggleCompletion,
    addHabit,
    updateHabit,
    deleteHabit,
    resetAll,
    exportJSON,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
