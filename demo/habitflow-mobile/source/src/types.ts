export type HabitColor = {
  id: string;
  bg: string;
  fg: string;
};

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji, kept dependency-free (no icon font needed)
  color: string;
  frequency: number[]; // 0=Sun..6=Sat, days this habit is scheduled
  createdAt: string; // ISO date
  reminderTime?: string; // "HH:mm"
}

export interface AppData {
  habits: Habit[];
  // completions[dateISO] = array of habitIds completed that day
  completions: Record<string, string[]>;
  darkMode: boolean;
}
