
import React, {useContext} from 'react';
import {AuthContextProvider} from './src/context/GlobaContext';
import AppNavigator from './src/AppNavigator';
import {ThemeContext, ThemeProvider} from './src/context/ThemeProvider';
import { PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
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
