import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {TextInput, Button, useTheme} from 'react-native-paper';
import Header from '../../Component/Header';
import BoldText from '../../customText/BoldText';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import LightText from '../../customText/LightText';
import {useAuthContext} from '../../context/GlobaContext';
import {showToast} from '../../../utils/Toast';
import RegularText from '../../customText/RegularText';

export default function ControlUser({route}) {
  const {screenName, userData} = route.params || {};

  const {userDetail} = useAuthContext();
  const theme = useTheme();
  let navigation = useNavigation();
  const [spinner, setSpinner] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    password: userData?.password || '',
    diagnosis: {
      type: userData?.diagnosis?.type || '',
      status: userData?.diagnosis?.status || '',
    },
    contactNumber: userData?.contactNumber || '',
  });

  // Handle input changes for both top-level and nested fields
  const handleInputChange = (field, value, nestedField = null) => {
    if (nestedField) {
      // Update nested fields (e.g., diagnosis type and status)
      setForm(prevForm => ({
        ...prevForm,
        [field]: {
          ...prevForm[field],
          [nestedField]: value,
        },
      }));
    } else {
      // Update top-level fields
      setForm(prevForm => ({
        ...prevForm,
        [field]: value,
      }));
    }
  };

  let IsAdmin = userDetail?.role == 'admin' ? true : false; //disable some input for admin like password,email,name,contactNumber

  let showInputs = screenName === 'Add User' || screenName === 'Edit Detail';
  let showPass = screenName === 'Edit Detail';
  console.log(showPass, 'showPass');
  // Simple validation function
  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.diagnosis.type)
      newErrors.diagnosisType = 'Diagnosis type is required';
    if (!form.diagnosis.status)
      newErrors.status = 'Diagnosis status is required';

    if (!form.contactNumber)
      newErrors.contactNumber = 'Contact number is required';
    else if (!/^\d{10}$/.test(form.contactNumber))
      newErrors.contactNumber = 'Contact number must be 10 digits';
    setErrors(newErrors);
    setSpinner(false);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSpinner(true);
    try {
      if (validateForm()) {
        // Add new user
        let defaultData = {
          ...form,
          role: 'user',
          Status: 'Active',
          create_date: new Date().toISOString(), // Current date and time in ISO format
        };
        defaultData.addedBy = userDetail?.role == 'admin' ? 'Admin' : 'User';

        //If Edit Screen then update the detail otherwise Add new user
        if (screenName == 'Edit User') {
          // await firestore().collection('users');
          await firestore()
            .collection('users')
            .doc(userData?.id)
            .update(defaultData);
          showToast(IsAdmin ? 'User Updated  ..' : 'Profile Updated');
        } else {
          await firestore().collection('users').add(defaultData);
          showToast('User Added  ..');
        }
        setSpinner(false);

        // navigation.goBack();
      }
    } catch (error) {
      setSpinner(false);

      console.log('Error is :', error);
    }
  };

  // Update the status in the form
  const handleStatus = status => {
    setForm(prevForm => ({
      ...prevForm,
      diagnosis: {
        ...prevForm.diagnosis,
        status: status,
      },
    }));
  };
  const handleuserPress = () => {
    showToast("You can't change the Status");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header screenName={screenName} />
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          label="Name"
          disabled={!showInputs}
          value={form.name}
          onChangeText={value => handleInputChange('name', value)}
          style={styles.input}
          contentStyle={styles.inputContent}
          mode="outlined"
        />

        {errors.name && (
          <LightText style={[styles.errorText, {color: theme.colors.red}]}>
            {errors.name}
          </LightText>
        )}

        <TextInput
          label="Email"
          value={form.email}
          disabled={!showInputs}
          onChangeText={value => handleInputChange('email', value)}
          style={styles.input}
          contentStyle={styles.inputContent}
          mode="outlined"
          keyboardType="email-address"
        />

        {errors.email && (
          <LightText style={[styles.errorText, {color: theme.colors.red}]}>
            {errors.email}
          </LightText>
        )}

        {!IsAdmin || showInputs || showPass ? (
          <>
            <TextInput
              label="Password"
              value={form.password}
              onChangeText={value => handleInputChange('password', value)}
              style={styles.input}
              contentStyle={styles.inputContent}
              mode="outlined"
              secureTextEntry
            />

            {errors.password && (
              <LightText style={[styles.errorText, {color: theme.colors.red}]}>
                {errors.password}
              </LightText>
            )}
          </>
        ) : (
          <></>
        )}

        <TextInput
          label="Contact Number"
          value={form.contactNumber}
          disabled={!showInputs}
          onChangeText={value => handleInputChange('contactNumber', value)}
          style={styles.input}
          contentStyle={styles.inputContent}
          mode="outlined"
          keyboardType="phone-pad"
        />

        {errors.contactNumber && (
          <LightText style={[styles.errorText, {color: theme.colors.red}]}>
            {errors.contactNumber}
          </LightText>
        )}

        <TextInput
          label="Diagnosis Type"
          value={form.diagnosis.type}
          onChangeText={value => handleInputChange('diagnosis', value, 'type')}
          style={styles.input}
          contentStyle={styles.inputContent}
          mode="outlined"
        />

        {errors.diagnosisType && (
          <LightText style={[styles.errorText, {color: theme.colors.red}]}>
            {errors.diagnosisType}
          </LightText>
        )}

        {/* Diagnosis Status View */}
        <View style={styles.diagnosismainview}>
          <RegularText>Diagnosis Status</RegularText>
          <View style={styles.diagnosisStatus}>
            <TouchableOpacity
              activeOpacity={!IsAdmin ? 10 : 0.3}
              onPress={
                !IsAdmin ? handleuserPress : () => handleStatus('Positive')
              }
              style={[
                styles.statusBtn,
                {backgroundColor: !IsAdmin ? 'grey' : theme.colors.red},
                form?.diagnosis.status === 'Positive' && {
                  borderWidth: 2,
                  borderColor: theme.colors.onBackground, // Change to the color you want for the selected border
                },
              ]}>
              <BoldText style={styles.statusText}>Positive</BoldText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={!IsAdmin ? 10 : 0.3}
              onPress={
                !IsAdmin ? handleuserPress : () => handleStatus('Negative')
              }
              style={[
                styles.statusBtn,
                {backgroundColor: !IsAdmin ? 'grey' : theme.colors.green},
                form?.diagnosis.status === 'Negative' && {
                  borderWidth: 2,
                  borderColor: theme.colors.onBackground, // Change to the color you want for the selected border
                },
              ]}>
              <BoldText style={styles.statusText}>Negative</BoldText>
            </TouchableOpacity>
          </View>
        </View>

        {errors.status && (
          <LightText style={[styles.errorText, {color: theme.colors.red}]}>
            {errors.status}
          </LightText>
        )}

        <TouchableOpacity
          onPress={spinner ? () => {} : handleSubmit}
          style={[styles.button, {backgroundColor: theme.colors.onBackground}]}>
          {!spinner ? (
            <BoldText style={[{color: theme.colors.background, fontSize: 16}]}>
              Submit
            </BoldText>
          ) : (
            <ActivityIndicator size={24} color={theme.colors.background} />
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  input: {
    marginBottom: 15,
  },
  inputContent: {
    fontFamily: 'Sora-Regular', // Replace with the actual font family name
  },
  button: {
    marginTop: 20,
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    bottom: 10,
  },
  diagnosismainview: {},
  diagnosisStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    padding: 6,
    borderRadius: 100,
  },
  statusText: {
    textAlign: 'center',
    color: '#fff',
  },
});
