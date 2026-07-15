import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native-web';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav, { ScreenName } from './components/BottomNav';
import TodayScreen from './screens/TodayScreen';
import HabitsScreen from './screens/HabitsScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';

function Shell() {
  const { theme } = useApp();
  const [screen, setScreen] = useState<ScreenName>('today');

  let ScreenComponent: React.ReactNode = null;
  if (screen === 'today') ScreenComponent = <TodayScreen />;
  else if (screen === 'habits') ScreenComponent = <HabitsScreen />;
  else if (screen === 'stats') ScreenComponent = <StatsScreen />;
  else ScreenComponent = <SettingsScreen />;

  return (
    <View style={[styles.appShell, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>{ScreenComponent}</View>
        <BottomNav active={screen} onChange={setScreen} />
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    maxWidth: 440,
    width: '100%',
    marginLeft: 'auto' as any,
    marginRight: 'auto' as any,
    minHeight: '100vh' as any,
    boxShadow: '0 0 60px rgba(0,0,0,0.1)' as any,
  },
});
