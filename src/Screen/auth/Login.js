import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import BoldText from '../../customText/BoldText';
import {Button, useTheme} from 'react-native-paper';
import LightText from '../../customText/LightText';
import RegularText from '../../customText/RegularText';
import {useNavigation} from '@react-navigation/native';
import Header from '../../Component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthContext} from '../../context/GlobaContext';
import axios from 'axios';
import {showToast} from '../../../utils/Toast';

export default function Login() {
  let theme = useTheme();
  const {setIsLogin, Checknetinfo} = useAuthContext();
  let navigation = useNavigation();
  // State for email and password inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spinner, setSpinner] = useState(false);

  const handleLogin = async () => {
    const isConnected = await Checknetinfo();
    if (!isConnected) {
      setSpinner(false);
      return;
    }
    let data = {
      email,
      password,
    };
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  let screenName = 'Login';
  return (
    <>
    
      <Header screenName={screenName} />
      <View
        style={[
          styles.mainContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        {/* Heading */}

        <View style={styles.headingContainer}>
          <View style={styles.imageView}>
            <Image
              source={require('../../../assets/Logo/logo.png')}
              style={styles.image}
            />
          </View>
          <BoldText style={styles.authHead}>Welcome Back To</BoldText>
          <BoldText style={styles.authHead}>Safe Circle</BoldText>
          <LightText
            style={{marginTop: 10, textAlign: 'center', marginHorizontal: 10}}>
            Please sign in to continue or create a new account.
          </LightText>
        </View>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.onBackground,
                borderColor: theme.colors.onBackground,
              },
            ]}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.onBackground,
                borderColor: theme.colors.onBackground,
              },
            ]}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            onPress={spinner ? () => {} : handleLogin}
            mode="contained"
            style={[styles.btn, {backgroundColor: theme.colors.onBackground}]}>
            {spinner ? (
              <ActivityIndicator size={24} color={theme.colors.background} />
            ) : (
              <BoldText style={{color: theme.colors.background}}>
                Login
              </BoldText>
            )}
          </Button>
        </View>

        <View style={styles.infoContainer}>
          <RegularText style={styles.infoText}>
            🌍 Stay Safe!
            {'\n\n'}
            Corona diagnostic tests are important to detect early symptoms. Get
            tested regularly to protect yourself and others.
            {'\n\n'}
            💉 Remember to follow safety protocols: wear masks, maintain social
            distancing, and sanitize frequently.
          </RegularText>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  imageView: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  headingContainer: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    marginTop: 20,
  },

  authHead: {
    fontSize: 26,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginVertical: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  btn: {
    padding: 4,
    marginTop: 20,
  },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e0f7fa', // Light cyan to indicate safety info
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b2ebf2',
    margin: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#00796b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
