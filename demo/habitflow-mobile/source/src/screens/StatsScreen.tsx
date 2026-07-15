import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native-web';
import { useApp } from '../context/AppContext';
import { calcStreak, isoDate, lastNDates, longestStreakAcrossHabits, weeklyCompletionRate } from '../utils';

export default function StatsScreen() {
  const { theme, data } = useApp();
  const rate = weeklyCompletionRate(data.habits, data.completions);
  const longest = longestStreakAcrossHabits(data.habits, data.completions);
  const days = lastNDates(7);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={[styles.title, { color: theme.ink }]}>Statistik</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{rate}%</Text>
          <Text style={[styles.statLabel, { color: theme.inkDim }]}>Konsistensi Minggu Ini</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.accent }]}>{longest}</Text>
          <Text style={[styles.statLabel, { color: theme.inkDim }]}>Streak Terpanjang</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.ink }]}>{data.habits.length}</Text>
          <Text style={[styles.statLabel, { color: theme.inkDim }]}>Total Kebiasaan</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.ink }]}>Peta Aktivitas 7 Hari</Text>
      <View style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {data.habits.length === 0 ? (
          <Text style={{ color: theme.inkDim, fontSize: 12.5, textAlign: 'center', paddingVertical: 20 }}>
            Belum ada data untuk ditampilkan
          </Text>
        ) : (
          <>
            <View style={styles.gridHeaderRow}>
              <View style={{ width: 90 }} />
              {days.map((d) => (
                <View key={isoDate(d)} style={styles.gridHeaderCell}>
                  <Text style={{ fontSize: 9.5, fontWeight: '700', color: theme.inkDim }}>
                    {d.toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 2)}
                  </Text>
                </View>
              ))}
            </View>
            {data.habits.map((h) => (
              <View key={h.id} style={styles.gridRow}>
                <View style={{ width: 90, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13 }}>{h.icon}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 10.5, color: theme.ink, fontWeight: '600', flexShrink: 1 }}>
                    {h.name}
                  </Text>
                </View>
                {days.map((d) => {
                  const iso = isoDate(d);
                  const scheduled = h.frequency.includes(d.getDay());
                  const done = (data.completions[iso] || []).includes(h.id);
                  return (
                    <View key={iso} style={styles.gridHeaderCell}>
                      <View
                        style={[
                          styles.cell,
                          {
                            backgroundColor: !scheduled ? 'transparent' : done ? h.color : theme.border,
                            opacity: !scheduled ? 0 : 1,
                          },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </View>

      <View style={[styles.streakList, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.ink, marginBottom: 10 }]}>Streak per Kebiasaan</Text>
        {data.habits.map((h) => (
          <View key={h.id} style={styles.streakItem}>
            <Text style={{ fontSize: 14 }}>{h.icon}</Text>
            <Text style={{ flex: 1, fontSize: 12.5, color: theme.ink, fontWeight: '600', marginLeft: 8 }}>{h.name}</Text>
            <Text style={{ fontSize: 12.5, fontWeight: '800', color: theme.accent }}>🔥 {calcStreak(h, data.completions)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 9.5, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 10 },
  gridCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 20 },
  gridHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  gridHeaderCell: { width: 26, alignItems: 'center' },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cell: { width: 16, height: 16, borderRadius: 5 },
  streakList: { borderRadius: 16, borderWidth: 1, padding: 14 },
  streakItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
});
