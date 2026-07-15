# HabitFlow - React Native Habit Tracker

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

HabitFlow adalah aplikasi pelacak kebiasaan harian (habit tracker) yang dibangun dengan React Native, menggunakan komponen native asli seperti `View`, `Text`, `TouchableOpacity`, `Modal`, `Switch`, dan `FlatList`-style list rendering — bukan elemen HTML biasa. Source code aslinya ada di folder `source/` dan bisa dijalankan tanpa perubahan logika di Expo atau React Native CLI untuk menghasilkan aplikasi iOS/Android native sungguhan.

Untuk keperluan demo di browser (GitHub Pages adalah static hosting, tidak bisa menjalankan Android/iOS emulator), source ini di-compile ke web bundle menggunakan `react-native-web` — library resmi yang juga dipakai Expo secara internal untuk web support — dan di-bundle dengan esbuild. File `index.html` dan `bundle.js` di folder ini adalah hasil compile tersebut.

## Tech Stack

- React Native (via react-native-web) — komponen native: View, Text, TouchableOpacity, Modal, Switch, ScrollView, SafeAreaView, StyleSheet, Platform
- React 18 + TypeScript
- React Context API untuk state management
- esbuild untuk bundling ke web
- localStorage untuk persistence pada build web (di native build, tinggal ganti ke `@react-native-async-storage/async-storage` dengan interface yang sama)

## Fitur

- 4 layar dengan bottom tab navigation: Hari Ini, Kebiasaan, Statistik, Pengaturan
- Tambah kebiasaan baru dengan pilihan icon, warna, dan hari pengulangan custom
- Checklist harian dengan progress bar dan ring persentase
- Perhitungan streak (rentetan hari berturut-turut) otomatis per kebiasaan
- Peta aktivitas 7 hari terakhir bergaya contribution graph
- Statistik konsistensi mingguan dan streak terpanjang
- Mode gelap dengan native `Switch` component
- Export data ke JSON dan reset data
- Konfirmasi sebelum menghapus kebiasaan

## Struktur Source

```
source/
├── package.json
├── build.js              # esbuild bundler config
└── src/
    ├── App.tsx            # root component + tab shell
    ├── index.tsx          # entry point (AppRegistry.registerComponent)
    ├── types.ts
    ├── theme.ts            # light/dark palette
    ├── storage.ts          # persistence layer
    ├── utils.ts            # streak & date calculations
    ├── context/
    │   └── AppContext.tsx  # global state via React Context
    ├── components/
    │   ├── BottomNav.tsx
    │   ├── HabitRow.tsx
    │   └── AddHabitModal.tsx
    └── screens/
        ├── TodayScreen.tsx
        ├── HabitsScreen.tsx
        ├── StatsScreen.tsx
        └── SettingsScreen.tsx
```

## Catatan

Ini bukan sekadar website yang dibuat terlihat seperti aplikasi mobile. Source code-nya memakai API dan paradigma komponen React Native yang sesungguhnya (bukan `<div>`/`<span>`), sehingga kode yang sama bisa langsung dipakai untuk build native iOS/Android lewat Expo tanpa menulis ulang logika aplikasi — hanya perlu mengganti entry point web dengan entry point native standar Expo.
