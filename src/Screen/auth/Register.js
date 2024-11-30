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
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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

export default function Register() {
  let theme = useTheme();
  const {setIsLogin, Checknetinfo, location, fetchLocation} = useAuthContext();
  let navigation = useNavigation();
  const [spinner, setSpinner] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    aadhar_number: '',
    coordination: {
      latitude: '',
      longitude: '',
    },
  });

  const handleChange = (field, value) => {
    setForm(prevForm => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const CheckDataBase = async () => {
    setSpinner(true);
    let isConnected = await Checknetinfo();
    if (!isConnected) {
      setSpinner(false);
      return false;
    }

    try {
      const snapShot = await firestore().collection('users').get();
      if (snapShot.empty) {
        showToast('No user found');
        setSpinner(false);
        return false;
      }

      // Flags to track existence of each field
      let emailExists = false;
      let contactExists = false;
      let aadharExists = false;

      // Check each document for matches on the given fields
      snapShot.docs.forEach(doc => {
        const data = doc.data();
        if (data.email === form.email) emailExists = true;
        if (data.contactNumber === form.contactNumber) contactExists = true;
        if (data.aadhar_number === form.aadhar_number) aadharExists = true;
      });

      let newErrors = {};
      // Display relevant messages for each existing field
      if (emailExists) newErrors.email = 'Email already exists.';
      if (contactExists)
        newErrors.contactNumber = 'Contact number already exists.';
      if (aadharExists)
        newErrors.aadhar_number = 'Aadhaar number already exists.';
      setErrors(newErrors);

      setSpinner(false);
      // If any of the fields exist, return false; otherwise, return true
      return !(emailExists || contactExists || aadharExists);
    } catch (error) {
      showToast('Something went wrong');
      setSpinner(false);
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.aadhar_number)
      newErrors.aadhar_number = 'Aadhar number is required';
    if (!form.contactNumber)
      newErrors.contactNumber = 'Contact number is required';
    else if (!/^\d{10}$/.test(form.contactNumber))
      newErrors.contactNumber = 'Contact number must be 10 digits';
    setErrors(newErrors);
    setSpinner(false);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const InitialLocation = async () => {
      await fetchLocation();
    };
    InitialLocation();
  }, []);

  const handleRegister = async () => {
    if (validateForm()) {
      let CanAdd = await CheckDataBase(); // Checks for existing user
      if (!location) {
        showToast('To use this app location is must ');
        await fetchLocation();
        return;
      }

      if (CanAdd) {
        try {
          // Prepare default data for new user
          let defaultData = {
            ...form,
            role: 'user',
            Status: 'Active',
            create_date: new Date().toISOString(), // Current date and time in ISO format
            coordination: {
              latitude: location?.latitude,
              longitude: location?.longitude,
            },
          };

          // Add new user to Firestore
          await firestore().collection('users').add(defaultData);
          showToast('Registration successful!');
          navigation.goBack();
        } catch (error) {
          showToast('Error creating user');
        } finally {
          setSpinner(false);
        }
      } else {
        showToast('User already exists');
        setSpinner(false);
      }
    } else {
      showToast('Some invalid data');
    }
  };

  const handleLogin = () => {
    // navigation.navigate('Login');
    navigation.goBack();
  };
  let screenName = 'Register';

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
            <BoldText style={styles.authHead}>Register To Safe Circle</BoldText>
            <LightText
              style={{
                marginTop: 10,
                textAlign: 'center',
                marginHorizontal: 10,
              }}>
              create your account with valid detail
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
              onChangeText={value => handleChange('name', value)}
              placeholder="Name"
              placeholderTextColor="#888"
              value={form?.name}
            />

            {errors.name && (
              <LightText style={[styles.errorText, {color: theme.colors.red}]}>
                {errors.name}
              </LightText>
            )}

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.onBackground,
                  borderColor: theme.colors.onBackground,
                },
              ]}
              onChangeText={value => handleChange('email', value)}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={form?.email}
            />

            {errors.email && (
              <LightText style={[styles.errorText, {color: theme.colors.red}]}>
                {errors.email}
              </LightText>
            )}

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
              value={form.password}
              onChangeText={value => handleChange('password', value)}
            />

            {errors.password && (
              <LightText style={[styles.errorText, {color: theme.colors.red}]}>
                {errors.password}
              </LightText>
            )}

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.onBackground,
                  borderColor: theme.colors.onBackground,
                },
              ]}
              placeholder="Contact Number"
              placeholderTextColor="#888"
              value={form.contactNumber}
              onChangeText={value => handleChange('contactNumber', value)}
            />

            {errors.contactNumber && (
              <LightText style={[styles.errorText, {color: theme.colors.red}]}>
                {errors.contactNumber}
              </LightText>
            )}

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.onBackground,
                  borderColor: theme.colors.onBackground,
                },
              ]}
              placeholder="Aadhar Number"
              placeholderTextColor="#888"
              value={form.aadhar_number}
              onChangeText={value => handleChange('aadhar_number', value)}
            />

            {errors.aadhar_number && (
              <LightText style={[styles.errorText, {color: theme.colors.red}]}>
                {errors.aadhar_number}
              </LightText>
            )}

            <View style={{paddingBottom: 50}}>
              <Button
                onPress={spinner ? () => {} : handleRegister}
                mode="contained"
                style={[
                  styles.btn,
                  {backgroundColor: theme.colors.onBackground},
                ]}>
                {spinner ? (
                  <ActivityIndicator
                    size={24}
                    color={theme.colors.background}
                  />
                ) : (
                  <BoldText style={{color: theme.colors.background}}>
                    Register
                  </BoldText>
                )}
              </Button>

              <View
                style={{
                  marginVertical: 2,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <LightText>Already have an account? </LightText>
                <TouchableOpacity onPress={handleLogin}>
                  <RegularText style={{color: theme.colors.blue}}>
                    Login
                  </RegularText>
                </TouchableOpacity>
              </View>
            </View>
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
    paddingVertical: 15,
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
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    bottom: 10,
  },
});
