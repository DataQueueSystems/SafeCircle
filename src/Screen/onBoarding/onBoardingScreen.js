import React from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import {Button, useTheme} from 'react-native-paper';
import {useAuthContext} from '../../context/GlobaContext';
import {useNavigation} from '@react-navigation/native';
import {showToast} from '../../../utils/Toast';
import BoldText from '../../customText/BoldText';
import {Iconify} from 'react-native-iconify';

const OnboardingScreen = ({}) => {
  let navigation = useNavigation();
  let windowWidth = Dimensions.get('window').width - 20;
  let windowHeight = Dimensions.get('window').height / 2.5;

  const {isLogin} = useAuthContext();
  let theme = useTheme();

  const handleBtnPress = () => {
    if (isLogin) {
      showToast('Login First');
      navigation.navigate('Login');
    } else {
      navigation.navigate('Home');
    }
  };
  let iconSize = 210;

  return (
    <Onboarding
      onSkip={handleBtnPress} // Replace 'HomeScreen' with your desired navigation target
      onDone={handleBtnPress} // Navigate after the last onboarding screen
      pages={[
        {
          backgroundColor: theme.colors.onBackground,
          title: (
            <View style={styles.contentIcons}>
              <Iconify
                icon="uis:coronavirus"
                size={iconSize}
                color={theme.colors.error}
              />
            </View>
          ),
          subtitle:
            'Stay informed, stay safe. Track your COVID-19 diagnostic results and receive timely alerts for your safety.',
          subTitleStyles: {
            fontFamily: 'Sora-Regular', // Replace with your desired font family for the subtitle
            fontSize: 17, // Customize font size if needed
            color: '#666', // Customize text color if needed
          },
        },
        {
          backgroundColor: theme.colors.onBackground,
          title: (
            <View style={styles.contentIcons}>
              <Iconify
                icon="carbon:heat-map"
                size={iconSize}
                color={theme.colors.error}
              />
            </View>
          ),
          subtitle:
            'Easily log your symptoms and diagnostic results to stay on top of your health and well-being.',
          subTitleStyles: {
            fontFamily: 'Sora-Regular',
            fontSize: 17, // Customize font size if needed
            color: '#666',
          },
        },
        {
          backgroundColor: theme.colors.onBackground,
          title: (
            <View style={styles.contentIcons}>
              <Iconify
                icon="hugeicons:safe"
                size={iconSize}
                color={theme.colors.error}
              />
            </View>
          ),
          subtitle: (
            <View>
              <Text
                style={{
                  marginBottom: 10,
                  marginHorizontal: 5,
                  fontFamily: 'Sora-Regular',
                  fontSize: 17, // Customize font size if needed
                  color: '#666',
                  textAlign: 'center',
                }}>
                Receive important notifications about COVID-19 updates, nearby
                cases, and safety measures.
              </Text>
              
            </View>
          ),
          titleStyles: {
            fontFamily: 'Sora-Bold',
            fontSize: 24,
            color: '#000',
          },
        },
      ]}
    />
  );
};
const styles = StyleSheet.create({
  btn: {
    padding: 4,
  },
  contentIcons: {
    // position: 'absolute',
    bottom: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default OnboardingScreen;
