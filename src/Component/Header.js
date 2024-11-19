import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Appbar, Button, Divider, Menu, TextInput} from 'react-native-paper';
import {useTheme} from 'react-native-paper';
import {View, StyleSheet} from 'react-native';

const Header = ({screenName}) => {
  let theme = useTheme();
  let navigation = useNavigation();
  const BackNavigation = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header >
        <Appbar.BackAction
          // color={theme.colors.blackGrey}
          color={theme.colors.onBackground}
          onPress={BackNavigation}
        />
        <Appbar.Content
          title={screenName}
          titleStyle={{
            fontSize: 18,
            fontFamily: 'Sora-SemiBold',
            // color: theme.colors.blackGrey,
            color: theme.colors.onBackground,

          }}
        />
      </Appbar.Header>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    width: '100%',
    shadowColor: '#000', // Color of the shadow (black)
    shadowOffset: {width: 0, height: 0}, // The distance of the shadow from the button
    shadowOpacity: 0.1, // Higher opacity for a more solid shadow
    shadowRadius: 10, // Bigger radius for a softer and larger shadow
    // Android shadow
    elevation: 3, // Elevation for Android (higher value for a deeper shadow)
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
});

export default Header;
