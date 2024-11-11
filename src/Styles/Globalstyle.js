import { StyleSheet } from 'react-native';

const globalStyles = (theme) => StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal:12
  },
  shadow:{
     // Shadow for iOS
     shadowColor: '#000', // Change this to your desired shadow color
     shadowOffset: {
       width: 0,
       height: 1, // Slightly increase height for a less noticeable shadow
     },
     shadowOpacity: 0.05, // Lower opacity for a lighter shadow
     shadowRadius: 5, // Decrease radius for a less blurred shadow
     // Shadow for Android
    //  elevation: 1.5, // Lower elevation for less shadow on Android
  }
  
});

export default globalStyles;
