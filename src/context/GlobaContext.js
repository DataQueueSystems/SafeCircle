import {Alert, Linking, Platform, StyleSheet, Text, View} from 'react-native';
import React, {createContext, useContext, useEffect, useState} from 'react';
import NetInfo, {useNetInfoInstance} from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import {showToast} from '../../utils/Toast.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import notifee, {AndroidImportance} from '@notifee/react-native';
import Geolocation from 'react-native-geolocation-service';

const Authcontext = createContext();
export const AuthContextProvider = ({children}) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [allusers, setAllusers] = useState([]);  //for admin to manage the detail
  const [psUser, setPSuser] = useState([]);  //for user to dispaly position user in map

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
      // const unsubscribe =
       await firestore()
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

      // // Clean up the listener when the component unmounts or userToken changes
      // return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};
      unsubscribe = GetUserDetail();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [userDetail?.id]);

  const [location, setLocation] = useState(null);

  const gotoSetting = data => {
    Alert.alert(
      `${data} Permission Denied`,
      `Please grant permission for ${data} in the app settings to continue.`,
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
    return <></>;
  };

  const handlePermissionStatus = result => {
    switch (result) {
      case RESULTS.GRANTED:
        // showToast('Location permission granted');
        break;
      case RESULTS.DENIED:
        // showToast('Location permission denied');
        gotoSetting('Location');
        break;
      case RESULTS.BLOCKED:
        showToast(
          'Location permission is blocked; ask the user to enable it in settings',
        );
        gotoSetting('Location');
        break;
      case RESULTS.UNAVAILABLE:
        showToast('Location permission is unavailable on this device');
        gotoSetting('Location');
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

  const getCurrentLocation = async () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation(position.coords);
      },
      error => {
        showToast(error.message);
      },
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 0},
    );
  };

  const fetchLocation = async () => {
    const granted = await hasLocationPermission();
    if (granted) {
      // Get the user's current location
      await getCurrentLocation();
    } else {
      showToast('To use this app location is must');
    }
  };

  // const GetAllUser = async () => {
  //   try {
  //     const subscriber = firestore()
  //       .collection('users')
  //       .where('role', '==', 'user')
  //       .where('Status', '==', 'Active')
  //       .onSnapshot(snapshot => {
  //         let alluserDetail = snapshot.docs.map(snapdata => ({
  //           id: snapdata.id,
  //           ...snapdata.data(),
  //         }));
  //         setAllusers(alluserDetail);
  //         // Filter users with Positive diagnosis status
  //         const positiveStatusUser = alluserDetail.filter(
  //           user =>
  //             user.diagnosis?.status === 'Positive' &&
  //             user?.id != userDetail?.id,
  //         );
  //         setPSuser(positiveStatusUser); // Set the filtered list as needed
  //       });
  //     // Clean up the listener when the component unmounts
  //     return () => subscriber();
  //   } catch (error) {
  //     console.log('Error is:', error);
  //   }
  // };

  // useEffect(() => {
  //   let unsubscribe = () => {};
  //     unsubscribe = GetAllUser();
  //   return () => {
  //     if (unsubscribe && typeof unsubscribe === 'function') {
  //       unsubscribe();
  //     }
  //   };
  // }, [userDetail?.id]);


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
          onPress: async() => {
            setIsLogin(true);
            AsyncStorage.setItem('IsLogin', 'false');
            await AsyncStorage.removeItem("token");
            await AsyncStorage.clear();
            setUserDetail(null);
            showToast('Logout successfully!');
            // some logic
          },
        },
      ],
      {cancelable: false}, // Optionally prevent dismissing by tapping outside the alert
    );
  };

  const [isNPermission, setIsNPermission] = useState(false);

  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'd_alert', // Unique ID for this channel
      name: 'Diagnosis Alerts',
      sound: 'alert', // Custom sound file name without extension
      importance: AndroidImportance.HIGH,
    });
  };

  const requestNotificationPermission = async () => {
    try {
      const setting = await notifee.requestPermission();
      if (setting.authorizationStatus == 1) {
        console.log('Notification permission granted');
        setIsNPermission(true);
        await createNotificationChannel();
      } else {
        console.log('Notification permission denied');
        setIsNPermission(false);
        gotoSetting('Notifcation');
      }
    } catch (error) {
      console.log('error is :', error);
    }
  };

  useEffect(() => {
    const initializeNotifications = async () => {
      await requestNotificationPermission();
    };
    initializeNotifications();
  }, []);

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
        setAllusers,

        // all negative status user
        psUser,
        setPSuser,

        // logout func
        handleLogout,

        // Fetch location by gettings Permissition
        fetchLocation,

        // App user Location
        location,
        setLocation,
        gotoSetting,

        // Notifcation Permission
        isNPermission,
        requestNotificationPermission,
      }}>
      {children}
    </Authcontext.Provider>
  );
};

export const useAuthContext = () => useContext(Authcontext);
