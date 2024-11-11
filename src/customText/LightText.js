import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

const LightText = ({style, ...props}) => {
  return <Text style={[styles.text, style]} {...props} />;
};
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Sora-ExtraLight', // Replace with the actual font family name
  },
});

export default LightText;
