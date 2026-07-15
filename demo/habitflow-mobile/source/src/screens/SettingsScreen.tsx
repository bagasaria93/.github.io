import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Platform } from 'react-native-web';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { theme, data, toggleDarkMode, resetAll, exportJSON } = useApp();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={[styles.title, { color: theme.ink }]}>Pengaturan</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowLabel, { color: theme.ink }]}>Mode Gelap</Text>
            <Text style={[styles.rowSub, { color: theme.inkDim }]}>Tampilan gelap untuk mata yang lebih nyaman</Text>
          </View>
          <Switch
            value={data.darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <Text style={[styles.rowLabel, { color: theme.ink, marginBottom: 4 }]}>Data</Text>
        <Text style={[styles.rowSub, { color: theme.inkDim, marginBottom: 12 }]}>
          Semua data tersimpan lokal di perangkat ini, tidak ada server yang terlibat.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={exportJSON} style={[styles.btn, { borderColor: theme.border }]}>
            <Text style={{ color: theme.ink, fontSize: 12.5, fontWeight: '700' }}>Export JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetAll} style={[styles.btn, { borderColor: theme.danger }]}>
            <Text style={{ color: theme.danger, fontSize: 12.5, fontWeight: '700' }}>Reset Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <Text style={[styles.rowLabel, { color: theme.ink, marginBottom: 6 }]}>Tentang HabitFlow</Text>
        <Text style={[styles.rowSub, { color: theme.inkDim, lineHeight: 18 }]}>
          HabitFlow v1.0{'\n'}
          Dibangun dengan React Native (react-native-web) oleh Bagas Aria Sativa.{'\n'}
          Source code menggunakan komponen native asli (View, Text, TouchableOpacity,{'\n'}
          Modal, Switch) — bukan HTML biasa — dan bisa dijalankan sebagai app iOS/Android{'\n'}
          native lewat Expo/React Native CLI tanpa perubahan logika.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
        <Text style={[styles.rowSub, { color: theme.inkDim }]}>Platform runtime saat ini: {Platform.OS}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13.5, fontWeight: '700' },
  rowSub: { fontSize: 11.5, marginTop: 3, maxWidth: 240 },
  btn: { flex: 1, borderWidth: 1.5, borderRadius: 11, paddingVertical: 10, alignItems: 'center' },
});
