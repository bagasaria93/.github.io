import React from 'react';
import { AppRegistry } from 'react-native-web';
import App from './App';

// Registering with AppRegistry mirrors exactly how a real React Native
// entry point (index.js) bootstraps the app on iOS/Android via Expo.
AppRegistry.registerComponent('HabitFlow', () => App);
AppRegistry.runApplication('HabitFlow', {
  rootTag: document.getElementById('root'),
});
