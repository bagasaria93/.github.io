import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native-web';
import { useApp } from '../context/AppContext';
import HabitRow from '../components/HabitRow';
import AddHabitModal from '../components/AddHabitModal';
import { isScheduledToday, todayISO } from '../utils';

export default function TodayScreen() {
  const { theme, data } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const scheduledToday = data.habits.filter((h) => isScheduledToday(h));
  const doneIds = data.completions[todayISO()] || [];
  const doneCount = scheduledToday.filter((h) => doneIds.includes(h.id)).length;
  const pct = scheduledToday.length ? Math.round((doneCount / scheduledToday.length) * 100) : 0;

  const todayLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.inkDim }]}>Halo 👋</Text>
          <Text style={[styles.dateLabel, { color: theme.ink }]}>{todayLabel}</Text>
        </View>

        <View style={[styles.progressCard, { backgroundColor: theme.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressLabel}>Progress Hari Ini</Text>
            <Text style={styles.progressCount}>
              {doneCount} / {scheduledToday.length} kebiasaan
            </Text>
          </View>
          <View style={styles.progressRingWrap}>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
        </View>

        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: theme.primary }]} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Kebiasaan Terjadwal</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={[styles.addLink, { color: theme.primary }]}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {scheduledToday.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 26, marginBottom: 8 }}>🌱</Text>
              <Text style={{ color: theme.inkDim, fontSize: 12.5, textAlign: 'center' }}>
                Tidak ada kebiasaan terjadwal hari ini
              </Text>
            </View>
          ) : (
            scheduledToday.map((h) => <HabitRow key={h.id} habit={h} />)
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Tambah kebiasaan baru"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddHabitModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  header: { marginBottom: 16 },
  greeting: { fontSize: 12, fontWeight: '600' },
  dateLabel: { fontSize: 18, fontWeight: '800', marginTop: 2, textTransform: 'capitalize' },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
  },
  progressLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
  progressCount: { color: 'white', fontSize: 16, fontWeight: '800', marginTop: 4 },
  progressRingWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPct: { color: 'white', fontWeight: '800', fontSize: 14 },
  barTrack: { height: 6, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.06)', marginBottom: 22, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  addLink: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14 },
  empty: { alignItems: 'center', paddingVertical: 30 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(13,148,136,0.4)',
  } as any,
  fabText: { color: 'white', fontSize: 26, fontWeight: '400', marginTop: -2 },
});
