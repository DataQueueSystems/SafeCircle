import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './Screen/auth/Login';
import onBoardingScreen from './Screen/onBoarding/onBoardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthContext} from './context/GlobaContext';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ActivityIndicator, useTheme} from 'react-native-paper';
import Parent from './Screen/Parent';
import ControlUser from './Screen/Admin/ControlUser';
import Register from './Screen/auth/Register';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const {isLogin, setIsLogin} = useAuthContext();

  let theme = useTheme();
  useEffect(() => {
    AsyncStorage.getItem('IsLogin').then(value => {
      if (!value) {
        setIsLogin(true);
      }
    });
  }, []);

  const Spinner = ({navigation}) => {
    // const navigation = useNavigation();
    useEffect(() => {
      const timer = setTimeout(() => {
        navigation.navigate('Parent');
      }, 100);
      // Clean up the timer if the component unmounts before the delay
      return () => clearTimeout(timer);
    }, [navigation]);
    return (
      <>
        <SafeAreaView style={[styles.container]}>
          <ActivityIndicator
            color={theme.colors.onBackground}
            size="large"
            style={[styles.loader]}
          />
        </SafeAreaView>
      </>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLogin ? (
          <>
            <Stack.Screen
              name="Onboarding"
              component={onBoardingScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Spinner"
              component={Spinner}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Parent"
              component={Parent}
              options={{headerShown: false}}
            />

            <Stack.Screen
              name="ControlUser"
              component={ControlUser}
              options={{headerShown: false}}
            />
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1d', // Dark royal theme
    justifyContent: 'center',
    alignItems: 'center',
  },
});
