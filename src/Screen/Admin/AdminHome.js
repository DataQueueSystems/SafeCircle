// import React, { useEffect, useState } from 'react';
// import { View, Text, PermissionsAndroid, Platform } from 'react-native';
// import Geolocation from '@react-native-community/geolocation';

// const App = () => {
//   const [location, setLocation] = useState(null);
//   const [count, setCount] = useState(0);
  
//   let locationWatcher = null;

//   useEffect(() => {
//     const requestPermission = async () => {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           startLocationUpdates();
//         } else {
//           console.log('Location permission denied');
//         }
//       } else {
//         startLocationUpdates();
//       }
//     };
//     requestPermission();
//     return () => {
//       // Clear watcher on component unmount
//       if (locationWatcher) {
//         Geolocation.clearWatch(locationWatcher);
//       }
//     };
//   }, []);

//   const startLocationUpdates = () => {
//     console.log('Count location:', count,);
//     // Start watching position
//     locationWatcher = Geolocation.watchPosition(
//       (position) => {
//         setLocation(position.coords);
//         setCount((count=>count+1))
//         console.log('Updated location:', position.coords,);
//       },
//       (error) => {
//         console.log('Location error:', error);
//       },
//       {
//         enableHighAccuracy: true,
//         distanceFilter: 0, // Receive updates regardless of movement
//         interval: 2000, // Update every 2 seconds
//         fastestInterval: 2000, // Minimum time between updates (2 seconds)
//         timeout: 10000, // Max time to wait for a position
//       }
//     );
//   };

//   return (
//     <View>
//       <Text>Live Location:</Text>
//       {location ? (
//         <Text>
//           Latitude: {location.latitude}, Longitude: {location.longitude}
//         </Text>
//       ) : (
//         <Text>Loading location...</Text>
//       )}
//     </View>
//   );
// };

// export default App;


import {BackHandler, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Text, useTheme} from 'react-native-paper';
import BoldText from '../../customText/BoldText';
import {Iconify} from 'react-native-iconify';
import SemiBoldText from '../../customText/SemiBoldText';
import RegularText from '../../customText/RegularText';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useAuthContext} from '../../context/GlobaContext';
import UserSheet from '../../Component/UserSheet';
import { showToast } from '../../../utils/Toast';

const RenderUser = (user, theme, showUserPrev) => {
  let isPositive = user?.diagnosis?.status == 'Positive' ? true : false;
  let addedDetail =
    user?.addedBy == 'Admin' ? 'Added by you ' : 'User himself registered';

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => showUserPrev(user)}
        style={[styles.singleUser, {backgroundColor: theme.colors.transpgrey}]}>
        <View style={{alignItems: 'center', flexDirection: 'row'}}>
          <Iconify icon="uim:user-md" size={35} color={'grey'} />
        </View>
        <View style={styles.userDetail}>
          <BoldText style={{fontSize: 15}}>{user?.name}</BoldText>
          <RegularText>{addedDetail}</RegularText>
        </View>
        {user?.diagnosis?.status && (
          <View
            style={[
              styles.statusView,
              {
                backgroundColor: isPositive
                  ? theme.colors.red
                  : theme.colors.green,
              },
            ]}>
            <RegularText style={{color: '#fff', fontSize: 13}}>
              {user?.diagnosis?.status}
            </RegularText>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};
export default function AdminHome() {
  let theme = useTheme();
  const {allusers, handleLogout} = useAuthContext();
  const [singleUser, setSingleUser] = useState(null);

  let navigation = useNavigation();
  const handlecontrol = () => {
    navigation.navigate('ControlUser', {screenName: 'Add User'});
  };

  const bottomSheetRef = useRef(null);
  
  const showUserPrev = userDetail => {
    let userData = userDetail;
    setSingleUser(userData);
    bottomSheetRef.current?.expand(); // Use expand instead of open
  };



  const backPressedOnce = useRef(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isFocused) {
          if (!backPressedOnce.current) {
            backPressedOnce.current = true;
            showToast("Tap again if you're ready to exit.");
            setTimeout(() => {
              backPressedOnce.current = false;
            }, 2000); // Reset backPressedOnce after 2 seconds
            return true;
          } else {
            BackHandler.exitApp(); // If tapped again within 2 seconds, exit the app
            return true;
          }
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [isFocused]);

  return (
    <>
      <View
        style={[
          styles.maincontainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <View style={styles.mainHeaderView}>
          <View>
            <BoldText style={[styles.headText1]}>Welcome to</BoldText>
            <BoldText style={styles.headText2}>Safe Circle</BoldText>
          </View>
          <View style={styles.topIcons}>
            <Iconify
              onPress={handlecontrol}
              icon="mynaui:pencil-solid"
              size={28}
              color={theme.colors.onBackground}
            />
            <Iconify
              onPress={handleLogout}
              icon="hugeicons:logout-03"
              size={28}
              color={theme.colors.onBackground}
            />
          </View>
        </View>

        <View style={styles.userMainContainer}>
          <SemiBoldText style={{fontSize: 17}}>All Users</SemiBoldText>

          <View style={styles.userContainer}>
            {allusers?.length == 0 ? (
              <>
                <View style={{marginVertical: 20}}>
                  <RegularText style={{textAlign: 'center'}}>
                    No User found
                  </RegularText>
                </View>
              </>
            ) : (
              <>
                <FlatList
                  data={allusers}
                  renderItem={({item}) => RenderUser(item, theme, showUserPrev)}
                />
              </>
            )}
          </View>
        </View>
      </View>

      {/* Show the User Preview */}
      <UserSheet bottomSheetRef={bottomSheetRef} userData={singleUser} />
    </>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  headText1: {
    fontSize: 30,
    color: 'grey',
  },
  headText2: {
    fontSize: 25,
  },

  mainHeaderView: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topIcons: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
    paddingRight: 3,
    paddingTop: 10,
  },
  userMainContainer: {
    marginTop: 25,
  },
  userContainer: {
    padding: 2,
    marginTop: 10,
    gap: 8,
  },
  singleUser: {
    flexDirection: 'row',
    backgroundColor: 'grey',
    gap: 6,
    padding: 9,
    borderRadius: 10,
    // elevation: 100,
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  userDetail: {
    gap: 4,
  },
  statusView: {
    position: 'absolute',
    right: 3,
    top: 3,
    borderRadius: 4,
    padding: 2,
    elevation: 5,
  },
});