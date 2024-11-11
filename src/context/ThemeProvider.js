import React, {createContext, useState, useEffect, useMemo} from 'react';
import {Appearance} from 'react-native';
import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
} from 'react-native-paper';

// Define custom themes with onboarding background colors
const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f2f2f2',
    error: '#d9534f',
    onboardingBackground1: '#A6D9B3', // Very Light Green, symbolizing health and safety
    onboardingBackground2: '#C8E6D8', // Soft Mint Green, giving a calm and clean feel
    onboardingBackground3: '#E0F3EC', // Very Light Pastel Green, soothing and gentle
    blue: '#4a51a3', // Deep Blue
  },
  roundness: 9,
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1a1c1e',
    error: '#d9534f',
    onboardingBackground1: '#E8F5E9', // Mint Green
    onboardingBackground2: '#d1eed4', // Mint Green
    onboardingBackground3: '#9fbba2', // Mint Green
    blue: '#4a51a3', // Deep Blue
  },
  roundness: 9,
};

const ThemeContext = createContext();

const ThemeProvider = ({children}) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    // Update theme when system theme changes
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const currentTheme = useMemo(() => {
    return theme === 'dark' ? darkTheme : lightTheme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{theme: currentTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export {ThemeContext, ThemeProvider};
