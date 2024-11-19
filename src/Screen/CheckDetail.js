import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Circle, Marker} from 'react-native-maps';

export default function CheckDetail() {
  return (
    <MapView
      style={{flex: 1}}
      region={{
        latitude: 12.871365,
        longitude: 74.84628,
        latitudeDelta: 0.0025, // Extremely zoomed-in
        longitudeDelta: 0.0025, // Extremely zoomed-in
      }}
      showsUserLocation={true} // Shows the user's location on the map
    >
      <Marker
        subtitleVisibility="visible"
        coordinate={{
          latitude: 12.871365,
          longitude: 74.84628,
        }}
        title="Your Location">
        <Image
          source={{
            uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-622.jpg?w=1380',
          }}
          style={{width: 40, height: 40, borderRadius: 20}}
        />
      </Marker>

      {/* Blue Circle with 10m Radius */}
      <Circle
        center={{
          latitude: 12.871365,
          longitude: 74.84628,
        }}
        radius={10} // 10 meters
        strokeColor={'green'} // Dynamic color
        fillColor={'green'} // Dynamic color
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
