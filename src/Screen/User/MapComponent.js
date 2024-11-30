// import React, { useState } from 'react';
// import { View, Switch, StyleSheet } from 'react-native';
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

// const App = () => {
//   // Toggle between standard and dark mode styles
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   // Map Style JSON
//   const darkModeStyle = [
//     {
//       elementType: 'geometry',
//       stylers: [{ color: '#212121' }],
//     },
//     {
//       elementType: 'labels.icon',
//       stylers: [{ visibility: 'on' }],
//     },
//     {
//       elementType: 'labels.text.fill',
//       stylers: [{ color: '#757575' }],
//     },
//     {
//       elementType: 'labels.text.stroke',
//       stylers: [{ color: '#212121' }],
//     },
//     {
//       featureType: 'administrative',
//       elementType: 'geometry',
//       stylers: [{ color: '#757575' }],
//     },
//     {
//       featureType: 'water',
//       elementType: 'geometry',
//       stylers: [{ color: '#000000' }],
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       {/* MapView Component */}
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={{
//           latitude: 37.78825,
//           longitude: -122.4324,
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         }}
//         customMapStyle={isDarkMode ? darkModeStyle : []} // Apply styles
//       />
//       {/* Toggle Switch */}
//       <View style={styles.switchContainer}>
//         <Switch
//           value={isDarkMode}
//           onValueChange={(value) => setIsDarkMode(value)}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   switchContainer: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 10,
//   },
// });

// export default App;

import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Appearance,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Circle, Marker} from 'react-native-maps';
import {useAuthContext} from '../../context/GlobaContext';
import BoldText from '../../customText/BoldText';
import {Iconify} from 'react-native-iconify';
import {Button, Switch, useTheme} from 'react-native-paper';
import RegularText from '../../customText/RegularText';
import firestore from '@react-native-firebase/firestore';
import {showToast} from '../../../utils/Toast';
import Geolocation from 'react-native-geolocation-service';

import notifee from '@notifee/react-native';
import {useNavigation} from '@react-navigation/native';
import SemiBoldText from '../../customText/SemiBoldText';

