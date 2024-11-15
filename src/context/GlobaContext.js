import {Alert, Linking, Platform, StyleSheet, Text, View} from 'react-native';
import React, {createContext, useContext, useEffect, useState} from 'react';
import NetInfo, {useNetInfoInstance} from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import {showToast} from '../../utils/Toast.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation'; // Import Geolocation
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const Authcontext = createContext();
export const AuthContextProvider = ({children}) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [allusers, setAllusers] = useState(null);
  const [psUser, setPSuser] = useState(null);

  const Checknetinfo = async () => {
    const state = await NetInfo.fetch(); // Get the current network state
    if (!state.isConnected) {
      showToast('No internet connection.', 'error');
      return false; // No internet connection
    }
    return true; // Internet connection is available
  };

  const GetUserDetail = async () => {
    const userToken = await AsyncStorage.getItem('token');

    if (!userToken) return;
    try {
      const unsubscribe = firestore()
        .collection('users') // Assuming agents are in the `users` collection
        .doc(userToken)
        .onSnapshot(async userDoc => {
          if (!userDoc.exists) {
            return;
          }
          const userData = {id: userDoc.id, ...userDoc.data()};
          // Set user details if the account is active
          await setUserDetail(userData);
        });

      // Clean up the listener when the component unmounts or userToken changes
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    GetUserDetail();
  }, []);

  const [location, setLocation] = useState(null);

  const gotoSetting = () => {
    Alert.alert(
      'Notification Permission Denied',
      'Please grant permission for notifications in the app settings to continue.',
      [
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
    );
  };

  const handlePermissionStatus = result => {
    switch (result) {
      case RESULTS.GRANTED:
        // showToast('Location permission granted');
        break;
      case RESULTS.DENIED:
        // showToast('Location permission denied');
        gotoSetting();
        break;
      case RESULTS.BLOCKED:
        showToast(
          'Location permission is blocked; ask the user to enable it in settings',
        );
        gotoSetting();
        break;
      case RESULTS.UNAVAILABLE:
        showToast('Location permission is unavailable on this device');
        gotoSetting();
        break;
      default:
        break;
    }
  };

  // Request Location Permission
  const hasLocationPermission = async () => {
    let permissions = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      }),
    );
    handlePermissionStatus(permissions);
    return permissions === 'granted';
  };

  const fetchLocation = async () => {
    const granted = await hasLocationPermission();
    if (granted) {
      // Get the user's current location
      Geolocation.getCurrentPosition(
        async position => {
          await setLocation(position.coords); // Update location state
        },
        error => {
          console.error('Error:', error.code, error.message);
          Alert.alert('Location Error', error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      showToast('To use this app location is must');
    }
  };

  // Fetch Location on Component Mount
  // useEffect(() => {
  //   fetchLocation();
  // }, []);

  const GetAllUser = async () => {
    try {
      const subscriber = firestore()
        .collection('users')
        .where('role', '==', 'user')
        .where('Status', '==', 'Active')
        .onSnapshot(snapshot => {
          let alluserDetail = snapshot.docs.map(snapdata => ({
            id: snapdata.id,
            ...snapdata.data(),
          }));
          setAllusers(alluserDetail);
          // Filter users with Positive diagnosis status
          const positiveStatusUser = alluserDetail.filter(
            user =>
              user.diagnosis?.status === 'Positive' &&
              user?.id != userDetail?.id,
          );
          setPSuser(positiveStatusUser); // Set the filtered list as needed
        });
      // Clean up the listener when the component unmounts
      return () => subscriber();
    } catch (error) {
      console.log('Error is:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = GetAllUser();
    return () => {
      if (unsubscribe) unsubscribe(); // Clean up to prevent memory leaks
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout', //title
      'Are you sure ,you want to logout ?', //message
      [
        {
          text: 'Cancel', // Cancel button
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK', // OK button
          onPress: () => {
            setIsLogin(true);
            AsyncStorage.setItem('IsLogin', 'false');
            AsyncStorage.clear();
            setUserDetail(null);
            showToast('Logout successfully!');
            // some logic
          },
        },
      ],
      {cancelable: false}, // Optionally prevent dismissing by tapping outside the alert
    );
  };

  return (
    <Authcontext.Provider
      value={{
        isLogin,
        setIsLogin,
        Checknetinfo,

        // User Detail
        userDetail,
        setUserDetail,

        // all user detail
        allusers,

        // all negative status user
        psUser,

        // logout func
        handleLogout,

        // Fetch location by gettings Permissition
        fetchLocation,

        // App user Location
        location,
        setLocation,
        gotoSetting,
      }}>
      {children}
    </Authcontext.Provider>
  );
};

export const useAuthContext = () => useContext(Authcontext);
