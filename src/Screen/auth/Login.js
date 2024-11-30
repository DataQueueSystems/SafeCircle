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
  ScrollView,
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
import firestore, {doc} from '@react-native-firebase/firestore';

export default function Login({route}) {
  let {selectedRole} = route.params;
  let theme = useTheme();
  const {setIsLogin, Checknetinfo, setUserDetail} = useAuthContext();
  let navigation = useNavigation();
  // State for email and password inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spinner, setSpinner] = useState(false);

  const CheckDataBase = async () => {
    setSpinner(true);
    let isConnected = await Checknetinfo();
    if (!isConnected) {
      setSpinner(false);
      return;
    }
    try {
      const snapShot = await firestore().collection('users').get();
      if (snapShot.empty) {
        showToast('No user found');
        return;
      }

      let userDoc = snapShot.docs.find(doc => {
        const data = doc.data();
        return data.email == email && data.password == password;
      });
      if (!userDoc) {
        setSpinner(false);
        showToast('Invalid email or password');
      } else {
        let userData = {id: userDoc.id, ...userDoc.data()};
        if (userData?.role != selectedRole) {
          showToast('Invalid email or password');
          setSpinner(false);
          return;
        }
        if (userData?.Status === 'Deleted') {
          showToast('User not found ');
          setSpinner(false);
          return;
        } else {
          await setUserDetail(userData);
          await AsyncStorage.setItem('token', userData.id);
          AsyncStorage.setItem('IsLogin', 'true');
          setIsLogin(false);
        }
      }
    } catch (error) {
      showToast('Something went wrong');
    }
  };

  const handleLogin = async () => {
    setSpinner(true);
    if (!email || !password) {
      showToast('All fields are required !');
      setSpinner(false);
      return;
    }

    const isConnected = await Checknetinfo();
    if (!isConnected) {
      setSpinner(false);
      return;
    }

    await CheckDataBase();
  };
  let screenName = 'Login';
  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <>
      <Header screenName={screenName} />
      <View
        style={[
          styles.mainContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
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
              style={{
                marginTop: 10,
                textAlign: 'center',
                marginHorizontal: 10,
              }}>
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
              style={[
                styles.btn,
                {backgroundColor: theme.colors.onBackground},
              ]}>
              {spinner ? (
                <ActivityIndicator size={24} color={theme.colors.background} />
              ) : (
                <BoldText style={{color: theme.colors.background}}>
                  Login
                </BoldText>
              )}
            </Button>
          </View>

          {selectedRole == 'user' && (
            <View
              style={{
                marginVertical: 2,
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <LightText>Don't have an account? </LightText>
              <TouchableOpacity onPress={handleRegister}>
                <RegularText style={{color: theme.colors.blue}}>
                  Register
                </RegularText>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoContainer}>
            <RegularText style={[styles.infoText, {color: 'grey'}]}>
              🌍 Stay Safe!
              {'\n\n'}
              Corona diagnostic tests are important to detect early symptoms.
              Get tested regularly to protect yourself and others.
              {'\n\n'}
              💉 Remember to follow safety protocols: wear masks, maintain
              social distancing, and sanitize frequently.
            </RegularText>
          </View>
        </ScrollView>
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'grey',
    margin: 10,
    marginBottom: 50,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
