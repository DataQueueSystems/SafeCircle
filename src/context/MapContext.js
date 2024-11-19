import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {useAuthContext} from './GlobaContext';
import firestore from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import notifee, {AndroidImportance} from '@notifee/react-native';

const Mapcontext = createContext();
export const MapContextProvider = ({children}) => {
  const [location, setLocation] = useState(null);
  const [count, setCount] = useState(0);
  const {psUser, userDetail} = useAuthContext();

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



  let locationWatcher = null;
  let lastUpdateTime = 0; // Store the last update time

  const DisplayNotification = async () => {
    await notifee.displayNotification({
      title: 'Stay Alert!',
      body: 'Nearby diagnosed individuals have been detected. Please maintain distance and stay safe.',
      android: {
        channelId: 'd_alert',
        groupSummary: true,
      },
    });
  };

  const startLocationUpdates = () => {
    // Start watching position
    locationWatcher = Geolocation.watchPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        setLocation(position.coords);
        // Get the current timestamp
        const currentTime = new Date().getTime();
        // Check if the last update was more than 10 seconds ago
        if (currentTime - lastUpdateTime >= 10000) {
          // Call the function to update user coordinates in Firebase
          updateUserCoordinates({latitude, longitude});
          // Update the last update time
          lastUpdateTime = currentTime;
        } else {
        }
      },
      error => {
        console.log('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0, // Receive updates regardless of movement
        interval: 10000, // Update every 10 seconds
        fastestInterval: 10000, // Minimum time between updates (10 seconds)
        timeout: 15000, // Max time to wait for a position
      },
    );
  };

  const updateUserCoordinates = async location => {
    try {
      if (userDetail?.id) {
        try {
          // Update coordinates in Firestore
          await firestore()
            .collection('users')
            .doc(userDetail.id)
            .update({
              coordination: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
              count: count + 1, // Assuming `count` is defined somewhere
            });
          setCount(prev => prev + 1); // Update count in the state
          console.log('Updated coordinates in Firestore.');
        } catch (error) {
          console.log('Error updating coordinates:', error);
        }
      } else {
        console.log('User ID is not available.');
      }
    } catch (error) {
      console.error('Error in updating coordinates in Firebase: ', error);
    }
  };

  const getCurrentLocation = async () => {
    await Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation(position.coords);
        // console.log('Initial Position:', latitude, longitude);
      },
      error => {
        console.log('Error fetching current location:', error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await getCurrentLocation();
          startLocationUpdates();
        } else {
          console.log('Location permission denied');
          gotoSetting('Location');
        }
      } else {
        startLocationUpdates();
      }
    };
    requestPermission();
    return () => {
      // Clear watcher on component unmount
      if (locationWatcher) {
        Geolocation.clearWatch(locationWatcher);
      }
    };
  }, []);

  const [circleColor, setCircleColor] = useState('rgba(0, 122, 255, 0.3)');

  // Function to calculate distance between two points (Haversine formula)
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const checkProximity = userLocation => {
    const isNearby = psUser?.some(user => {
      const distance = getDistanceFromLatLonInMeters(
        userLocation.latitude,
        userLocation.longitude,
        user?.coordination?.latitude,
        user?.coordination?.longitude,
      );
      return distance <= 10;
    });
    if (isNearby) {
      DisplayNotification();
    }
    setCircleColor(
      isNearby ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 122, 255, 0.3)',
    );
  };

  // Fetch Location on Component Mount and Watch for Location Changes
  useEffect(() => {
    const fetchAndCheckProximity = async () => {
      showToast('Chages in Latitude and longitude');
      // await fetchLocation(); // Initial fetch
      // Check if location is available after fetching
      if (location) {
        checkProximity(location);
      } else {
        showToast('Location not found...');
        // Alert.alert('Location not found....');
      }
    };
    // Call fetchAndCheckProximity on component mount
    fetchAndCheckProximity();
  }, []);

  // Watch for changes in location and check proximity
  useEffect(() => {
    if (location) {
      checkProximity(location);
    } else {
    }
  }, [count]); // Dependency array watches for location changes

  let iconSize = 20;
  let textColor = {color: '#fff'};

  const handleLocation = () => {
    gotoSetting('Location');
  };
  const handleNotification = () => {
    requestNotificationPermission();
  };


  
  return (
    <Mapcontext.Provider
      value={{
        location,
        circleColor,
        isNPermission,
        iconSize,
        textColor,
        handleLocation,
        handleNotification,
        psUser,
      }}>
      {children}
    </Mapcontext.Provider>
  );
};

export const useMapContext = () => useContext(Mapcontext);
