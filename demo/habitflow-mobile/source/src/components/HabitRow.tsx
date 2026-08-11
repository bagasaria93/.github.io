import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native-web';
import { Habit } from '../types';
import { useApp } from '../context/AppContext';
import { calcStreak, todayISO } from '../utils';

export default function HabitRow({ habit }: { habit: Habit }) {
  const { theme, data, toggleCompletion } = useApp();
  const doneToday = (data.completions[todayISO()] || []).includes(habit.id);
  const streak = calcStreak(habit, data.completions);

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <TouchableOpacity
        onPress={() => toggleCompletion(habit.id)}
        accessibilityLabel={doneToday ? `Tandai ${habit.name} belum selesai` : `Tandai ${habit.name} selesai`}
        style={[
          styles.checkbox,
          {
            backgroundColor: doneToday ? habit.color : 'transparent',
            borderColor: doneToday ? habit.color : theme.border,
          },
        ]}
      >
        {doneToday ? <Text style={styles.checkmark}>✓</Text> : null}
      </TouchableOpacity>

      <View style={[styles.iconWrap, { backgroundColor: habit.color + '22' }]}>
        <Text style={{ fontSize: 17 }}>{habit.icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            { color: theme.ink, textDecorationLine: doneToday ? 'line-through' : 'none', opacity: doneToday ? 0.55 : 1 },
          ]}
        >
          {habit.name}
        </Text>
        <Text style={[styles.freq, { color: theme.inkDim }]}>
          {habit.frequency.length === 7 ? 'Setiap hari' : `${habit.frequency.length}x seminggu`}
        </Text>
      </View>

      {streak > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  freq: {
    fontSize: 11,
    marginTop: 2,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  streakText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#f97316',
  },
});
