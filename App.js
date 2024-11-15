import React, {useContext, useEffect} from 'react';
import {AuthContextProvider} from './src/context/GlobaContext';
import AppNavigator from './src/AppNavigator';
import {ThemeContext, ThemeProvider} from './src/context/ThemeProvider';
import {PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default function App() {
  return (
    <>
      <GestureHandlerRootView style={{flex: 1}}>
        <ThemeProvider>
          <AppWithTheme />
        </ThemeProvider>
      </GestureHandlerRootView>
    </>
  );
}

function AppWithTheme() {
  const {theme} = useContext(ThemeContext);
  if (!theme) {
    return null; // or a loading spinner if desired
  }

  return (
    <>
      <AuthContextProvider>
        <PaperProvider theme={theme}>
          <AppNavigator />
        </PaperProvider>
      </AuthContextProvider>
    </>
  );
}