export default function MapComponent() {
  
  let theme = useTheme();
  let navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [count, setCount] = useState(0);

  const {
    psUser,
    requestNotificationPermission,
    userDetail,
    gotoSetting,
    isNPermission,
  } = useAuthContext();
  let locationWatcher = null;
  let lastUpdateTime = 0; // Store the last update time
  const DisplayNotification = async () => {
    await notifee.displayNotification({
      title: 'Stay Alert!',
      body: 'Nearby diagnosed individuals have been detected. Please maintain distance and stay safe.',
      android: {
        channelId: 'd_alert',
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
          await updateUserCoordinates({latitude, longitude});
          // Update the last update time
          lastUpdateTime = currentTime;
        } else {
        }
      },
      error => {
        showToast(error?.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0, // Receive updates regardless of movement
        interval: 10000, // Update every 10 seconds
        fastestInterval: 10000, // Minimum time between updates (10 seconds)
        timeout: 15000, // Max time to wait for a position
      },
      // {enableHighAccuracy: true, timeout: 30000, maximumAge: 0},
    );
  };

  const updateUserCoordinates = async location => {
    try {
      if (userDetail?.id) {
        try {
          // Update coordinates in Firestore
          await firestore()
            .collection('users')
            .doc(userDetail?.id)
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
          showToast('Something went wrong ..');
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
      },
      error => {
        showToast(error.message);
      },
      // {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 0},
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
          await startLocationUpdates();
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
  }, [userDetail]);

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

  // Function to check proximity to any marker
  const checkProximity = userLocation => {
    // console.log(location);

    const isNearby = psUser?.some(user => {
      const distance = getDistanceFromLatLonInMeters(
        userLocation?.latitude,
        userLocation?.longitude,
        user?.coordination?.latitude,
        user?.coordination?.longitude,
      );
      return distance <= 10; // 10 meters proximity
    });
    if (isNearby) DisplayNotification();
    setCircleColor(
      isNearby ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 122, 255, 0.3)',
    );
  };

  // Fetch Location on Component Mount and Watch for Location Changes
  useEffect(() => {
    const fetchAndCheckProximity = async () => {
      showToast('Updating Latitude and longitude');
      if (location) {
        checkProximity(location);
      } else {
        // Alert.alert('Location not found....');
      }
    };
    // Call fetchAndCheckProximity on component mount
    fetchAndCheckProximity();
  }, [count]);

  let iconSize = 20;
  let textColor = {color: '#fff'};

  const handleLocation = () => {
    gotoSetting('Location');
  };
  const handleNotification = () => {
    requestNotificationPermission();
  };
  // Map Style JSON
  const darkModeStyle = [
    {
      elementType: 'geometry',
      stylers: [{color: '#212121'}],
    },
    // {
    //   elementType: 'labels.icon',
    //   stylers: [{visibility: 'on'}],
    // },
    {
      elementType: 'labels.text.fill',
      stylers: [{color: '#757575'}],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{color: '#212121'}],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{color: '#757575'}],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#000000'}],
    },
  ];

  return (
    <View style={styles.mapWrapper}>
      {location ? (
        <MapView
          style={{flex: 1}}
          // region={{
          //   latitude: location.latitude,
          //   longitude: location.longitude,
          //   latitudeDelta: 0.0025, // Extremely zoomed-in
          //   longitudeDelta: 0.0025, // Extremely zoomed-in
          // }}
          showsUserLocation={true} // Shows the user's location on the map
          customMapStyle={
            theme.colors.background == '#f7f7f7' ? [] : darkModeStyle
          } // Apply styles
        >
          {/* Display Other user */}
          {psUser && (
            <>
              {psUser?.map(user => (
                <Marker
                  subtitleVisibility="visible"
                  key={user?.id}
                  coordinate={{
                    latitude: user?.coordination?.latitude,
                    longitude: user?.coordination?.longitude,
                  }}
                  title={user?.name}
                  description={user?.name}>
                  <Iconify
                    icon="covid:covid19-virus-patient-2"
                    size={40}
                    color={theme.colors.red}
                  />
                </Marker>
              ))}
            </>
          )}
          {/* App user */}
          {location && (
            <Marker
              subtitleVisibility="visible"
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You">
              <Iconify
                icon="bi:people-circle"
                size={30}
                color={theme.colors.onBackground}
              />
            </Marker>
          )}

          {/* Blue Circle with 10m Radius */}
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={10} // 10 meters
            strokeColor={circleColor} // Dynamic color
            fillColor={circleColor} // Dynamic color
          />
        </MapView>
      ) : (
        <View style={styles.fetchView}>
          <ActivityIndicator size={55} color={theme.colors.onBackground} />
          <View style={styles.loadingContent}>
            <SemiBoldText style={{fontSize: 22}}>
              Fetching your location ..
            </SemiBoldText>
            <Iconify
              icon="grommet-icons:map-location"
              size={70}
              color={theme.colors.onBackground}
            />
            <BoldText style={{fontSize: 21}}>Stay Safe!</BoldText>
            <RegularText
              style={{
                fontSize: 13,
                marginTop: 10,
                marginHorizontal: 25,
                textAlign: 'center',
                color: theme.colors.onBackground,
              }}>
              Stay informed, and keep your health a priority during these times.
            </RegularText>
          </View>
        </View>
      )}

      {!isNPermission || location == null ? (
        <View
          style={[
            styles.Permissioncontainer,
            {backgroundColor: theme.colors.error},
          ]}>
          {location == null && (
            <View style={styles.row}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Iconify
                  icon="mage:location-fill"
                  size={iconSize}
                  color={'#fff'}
                />
                <RegularText style={[styles.text, textColor]}>
                  Location Permission Denied
                </RegularText>
              </View>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleLocation}>
                <RegularText style={[styles.text, textColor]}>
                  Settings
                </RegularText>
              </TouchableOpacity>
            </View>
          )}
          {!isNPermission && (
            <View style={styles.row}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Iconify
                  icon="solar:bell-outline"
                  size={iconSize}
                  color={'#fff'}
                />
                <RegularText style={[styles.text, textColor]}>
                  Notification Permission Denied
                </RegularText>
              </View>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleNotification}>
                <RegularText style={[styles.text, textColor]}>
                  Request / Settings
                </RegularText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    flex: 1,
    marginTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // Ensure that the map respects the border-radius
  },
  fetchView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  Permissioncontainer: {
    // alignItems: 'flex-start',
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 12,
  },
  actionBtn: {
    padding: 1.3,
    borderWidth: 0.2,
    borderRadius: 100,
    paddingHorizontal: 10,
  },
});
