import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native-web';
import { useApp } from '../context/AppContext';

export type ScreenName = 'today' | 'habits' | 'stats' | 'settings';

const TABS: { key: ScreenName; label: string; icon: string }[] = [
  { key: 'today', label: 'Hari Ini', icon: '✓' },
  { key: 'habits', label: 'Kebiasaan', icon: '☰' },
  { key: 'stats', label: 'Statistik', icon: '📊' },
  { key: 'settings', label: 'Atur', icon: '⚙' },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: ScreenName;
  onChange: (s: ScreenName) => void;
}) {
  const { theme } = useApp();
  return (
    <View style={[styles.nav, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <TouchableOpacity key={t.key} style={styles.tab} onPress={() => onChange(t.key)}>
            <Text style={[styles.icon, { color: isActive ? theme.primary : theme.inkDim }]}>{t.icon}</Text>
            <Text style={[styles.label, { color: isActive ? theme.primary : theme.inkDim, fontWeight: isActive ? '800' : '600' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  icon: {
    fontSize: 17,
    marginBottom: 2,
  },
  label: {
    fontSize: 10.5,
  },
});
