import { Habit } from './types';

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return isoDate(new Date());
}

export function dayLabel(d: Date): string {
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}

export const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function isScheduledToday(habit: Habit, date: Date = new Date()): boolean {
  return habit.frequency.includes(date.getDay());
}

/** Last N dates (including today), oldest first. */
export function lastNDates(n: number): Date[] {
  const out: Date[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

/**
 * Current streak (consecutive scheduled days completed, counting back from today).
 * A scheduled day that hasn't happened yet today doesn't break the streak.
 */
export function calcStreak(habit: Habit, completions: Record<string, string[]>): number {
  let streak = 0;
  const cursor = new Date();
  // walk backwards day by day
  for (let i = 0; i < 3650; i++) {
    const iso = isoDate(cursor);
    const scheduled = habit.frequency.includes(cursor.getDay());
    if (scheduled) {
      const done = (completions[iso] || []).includes(habit.id);
      if (done) {
        streak++;
      } else if (iso === todayISO()) {
        // today not done yet, doesn't break streak — just don't count it
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
    if (streak === 0 && iso !== todayISO() && !scheduled) continue;
    if (i > 400) break; // safety cap
  }
  return streak;
}

export function weeklyCompletionRate(habits: Habit[], completions: Record<string, string[]>): number {
  const days = lastNDates(7);
  let scheduled = 0;
  let done = 0;
  days.forEach((d) => {
    const iso = isoDate(d);
    habits.forEach((h) => {
      if (h.frequency.includes(d.getDay())) {
        scheduled++;
        if ((completions[iso] || []).includes(h.id)) done++;
      }
    });
  });
  if (scheduled === 0) return 0;
  return Math.round((done / scheduled) * 100);
}

export function longestStreakAcrossHabits(habits: Habit[], completions: Record<string, string[]>): number {
  return habits.reduce((max, h) => Math.max(max, calcStreak(h, completions)), 0);
}

export function uid(): string {
  return 'h_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
