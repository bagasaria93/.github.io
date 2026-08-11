import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native-web';
import { useApp } from '../context/AppContext';
import AddHabitModal from '../components/AddHabitModal';
import { calcStreak, WEEKDAY_LABELS, dayPillTextColor } from '../utils';

export default function HabitsScreen() {
  const { theme, data, deleteHabit } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.ink }]}>Semua Kebiasaan</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.addBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.addBtnText}>+ Baru</Text>
          </TouchableOpacity>
        </View>

        {data.habits.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 30, marginBottom: 10 }}>📋</Text>
            <Text style={{ color: theme.inkDim, fontSize: 13, textAlign: 'center' }}>
              Belum ada kebiasaan. Tekan "+ Baru" untuk menambahkan.
            </Text>
          </View>
        )}

        {data.habits.map((h) => {
          const streak = calcStreak(h, data.completions);
          return (
            <View key={h.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: h.color + '22' }]}>
                  <Text style={{ fontSize: 19 }}>{h.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[styles.name, { color: theme.ink }]}>{h.name}</Text>
                  <Text style={[styles.streakLine, { color: theme.inkDim }]}>
                    🔥 Streak {streak} hari
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setConfirmDeleteId(confirmDeleteId === h.id ? null : h.id)}
                  accessibilityLabel={`Hapus kebiasaan ${h.name}`}
                  style={[styles.deleteBtn, { backgroundColor: theme.bg }]}
                >
                  <Text style={{ color: theme.danger, fontSize: 13 }}>🗑</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dayIndicatorRow}>
                {WEEKDAY_LABELS.map((label, idx) => {
                  const active = h.frequency.includes(idx);
                  return (
                    <View
                      key={label}
                      style={[
                        styles.dayPill,
                        { backgroundColor: active ? h.color : theme.bg, borderColor: active ? h.color : theme.border },
                      ]}
                    >
                      <Text style={{ fontSize: 9.5, fontWeight: '700', color: active ? dayPillTextColor(h.color) : theme.inkDim }}>
                        {label[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {confirmDeleteId === h.id && (
                <View style={[styles.confirmRow, { borderTopColor: theme.border }]}>
                  <Text style={{ color: theme.inkDim, fontSize: 11.5, flex: 1 }}>Hapus kebiasaan ini?</Text>
                  <TouchableOpacity onPress={() => setConfirmDeleteId(null)} style={styles.confirmBtnGhost}>
                    <Text style={{ color: theme.inkDim, fontSize: 12, fontWeight: '700' }}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      deleteHabit(h.id);
                      setConfirmDeleteId(null);
                    }}
                    style={[styles.confirmBtnDanger, { backgroundColor: theme.danger }]}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <AddHabitModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800' },
  addBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
  addBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 50 },
  card: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '700' },
  streakLine: { fontSize: 11.5, marginTop: 2 },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayIndicatorRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dayPill: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  confirmRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  confirmBtnGhost: { paddingVertical: 6, paddingHorizontal: 10 },
  confirmBtnDanger: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 9 },
});
