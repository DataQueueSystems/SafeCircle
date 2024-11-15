import React, { useEffect, useState } from 'react';
import { View, Text, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const App = () => {
  const [location, setLocation] = useState(null);
  const [count, setCount] = useState(0);
  
  let locationWatcher = null;

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startLocationUpdates();
        } else {
          console.log('Location permission denied');
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

  const startLocationUpdates = () => {
    console.log('Count location:', count,);
    // Start watching position
    locationWatcher = Geolocation.watchPosition(
      (position) => {
        setLocation(position.coords);
        setCount((count=>count+1))
        console.log('Updated location:', position.coords,);
      },
      (error) => {
        console.log('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0, // Receive updates regardless of movement
        interval: 2000, // Update every 2 seconds
        fastestInterval: 2000, // Minimum time between updates (2 seconds)
        timeout: 10000, // Max time to wait for a position
      }
    );
  };

  return (
    <View>
      <Text>Live Location:</Text>
      {location ? (
        <Text>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </Text>
      ) : (
        <Text>Loading location...</Text>
      )}
    </View>
  );
};

export default App;
