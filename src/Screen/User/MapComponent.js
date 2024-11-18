// import { Button, Image, StyleSheet, Text, View } from 'react-native'
// import React, { useState } from 'react'
// import MapView, { Callout, Marker } from 'react-native-maps';

// export default function MapComponent() {
//    // State to manage map type
//    const [mapType, setMapType] = useState('standard'); // Default to 'standard'

//    const toggleMapType = () => {
//     // Toggle between 'standard' and 'satellite'
//     setMapType(mapType === 'standard' ? 'satellite' : 'standard');
//   };

//   const handleChange = (region) => {
//     console.log(region); // This will log the region whenever the map region changes
//   };

//   return (
//    <>

// <MapView
//         mapType={mapType} // Dynamically set map type
//         onRegionChange={handleChange}

// style={{flex:1}}
//   initialRegion={{
//     latitude: 37.78825,
//     longitude: -122.4324,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   }}
// >
//   {/* Marker */}
// {/*
//         <Marker
//   subtitleVisibility="visible"

//   coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
//   title="Custom Marker"
//   description="This is a custom marker"
//   image={{uri:'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-622.jpg?w=1380'}} // Custom image for the marker
// /> */}

// </MapView>
// <Button title={`Switch to ${mapType === 'standard' ? 'Satellite' : 'Standard'}`} onPress={toggleMapType} />
// <Button title="Go to Current Location" onPress={getCurrentLocation} />

//    </>
//   )
// }

// const styles = StyleSheet.create({});

import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, {Circle, Marker} from 'react-native-maps';
import {useAuthContext} from '../../context/GlobaContext';
import BoldText from '../../customText/BoldText';
import {Iconify} from 'react-native-iconify';
import {useTheme} from 'react-native-paper';
import RegularText from '../../customText/RegularText';
import firestore from '@react-native-firebase/firestore';
import {showToast} from '../../../utils/Toast';
import Geolocation from '@react-native-community/geolocation';

export default function MapComponent() {
  let theme = useTheme();

  const [location, setLocation] = useState(null);
  const [count, setCount] = useState(0);

  // const intervalRef = useRef(null);

  // useEffect(() => {
  //   // Only start the interval once, when the component mounts and not every time location or userDetail changes
  //   // if (intervalRef.current) {
  //   intervalRef.current = setInterval(async () => {
  //     if (location && userDetail?.id) {
  //       // Alert.alert("for 5 seconds")
  //       await fetchLocation();
  //       // console.log(location, 'location');
  //       await updateUserCoordinates(location); // Update location every 5 seconds
  //     }
  //   }, 9000); // Set interval for 5 seconds
  //   // }
  //   // Cleanup function to clear the interval when the component unmounts or location/userDetail changes
  //   return () => clearInterval(intervalRef.current);
  // }, [location, userDetail?.id]); // Only trigger the effect when location or userDetail changes

  let locationWatcher = null;
  let lastUpdateTime = 0; // Store the last update time

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
      // console.log('Checking user id:', userDetail?.id);

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

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startLocationUpdates();
        } else {
          console.log('Location permission denied');
          gotoSetting();
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

  const {psUser, fetchLocation, userDetail, gotoSetting} = useAuthContext();

  const [circleColor, setCircleColor] = useState('yellow');

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
    const isNearby = psUser.some(user => {
      const distance = getDistanceFromLatLonInMeters(
        userLocation.latitude,
        userLocation.longitude,
        user?.coordination?.latitude,
        user?.coordination?.longitude,
      );
      return distance <= 10; // 10 meters proximity
    });
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
  }, []); // Dependency array watches for location changes


  return (
    <View style={styles.mapWrapper}>
      {location ? (
        <MapView
          style={{flex: 1}}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true} // Shows the user's location on the map
        >
          {/* Display Other user */}

          {psUser && (
            <>
              {/* {markers.map(markers => (
                <Marker
                  subtitleVisibility="visible"
                  key={markers?.id}
                  coordinate={{
                    latitude: markers?.latitude,
                    longitude: markers?.longitude,
                  }}
                  title={markers.title}
                  description={markers.description}>
                  <Image
                    source={{
                      uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-622.jpg?w=1380',
                    }}
                    style={{width: 40, height: 40}}
                  />
                </Marker>
              ))} */}
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
                  <Image
                    source={{
                      uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-622.jpg?w=1380',
                    }}
                    style={{width: 40, height: 40}}
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
              }}>
              <Image
                source={{
                  uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-622.jpg?w=1380',
                }}
                style={{width: 40, height: 40, borderRadius: 20}}
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
            <BoldText style={{fontSize: 25}}>
              Fetching your location ..
            </BoldText>
            <Iconify
              icon="grommet-icons:map-location"
              size={100}
              color={theme.colors.onBackground}
            />
            <BoldText style={{fontSize: 25}}>Stay Safe!</BoldText>
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
});
