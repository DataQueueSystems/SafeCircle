import {Alert, BackHandler, Image, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {useTheme} from 'react-native-paper';
import BoldText from '../../customText/BoldText';
import {Iconify} from 'react-native-iconify';
import {useAuthContext} from '../../context/GlobaContext';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import TipsSheet from '../../Component/TipsSheet';
import MapComponent from './MapComponent';
import UserSheet from '../../Component/UserSheet';
import {showToast} from '../../../utils/Toast';
// import MapComponent from './Map';

export default function UserHome() {
  let theme = useTheme();
  const {handleLogout, userDetail} = useAuthContext();
  const bottomSheetRef = useRef(null);

  let navigation = useNavigation();

  const handleTipsPress = () => {
    bottomSheetRef.current?.expand(); // Use expand instead of open
  };

  const bottomSheetRef2 = useRef(null);
  const showMyDetail = () => {
    bottomSheetRef2.current?.expand(); // Use expand instead of open
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
        {/* Header */}
        <View style={styles.mainHeaderView}>
          <View>
            <BoldText style={[styles.headText1]}>Welcome to</BoldText>
            <BoldText style={styles.headText2}>Safe Circle</BoldText>
          </View>

          <View style={styles.tipsView}>
            <BoldText>Tips </BoldText>
            <Iconify
              onPress={handleTipsPress}
              icon="ph:info"
              size={24}
              color={'green'}
            />
          </View>
          <View style={styles.topIcons}>
            <View>
              <Iconify
                onPress={showMyDetail}
                icon="uim:user-md"
                size={28}
                color={'grey'}
              />
            </View>
            <Iconify
              onPress={handleLogout}
              icon="hugeicons:logout-03"
              size={28}
              color={theme.colors.onBackground}
            />
          </View>
        </View>


        {/* Display Map */}
        <MapComponent />
      </View>

      {/* Tips Sheet */}
      <TipsSheet bottomSheetRef={bottomSheetRef} />

      {/* Show the User Preview */}
      <UserSheet bottomSheetRef={bottomSheetRef2} userData={userDetail} />
    </>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    // paddingHorizontal: 8,
    paddingTop: 10,
  },
  headText1: {
    fontSize: 30,
    color: 'grey',
  },
  headText2: {
    fontSize: 25,
  },
  tipsView: {
    position: 'absolute',
    flexDirection: 'row',
    right: 2,
    top: 54,
    padding: 2,
    alignItems: 'center',
    elevation: 100,
  },

  mainHeaderView: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  topIcons: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
    paddingRight: 3,
    paddingTop: 10,
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 100,
  },
 
});
