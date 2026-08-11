export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: number[];
  createdAt: string;
}

export interface AppData {
  habits: Habit[];
  // completions[dateISO] = array of habitIds completed that day
  completions: Record<string, string[]>;
  darkMode: boolean;
}
