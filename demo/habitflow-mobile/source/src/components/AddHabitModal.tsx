import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native-web';
import { useApp } from '../context/AppContext';
import { WEEKDAY_LABELS } from '../utils';

const ICONS = ['💧', '🏃', '📚', '🌙', '🧘', '🥗', '💊', '✍️', '🎯', '🎸', '🚭', '💰'];
const COLORS = ['#0d9488', '#f97316', '#8b5cf6', '#0ea5e9', '#ef4444', '#10b981', '#ec4899', '#eab308'];

export default function AddHabitModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme, addHabit } = useApp();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (day: number) => {
    setFrequency((f) => (f.includes(day) ? f.filter((d) => d !== day) : [...f, day].sort()));
  };

  const handleSave = () => {
    if (!name.trim() || frequency.length === 0) return;
    addHabit({ name: name.trim(), icon, color, frequency });
    setName('');
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setFrequency([0, 1, 2, 3, 4, 5, 6]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.ink }]}>Kebiasaan Baru</Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.bg }]}>
                <Text style={{ color: theme.ink, fontSize: 15 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.inkDim }]}>NAMA KEBIASAAN</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="mis. Meditasi 10 menit"
              placeholderTextColor={theme.inkDim}
              style={[styles.input, { borderColor: theme.border, color: theme.ink, backgroundColor: theme.bg }]}
            />

            <Text style={[styles.label, { color: theme.inkDim, marginTop: 16 }]}>ICON</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[
                    styles.iconBtn,
                    { borderColor: ic === icon ? color : theme.border, backgroundColor: ic === icon ? color + '22' : theme.bg },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.inkDim, marginTop: 16 }]}>WARNA</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c, borderWidth: c === color ? 3 : 0, borderColor: theme.ink },
                  ]}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: theme.inkDim, marginTop: 16 }]}>HARI PENGULANGAN</Text>
            <View style={styles.dayRow}>
              {WEEKDAY_LABELS.map((label, idx) => {
                const active = frequency.includes(idx);
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => toggleDay(idx)}
                    style={[
                      styles.dayBtn,
                      { backgroundColor: active ? color : theme.bg, borderColor: active ? color : theme.border },
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: active ? 'white' : theme.inkDim }}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: name.trim() ? 1 : 0.5 }]}
              disabled={!name.trim()}
            >
              <Text style={styles.saveBtnText}>Simpan Kebiasaan</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,15,15,0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85vh' as any,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '800' },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  input: { borderWidth: 1.5, borderRadius: 13, paddingVertical: 11, paddingHorizontal: 14, fontSize: 14, marginTop: 6 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  dayBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1.5 },
  saveBtn: { marginTop: 22, marginBottom: 8, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },
});
